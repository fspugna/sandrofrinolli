import { defineField, defineType } from 'sanity'

export const galleria = defineType({
    name: 'galleria',
    title: 'Gallerie',
    type: 'document',
    fields: [
        // Sostituiamo il campo "nome" singolo con un array di traduzioni
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
                            ]
                        }
                    },
                    { name: 'nome', title: 'Nome Galleria', type: 'string' }
                ]
            }]
        }),
        defineField({
            name: 'opere',
            title: 'Opere',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'opera' }] }],
        }),
        defineField({
            name: 'copertina',
            title: 'Immagine di Copertina',
            type: 'reference',
            to: [{ type: 'opera' }],
            description: 'Seleziona l\'opera che apparirà come anteprima della galleria.',
        }),
    ],
    // Miglioriamo l'anteprima anche qui!
    preview: {
        select: {
            title: 'traduzioni.0.nome',
            media: 'copertina.immagine' // Sanity segue il riferimento all'opera per prendere l'immagine
        },
        prepare(selection) {
            return {
                title: selection.title || 'Galleria senza nome',
                media: selection.media
            };
        }
    }
})