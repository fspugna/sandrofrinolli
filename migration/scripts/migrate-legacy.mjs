import {createHash} from 'node:crypto'
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises'
import {basename, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'
import {JSDOM} from 'jsdom'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const sqlPath = join(root, 'migration/source/database/62_149_150_109.sql')
const legacyRoot = join(root, 'migration/source/oldsite/sandrofrinolli-oldsite')
const reportsDir = join(root, 'migration/reports')
const transformedDir = join(root, 'migration/transformed')
const targetDatabase = 'Sql400500_2'
const targetTypes = ['galleria', 'opera', 'notizia', 'recensione', 'esposizione']
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'vci8k9tk'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-20'
const token = process.env.SANITY_API_WRITE_TOKEN
const command = process.argv[2] || 'analyze'
const execute = process.argv.includes('--execute')
const confirmation = process.argv.find((arg) => arg.startsWith('--confirm='))?.slice(10)

const languages = [
  {language: 'it', title: 'TITOLO', body: 'TESTO'},
  {language: 'en', title: 'TITOLO_ENG', body: 'TESTO_ENG'},
  {language: 'es', title: 'TITOLO_ESP', body: 'TESTO_ESP'},
]

function stableKey(...parts) {
  return createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 12)
}

function documentId(type, sourceId) {
  return `legacy-${type}-${sourceId}`.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function decodeMysqlString(value) {
  return value.replace(/\\([0btnrZ'"\\%_])/g, (_, code) => ({
    0: '\0', b: '\b', t: '\t', n: '\n', r: '\r', Z: '\x1a',
    "'": "'", '"': '"', '\\': '\\', '%': '%', _: '_',
  })[code])
}

function *splitSqlStatements(sql) {
  let start = 0
  let quoted = false
  let escaped = false
  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === "'") quoted = false
    } else if (char === "'") quoted = true
    else if (char === ';') {
      yield sql.slice(start, index + 1).trim()
      start = index + 1
    }
  }
}

function parseTuples(input) {
  const rows = []
  let row = null
  let value = ''
  let quoted = false
  let escaped = false
  let depth = 0
  let wasQuoted = false
  const pushValue = () => {
    const raw = value.trim()
    row.push(wasQuoted ? decodeMysqlString(raw) : raw.toUpperCase() === 'NULL' ? null : raw)
    value = ''
    wasQuoted = false
  }
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quoted) {
      if (escaped) {
        value += `\\${char}`
        escaped = false
      } else if (char === '\\') escaped = true
      else if (char === "'") quoted = false
      else value += char
      continue
    }
    if (char === "'") {
      quoted = true
      wasQuoted = true
    } else if (char === '(') {
      if (depth === 0) row = []
      else value += char
      depth += 1
    } else if (char === ')' && depth > 0) {
      depth -= 1
      if (depth === 0) {
        pushValue()
        rows.push(row)
        row = null
      } else value += char
    } else if (char === ',' && depth === 1) pushValue()
    else if (depth > 0) value += char
  }
  return rows
}

function parseDump(sql) {
  const tables = new Map()
  let database = ''
  for (const statement of splitSqlStatements(sql)) {
    const use = statement.match(/(?:^|\n)USE\s+`([^`]+)`/i)
    if (use) database = use[1]
    if (database !== targetDatabase) continue
    const insert = statement.match(/(?:^|\n)INSERT INTO\s+`([^`]+)`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+);$/i)
    if (!insert) continue
    const columns = [...insert[2].matchAll(/`([^`]+)`/g)].map((match) => match[1])
    const records = parseTuples(insert[3]).map((values) => Object.fromEntries(columns.map((column, index) => [column, values[index]])))
    tables.set(insert[1], [...(tables.get(insert[1]) || []), ...records])
  }
  return tables
}

function maybeDecodeBase64(value) {
  if (typeof value !== 'string') return value
  const compact = value.trim().replace(/\s+/g, '')
  if (compact.length < 16 || compact.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return value
  try {
    const decoded = Buffer.from(compact, 'base64').toString('utf8')
    const printable = [...decoded].filter((char) => char === '\n' || char === '\r' || char === '\t' || char >= ' ').length / Math.max(decoded.length, 1)
    return printable > 0.94 && decoded.includes('�') === false ? decoded : value
  } catch {
    return value
  }
}

const entityDecoderDom = new JSDOM('<!doctype html><textarea></textarea>')
const entityDecoder = entityDecoderDom.window.document.querySelector('textarea')

function decodeEntities(value) {
  let result = maybeDecodeBase64(value || '')
  for (let pass = 0; pass < 2 && /&(?:lt|gt|amp|quot|#\d+|#x[0-9a-f]+);/i.test(result); pass += 1) {
    entityDecoder.innerHTML = result
    result = entityDecoder.value
    entityDecoder.textContent = ''
  }
  return result.replace(/\u0000/g, '').trim()
}

function plainText(value) {
  const html = decodeEntities(value)
  const dom = new JSDOM(`<body>${html}</body>`)
  const text = dom.window.document.body.textContent.replace(/\s+/g, ' ').trim()
  dom.window.close()
  return text
}

function cleanUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value, 'https://www.sandrofrinolli.com/')
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function htmlToPortableText(value, context) {
  const html = decodeEntities(value)
  const dom = new JSDOM(`<body>${html}</body>`)
  const document = dom.window.document
  const images = []
  for (const image of document.querySelectorAll('img')) {
    if (image.getAttribute('src')) images.push({src: image.getAttribute('src'), alt: image.getAttribute('alt') || ''})
    image.remove()
  }
  document.querySelectorAll('script,style,iframe,object,embed,form,button,input').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((node) => {
    for (const attribute of [...node.attributes]) {
      if (!['href', 'target'].includes(attribute.name.toLowerCase())) node.removeAttribute(attribute.name)
    }
  })
  const blocks = []
  let sequence = 0
  const addBlock = (node, style = 'normal', listItem, level) => {
    const children = []
    const markDefs = []
    const walkInline = (current, marks = []) => {
      if (current.nodeType === 3) {
        const text = current.nodeValue.replace(/\s+/g, ' ')
        if (text) children.push({_type: 'span', _key: stableKey(context, sequence, children.length, text), text, marks})
        return
      }
      if (current.nodeType !== 1) return
      const tag = current.tagName.toLowerCase()
      if (tag === 'br') {
        children.push({_type: 'span', _key: stableKey(context, sequence, children.length, 'br'), text: '\n', marks})
        return
      }
      let nextMarks = marks
      if (['strong', 'b'].includes(tag)) nextMarks = [...marks, 'strong']
      if (['em', 'i'].includes(tag)) nextMarks = [...marks, 'em']
      if (tag === 'u') nextMarks = [...marks, 'underline']
      if (['s', 'strike', 'del'].includes(tag)) nextMarks = [...marks, 'strike-through']
      if (tag === 'code') nextMarks = [...marks, 'code']
      if (tag === 'a') {
        const href = cleanUrl(current.getAttribute('href'))
        if (href) {
          const key = stableKey(context, sequence, 'link', href, markDefs.length)
          markDefs.push({_type: 'link', _key: key, href})
          nextMarks = [...marks, key]
        }
      }
      current.childNodes.forEach((child) => walkInline(child, nextMarks))
    }
    walkInline(node)
    while (children[0]?.text === ' ') children.shift()
    while (children.at(-1)?.text === ' ') children.pop()
    if (!children.some((child) => child.text.trim())) return
    const block = {_type: 'block', _key: stableKey(context, sequence++), style, markDefs, children}
    if (listItem) Object.assign(block, {listItem, level})
    blocks.push(block)
  }
  const process = (node, listItem, level = 1) => {
    if (node.nodeType === 3) {
      if (node.nodeValue.trim()) addBlock(node)
      return
    }
    if (node.nodeType !== 1) return
    const tag = node.tagName.toLowerCase()
    if (tag === 'ul' || tag === 'ol') {
      ;[...node.children].filter((child) => child.tagName === 'LI').forEach((child) => process(child, tag === 'ul' ? 'bullet' : 'number', level))
    } else if (tag === 'li') {
      const clone = node.cloneNode(true)
      clone.querySelectorAll(':scope > ul, :scope > ol').forEach((nested) => nested.remove())
      addBlock(clone, 'normal', listItem, level)
      ;[...node.children].filter((child) => ['UL', 'OL'].includes(child.tagName)).forEach((child) => process(child, null, level + 1))
    } else if (/^h[1-6]$/.test(tag)) addBlock(node, tag)
    else if (tag === 'blockquote') addBlock(node, 'blockquote')
    else if (['p', 'div', 'section', 'article', 'pre'].includes(tag)) addBlock(node, tag === 'pre' ? 'normal' : 'normal')
    else if (tag === 'hr') return
    else if ([...node.children].some((child) => /^(P|DIV|H[1-6]|UL|OL|BLOCKQUOTE|SECTION|ARTICLE|PRE)$/.test(child.tagName))) node.childNodes.forEach((child) => process(child))
    else addBlock(node)
  }
  document.body.childNodes.forEach((node) => process(node))
  dom.window.close()
  return {blocks, images}
}

async function fileIndex(directory) {
  const index = new Map()
  const walk = async (current) => {
    for (const entry of await readdir(current, {withFileTypes: true})) {
      const fullPath = join(current, entry.name)
      if (entry.isDirectory()) await walk(fullPath)
      else if (!fullPath.toLowerCase().includes(`${join('images', 'thumbs').toLowerCase()}`)) index.set(entry.name.toLowerCase(), fullPath)
    }
  }
  await walk(directory)
  return index
}

function sourceToAsset(source, files) {
  if (!source) return null
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(source)) {
    const [header, payload] = source.split(',', 2)
    const mime = header.match(/^data:([^;]+)/i)?.[1] || 'image/jpeg'
    return {buffer: Buffer.from(payload.replace(/\s/g, ''), 'base64'), filename: `embedded-${stableKey(payload)}.${mime.split('/')[1].replace('jpeg', 'jpg')}`, mime}
  }
  let filename
  try { filename = decodeURIComponent(basename(new URL(source, 'https://legacy.invalid/').pathname)) } catch { filename = basename(source) }
  const originalFilename = filename.replace(/^thumb_/i, '')
  const path = files.get(originalFilename.toLowerCase()) || files.get(filename.toLowerCase())
  if (path) return {path, filename: originalFilename}
  try {
    const url = new URL(source)
    if (['http:', 'https:'].includes(url.protocol)) return {url: url.href, filename: originalFilename || `remote-${stableKey(url.href)}.jpg`}
  } catch {}
  return null
}

async function buildMigration() {
  const sql = await readFile(sqlPath, 'utf8')
  const tables = parseDump(sql)
  const files = await fileIndex(legacyRoot)
  const galleries = tables.get('tb_gallery') || []
  const works = tables.get('tb_img') || []
  const workByGallery = works.reduce((groups, row) => {
    const key = String(row.ID_GALLERIA)
    groups.set(key, [...(groups.get(key) || []), row])
    return groups
  }, new Map())
  const assetSources = new Map()
  const missingAssets = new Set()
  const addAsset = (source, owner, alt = '') => {
    const asset = sourceToAsset(source, files)
    if (!asset) {
      missingAssets.add(`${owner}: ${source}`)
      return null
    }
    const key = asset.path ? `file:${asset.path.toLowerCase()}` : asset.url ? `url:${asset.url}` : `data:${stableKey(asset.buffer.toString('base64'))}`
    if (!assetSources.has(key)) assetSources.set(key, {...asset, key, owners: [], alt})
    assetSources.get(key).owners.push(owner)
    return key
  }
  const documents = []
  const ordinaryGalleries = galleries.filter((row) => Number(row.ESPOSIZIONE) === 0)
  for (const gallery of ordinaryGalleries) {
    const galleryWorks = workByGallery.get(String(gallery.ID_GALLERIA)) || []
    for (const work of galleryWorks) addAsset(work.NOME_FILE, `opera:${work.id_img}`)
  }
  const convertContentTable = (tableName, type, idField) => {
    for (const row of tables.get(tableName) || []) {
      const collected = new Map()
      const translations = languages.map(({language, title, body}) => {
        const converted = htmlToPortableText(row[body], `${type}:${row[idField]}:${language}`)
        converted.images.forEach(({src, alt}) => {
          const key = addAsset(src, `${type}:${row[idField]}`, alt)
          if (key) collected.set(key, alt)
        })
        return {_type: 'object', _key: language, language, titolo: plainText(row[title]), contenuto: converted.blocks}
      })
      if (type === 'esposizione' && row.ID_GALLERIA) {
        for (const work of workByGallery.get(String(row.ID_GALLERIA)) || []) {
          const key = addAsset(work.NOME_FILE, `${type}:${row[idField]}:gallery`, plainText(work.TITOLO))
          if (key) collected.set(key, plainText(work.TITOLO))
        }
      }
      documents.push({_id: documentId(type, row[idField]), _type: type, traduzioni: translations, data: row.DATA_INS, _assetKeys: [...collected].map(([key, alt]) => ({key, alt}))})
    }
  }
  convertContentTable('tb_news', 'notizia', 'id_news')
  convertContentTable('tb_recensioni', 'recensione', 'id_recensione')
  convertContentTable('tb_esposizioni', 'esposizione', 'id_esposizione')
  for (const gallery of ordinaryGalleries) {
    const galleryWorks = workByGallery.get(String(gallery.ID_GALLERIA)) || []
    for (const work of galleryWorks) {
      const assetKey = addAsset(work.NOME_FILE, `opera:${work.id_img}`)
      documents.push({
        _id: documentId('opera', work.id_img), _type: 'opera', _assetKey: assetKey,
        traduzioni: [
          {_type: 'object', _key: 'it', language: 'it', titolo: plainText(work.TITOLO), descrizione: plainText(work.DESCRIZIONE)},
          {_type: 'object', _key: 'en', language: 'en', titolo: plainText(work.TITLE), descrizione: plainText(work.DESCRIPTION)},
          {_type: 'object', _key: 'es', language: 'es', titolo: plainText(work.TITULO), descrizione: plainText(work.DESCRIPCION)},
        ],
      })
    }
    const cover = galleryWorks.find((work) => Number(work.copertina) === 1)
    documents.push({
      _id: documentId('galleria', gallery.ID_GALLERIA), _type: 'galleria',
      traduzioni: [
        {_type: 'object', _key: 'it', language: 'it', nome: plainText(gallery.NOME_GALLERIA)},
        {_type: 'object', _key: 'en', language: 'en', nome: plainText(gallery.GALLERY_NAME)},
        {_type: 'object', _key: 'es', language: 'es', nome: plainText(gallery.NOMBRE_GALERIA)},
      ],
      opere: galleryWorks.map((work) => ({_type: 'reference', _key: String(work.id_img), _ref: documentId('opera', work.id_img)})),
      ...(cover ? {copertina: {_type: 'reference', _ref: documentId('opera', cover.id_img)}} : {}),
    })
  }
  return {tables, documents, assetSources, missingAssets}
}

function clientForWrite() {
  if (!token) throw new Error('Imposta SANITY_API_WRITE_TOKEN con un token Editor o superiore.')
  return createClient({projectId, dataset, apiVersion, token, useCdn: false})
}

function collectAssetRefs(value, refs = new Set()) {
  if (!value || typeof value !== 'object') return refs
  if (typeof value._ref === 'string' && /^(image|file)-/.test(value._ref)) refs.add(value._ref)
  Object.values(value).forEach((child) => collectAssetRefs(child, refs))
  return refs
}

async function cleanup(client) {
  // The default query perspective can overlay or omit drafts. Cleanup needs the
  // raw document set so both published IDs and drafts.* IDs enter the mutation.
  const existing = await client.fetch(
    '*[_type in $types]',
    {types: targetTypes},
    {perspective: 'raw'},
  )
  const existingIds = new Set(existing.map((doc) => doc._id))
  const externalReferences = await client.fetch(
    '*[references($ids) && !(_id in $ids)]{_id, _type}',
    {ids: [...existingIds]},
    {perspective: 'raw'},
  )
  if (externalReferences.length > 0) {
    throw new Error(`Pulizia bloccata da riferimenti esterni: ${JSON.stringify(externalReferences)}`)
  }
  const assetIds = [...existing.reduce((refs, doc) => collectAssetRefs(doc, refs), new Set())]
  // Delete reference owners and targets atomically. Splitting this into batches
  // lets Sanity reject an earlier batch when a draft in a later batch still has
  // a strong reference to one of its documents.
  if (existing.length > 0) {
    let transaction = client.transaction()
    existing.forEach((doc) => { transaction = transaction.delete(doc._id) })
    await transaction.commit({visibility: 'sync'})
  }
  let deletedAssets = 0
  for (const assetId of assetIds) {
    const references = await client.fetch('count(*[references($assetId)])', {assetId})
    if (references === 0) {
      await client.delete(assetId)
      deletedAssets += 1
    }
  }
  return {documents: existing.length, assets: deletedAssets}
}

async function uploadAssets(client, assets) {
  const references = new Map()
  const failures = []
  for (const asset of assets.values()) {
    try {
      let body = asset.buffer || (asset.path ? await readFile(asset.path) : null)
      let contentType = asset.mime
      if (asset.url) {
        const response = await fetch(asset.url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(30_000),
          headers: {'user-agent': 'SandroFrinolli-Sanity-Migration/1.0'},
        })
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
        contentType = response.headers.get('content-type')?.split(';')[0] || undefined
        if (contentType && !contentType.startsWith('image/')) throw new Error(`Content-Type non immagine: ${contentType}`)
        body = Buffer.from(await response.arrayBuffer())
      }
      const uploaded = await client.assets.upload('image', body, {filename: asset.filename, contentType})
      references.set(asset.key, uploaded._id)
    } catch (error) {
      failures.push({source: asset.url || asset.path || asset.filename, owners: asset.owners, error: error.message})
    }
  }
  return {references, failures}
}

async function importDocuments(client, documents, assets) {
  const ready = documents.map((source) => {
    const doc = structuredClone(source)
    if (doc._assetKey) {
      const ref = assets.get(doc._assetKey)
      const alt = doc.traduzioni?.find((item) => item.language === 'it')?.titolo || ''
      if (ref) doc.immagine = {_type: 'image', asset: {_type: 'reference', _ref: ref}, ...(alt ? {alt} : {})}
      delete doc._assetKey
    }
    if (doc._assetKeys) {
      doc.immagini = doc._assetKeys.flatMap(({key, alt}, index) => {
        const ref = assets.get(key)
        return ref ? [{_type: 'image', _key: stableKey(doc._id, key, index), asset: {_type: 'reference', _ref: ref}, ...(alt ? {alt} : {})}] : []
      })
      delete doc._assetKeys
    }
    return doc
  })
  for (let offset = 0; offset < ready.length; offset += 50) {
    let transaction = client.transaction()
    ready.slice(offset, offset + 50).forEach((doc) => { transaction = transaction.createOrReplace(doc) })
    await transaction.commit({visibility: 'deferred'})
  }
}

async function writeReport(migration) {
  await mkdir(reportsDir, {recursive: true})
  await mkdir(transformedDir, {recursive: true})
  const counts = Object.fromEntries([...migration.tables].map(([name, rows]) => [name, rows.length]))
  const documentCounts = migration.documents.reduce((groups, doc) => {
    groups[doc._type] ||= []
    groups[doc._type].push(doc)
    return groups
  }, {})
  const report = {
    generatedAt: new Date().toISOString(), sourceDatabase: targetDatabase, projectId, dataset,
    sourceCounts: counts,
    targetCounts: Object.fromEntries(Object.entries(documentCounts).map(([type, docs]) => [type, docs.length])),
    uniqueAssets: migration.assetSources.size,
    localAssets: [...migration.assetSources.values()].filter((asset) => !asset.url).length,
    remoteAssetsToDownload: [...migration.assetSources.values()].filter((asset) => asset.url).map((asset) => asset.url),
    missingAssets: [...migration.missingAssets],
  }
  await writeFile(join(reportsDir, 'analysis.json'), `${JSON.stringify(report, null, 2)}\n`)
  const preview = migration.documents.map((source) => {
    const doc = {...source}
    delete doc._assetKey
    delete doc._assetKeys
    return doc
  })
  await writeFile(join(transformedDir, 'preview.ndjson'), `${preview.map((doc) => JSON.stringify(doc)).join('\n')}\n`)
  return report
}

async function main() {
  if (!['analyze', 'cleanup', 'migrate'].includes(command)) throw new Error(`Comando non valido: ${command}`)
  const migration = await buildMigration()
  const report = await writeReport(migration)
  console.log(JSON.stringify(report, null, 2))
  if (command === 'analyze' || !execute) {
    if (command !== 'analyze') console.log('Dry-run: nessuna modifica a Sanity. Aggiungi --execute e la conferma richiesta.')
    return
  }
  const expected = command === 'cleanup' ? 'DELETE_PRODUCTION_CONTENT' : 'MIGRATE_PRODUCTION_CONTENT'
  if (confirmation !== expected) throw new Error(`Conferma mancante: usa --confirm=${expected}`)
  const client = clientForWrite()
  const removed = await cleanup(client)
  console.log(`Pulizia completata: ${removed.documents} documenti e ${removed.assets} asset eliminati.`)
  if (command === 'cleanup') return
  const {references: assets, failures} = await uploadAssets(client, migration.assetSources)
  await writeFile(join(reportsDir, 'asset-download-failures.json'), `${JSON.stringify(failures, null, 2)}\n`)
  await importDocuments(client, migration.documents, assets)
  console.log(`Migrazione completata: ${migration.documents.length} documenti e ${assets.size} asset caricati. Download falliti: ${failures.length}.`)
}

main().catch((error) => {
  console.error(error.stack || error.message)
  process.exitCode = 1
})
