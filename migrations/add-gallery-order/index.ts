import {at, defineMigration, setIfMissing} from 'sanity/migrate'

const initialOrderById: Record<string, number> = {
    'legacy-galleria-37': 10,
    'legacy-galleria-89': 20,
    'legacy-galleria-90': 30,
    'legacy-galleria-92': 40,
}

export default defineMigration({
    title: 'Aggiunge l’ordine iniziale alle gallerie',
    documentTypes: ['galleria'],
    filter: '!defined(ordine)',
    migrate: {
        document(document) {
            const initialOrder = initialOrderById[document._id]

            if (initialOrder === undefined) return

            return at('ordine', setIfMissing(initialOrder))
        },
    },
})
