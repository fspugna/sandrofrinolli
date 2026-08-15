import {createClient} from '@sanity/client'
import {getCliClient} from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'vci8k9tk'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-20'
const token = process.env.SANITY_API_WRITE_TOKEN
const useCliToken = process.argv.includes('--use-cli-token')
const galleryId = 'legacy-galleria-37'
const execute = process.argv.includes('--execute')
const confirmation = process.argv.find((argument) => argument.startsWith('--confirm='))?.slice(10)

const client = useCliToken
  ? getCliClient({apiVersion})
  : createClient({projectId, dataset, apiVersion, token, useCdn: false})

const encodedLegacyTitles = new Set([
  'Q3VvcmU=', 'SGVhcnQ=', 'Rmlsb3NvZm8=', 'SXNsYW0=', 'SXJh', 'QW5nZXI=',
  'QXR0ZXNh', 'V2FpdGluZw==', 'RXNwZXJh', 'Q2FybmU=', 'TWVhdA==', 'QWZyaWNh',
  'TW9uYWNv', 'TcODwrJuYWNv', 'QXRlbmE=', 'VG90ZW0=', 'RGlzcHJlenpv',
  'Q29udGVtcHQ=', 'RGVzcHJlY2lv', 'SWwgRHViYmlv', 'VGhlIERvdWJ0', 'RHVkYQ==',
  'Q29uZnJvbnRv', 'Um91bmRuZXNz', 'UmVkb25kZXo=', 'QmFjaW8=', 'S2lzcw==',
  'QmVzbw==', 'Vm9sdG8=', 'RmFjZQ==', 'Q2FyYQ==',
])

function decodeBase64(value) {
	if (typeof value !== 'string') return value
	const compact = value.trim().replace(/\s+/g, '')
	if (!encodedLegacyTitles.has(compact)) return value
  if (!compact.length || compact.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return value

  const buffer = Buffer.from(compact, 'base64')
  if (buffer.toString('base64').replace(/=+$/, '') !== compact.replace(/=+$/, '')) return value

  const decoded = buffer.toString('utf8')
  if (decoded.includes('\uFFFD') || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(decoded)) return value
  return decoded
}

function repairMojibake(value) {
  let repaired = value
  for (let pass = 0; pass < 2 && /(?:Ã.|Â.|â.|ð.)/.test(repaired); pass += 1) {
    const candidate = Buffer.from(repaired, 'latin1').toString('utf8')
    if (candidate.includes('\uFFFD')) break
    repaired = candidate
  }
  return repaired
}

const exactCorrections = new Map([
  ['es:Corazòn', 'Corazón'],
  ['es:Filòsofo', 'Filósofo'],
  ['es:Mònaco', 'Mónaco'],
  ['es:La mujer estÃ de vuelta', 'La mujer está de vuelta'],
])

function cleanTitle(value, language) {
  const repaired = repairMojibake(decodeBase64(value))
  return exactCorrections.get(`${language}:${repaired}`)
    || exactCorrections.get(`${language}:${value}`)
    || repaired
}

const gallery = await client.fetch(
  '*[_id == $galleryId][0]{_id, "workIds":opere[]._ref}',
  {galleryId},
  {perspective: 'published'},
)

if (!gallery) throw new Error(`Galleria non trovata: ${galleryId}`)

const publishedIds = [...new Set((gallery.workIds || []).filter(Boolean))]
const documentIds = publishedIds.flatMap((id) => [id, `drafts.${id}`])
const documents = await client.fetch(
  '*[_id in $documentIds]{_id,_rev,traduzioni}',
  {documentIds},
  {perspective: 'raw'},
)

const patches = documents.flatMap((document) => {
  let translationsChanged = false
  const changes = []
  const traduzioni = (document.traduzioni || []).map((translation) => {
    const before = translation.titolo
    const after = cleanTitle(before, translation.language)
    if (after === before) return translation

    translationsChanged = true
    changes.push({language: translation.language, before, after})
    return {...translation, titolo: after}
  })

  return translationsChanged ? [{_id: document._id, _rev: document._rev, traduzioni, changes}] : []
})

console.log(JSON.stringify({
  projectId,
  dataset,
  galleryId,
  referencedWorks: publishedIds.length,
  documentsInspected: documents.length,
  documentsToPatch: patches.length,
  titlesToFix: patches.reduce((total, patch) => total + patch.changes.length, 0),
  patches: patches.map(({_id, changes}) => ({_id, changes})),
}, null, 2))

if (!execute) {
  console.log('Analisi completata: nessuna modifica a Sanity.')
  process.exit(0)
}
if (!token && !useCliToken) {
  throw new Error('Imposta SANITY_API_WRITE_TOKEN oppure esegui tramite sanity exec --with-user-token.')
}
if (confirmation !== 'FIX_VISIONI_TITLES') {
  throw new Error('Conferma mancante: usa --confirm=FIX_VISIONI_TITLES')
}

let transaction = client.transaction()
for (const patch of patches) {
  transaction = transaction.patch(patch._id, (operation) => operation
    .ifRevisionId(patch._rev)
    .set({traduzioni: patch.traduzioni}))
}
if (patches.length) await transaction.commit({visibility: 'sync'})

const validationDocuments = await client.fetch(
  '*[_id in $documentIds]{_id,traduzioni[]{language,titolo}}',
  {documentIds},
  {perspective: 'raw'},
)
const remainingIssues = validationDocuments.flatMap((document) => (document.traduzioni || [])
  .filter((translation) => cleanTitle(translation.titolo, translation.language) !== translation.titolo)
  .map((translation) => ({_id: document._id, language: translation.language, titolo: translation.titolo})))

if (remainingIssues.length) {
  throw new Error(`Validazione fallita: restano ${remainingIssues.length} titoli da correggere.`)
}
console.log(`Correzione completata: ${patches.length} documenti e ${patches.reduce((total, patch) => total + patch.changes.length, 0)} titoli aggiornati.`)
