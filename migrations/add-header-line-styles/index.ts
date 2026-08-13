import {at, defineMigration, setIfMissing} from 'sanity/migrate'

export default defineMigration({
    title: 'Aggiunge gli stili configurabili alle righe Header',
    documentTypes: ['header'],
    migrate: {
        document() {
            return [
                at('stilePrimaRiga', setIfMissing({carattere: 'sans', stile: 'normale', peso: 'leggero', dimensione: 'grande', colore: 'bianco'})),
                at('stileSecondaRiga', setIfMissing({carattere: 'serif', stile: 'corsivo', peso: 'leggero', dimensione: 'grande', colore: 'bianco'})),
            ]
        },
    },
})
