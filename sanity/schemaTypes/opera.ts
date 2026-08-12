import { defineField, defineType } from 'sanity'

export const opera = defineType({
    name: 'opera',
    title: 'Opera',
    type: 'document',
    fields: [        
        defineField({
            name: 'immagine',
            title: 'Immagine',
            type: 'image', // Carichi l'immagine una sola volta qui
            options: { hotspot: true },
            fields: [
                defineField({ name: 'alt', type: 'string', title: 'Testo alternativo' }),
            ],
        }),
        defineField({
            name: 'audio',
            title: 'Traccia Audio / Commento Sonoro',
            type: 'file',
            options: {
                accept: 'audio/*', // Accetta solo file audio (mp3, wav, m4a, ecc.)
            },
            fields: [
                defineField({
                    name: 'titolo',
                    type: 'string',
                    title: 'Titolo o etichetta audio (opzionale)',
                    description: 'Es. "Guida all\'ascolto" o "Traccia d\'ambiente"',
                }),
            ],
        }),
        defineField({
            name: 'traduzioni',
            title: 'Traduzioni',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    {
                        name: 'language',
                        title: 'Lingua',
                        type: 'string',
                        options: {
                            list: [
                                { title: 'Italiano', value: 'it' },
                                { title: 'English', value: 'en' },
                                { title: 'Español', value: 'es' }
                            ],
                            // Opzionale: layout: 'radio' lo renderebbe una scelta a pulsanti invece di una tendina
                        }
                    },
                    { name: 'titolo', type: 'string', title: 'Titolo' },
                    { name: 'descrizione', type: 'text', title: 'Descrizione' }
                ]
            }]
        })
    ],
    preview: {
        select: {
            title: 'traduzioni.0.titolo', // Prende il titolo del primo elemento dell'array (es. l'italiano)
            media: 'immagine',           // Usa il campo immagine come miniatura
        },
        prepare(selection) {
            const { title, media } = selection;
            return {
                title: title || 'Opera senza titolo', // Fallback se il titolo manca
                media: media,
            };
        },
    },
})
