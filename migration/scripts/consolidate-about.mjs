import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'vci8k9tk'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-20'
const token = process.env.SANITY_API_WRITE_TOKEN
const execute = process.argv.includes('--execute')
const confirmation = process.argv.find((argument) => argument.startsWith('--confirm='))?.slice(10)
const singletonId = 'about'

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})
const published = await client.fetch(
  '*[_type == "about" && !(_id in path("drafts.**"))] | order(_createdAt asc){...}',
  {},
  {perspective: 'published'},
)

if (!published.length) throw new Error('Nessun documento about pubblicato trovato.')

const primary = published.find((document) => document.traduzioni?.some((item) => item.language === 'it'))
  || published.find((document) => document.language === 'it')
  || published[0]
const translations = new Map()

for (const document of published) {
  for (const translation of document.traduzioni || []) {
    if (translation.language && !translations.has(translation.language)) {
      translations.set(translation.language, translation)
    }
  }
}

for (const document of published) {
  if (!document.language || translations.has(document.language) || !document.titolo || !document.biografia) continue
  translations.set(document.language, {
    _type: 'object',
    _key: document.language,
    language: document.language,
    titolo: document.titolo,
    biografia: document.biografia,
  })
}

const orderedTranslations = ['it', 'en', 'es']
  .flatMap((language) => translations.has(language) ? [{...translations.get(language), _key: language}] : [])

const singleton = {
  _id: singletonId,
  _type: 'about',
  traduzioni: orderedTranslations,
  ...(primary.foto ? {foto: primary.foto} : {}),
  ...(primary.sfondo ? {sfondo: primary.sfondo} : {}),
}
const missingLanguages = ['it', 'en', 'es'].filter((language) => !translations.has(language))

console.log(JSON.stringify({
  projectId,
  dataset,
  sourceDocuments: published.map(({_id, language, titolo}) => ({_id, language, titolo})),
  targetId: singletonId,
  migratedLanguages: orderedTranslations.map(({language, titolo}) => ({language, titolo})),
  missingLanguages,
  hasPhoto: Boolean(singleton.foto),
  hasBackground: Boolean(singleton.sfondo),
}, null, 2))

if (!execute) {
  console.log('Analisi completata: nessuna modifica a Sanity.')
  process.exit(0)
}
if (!token) throw new Error('Imposta SANITY_API_WRITE_TOKEN con un token Editor o superiore.')
if (confirmation !== 'CONSOLIDATE_PRODUCTION_ABOUT') {
  throw new Error('Conferma mancante: usa --confirm=CONSOLIDATE_PRODUCTION_ABOUT')
}

const rawDocuments = await client.fetch('*[_type == "about"]{_id}', {}, {perspective: 'raw'})
let transaction = client.transaction().createOrReplace(singleton)
for (const {_id} of rawDocuments) {
  if (_id !== singletonId) transaction = transaction.delete(_id)
}
await transaction.commit({visibility: 'sync'})

const validation = await client.fetch('*[_id == "about"][0]{_id,"languages":traduzioni[].language}')
if (validation?._id !== singletonId || !validation.languages?.includes('it')) {
  throw new Error('Validazione post-migrazione fallita.')
}
console.log(`Consolidamento completato: ${rawDocuments.length} documenti sostituiti dal singleton "about".`)
console.log(`Lingue disponibili: ${validation.languages.join(', ')}${missingLanguages.length ? `. Da completare: ${missingLanguages.join(', ')}` : ''}.`)
