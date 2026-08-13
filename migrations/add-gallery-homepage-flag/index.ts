import {at, defineMigration, setIfMissing} from 'sanity/migrate'

export default defineMigration({
    title: 'Abilita le gallerie esistenti in homepage',
    documentTypes: ['galleria'],
    filter: '!defined(mostraInHomepage)',
    migrate: {
        document() {
            return at('mostraInHomepage', setIfMissing(true))
        },
    },
})
