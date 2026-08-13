import {at, defineMigration, setIfMissing} from 'sanity/migrate'

const initialTranslations = [
    {
        _key: 'it',
        _type: 'object',
        language: 'it',
        primaRiga: 'La sintesi di una riflessione,',
        secondaRiga: "la narrazione di un'esperienza.",
    },
    {
        _key: 'en',
        _type: 'object',
        language: 'en',
        primaRiga: 'The synthesis of a reflection,',
        secondaRiga: 'the narration of an experience.',
    },
    {
        _key: 'es',
        _type: 'object',
        language: 'es',
        primaRiga: 'La sintesis de una reflexion,',
        secondaRiga: 'la narracion de una experiencia.',
    },
]

export default defineMigration({
    title: 'Aggiunge le traduzioni iniziali al testo Header',
    documentTypes: ['header'],
    filter: '!defined(traduzioni)',
    migrate: {
        document() {
            return at('traduzioni', setIfMissing(initialTranslations))
        },
    },
})
