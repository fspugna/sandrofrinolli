import { defineField, defineType } from 'sanity'

export const galleria = defineType({
    name: 'galleria',
    title: 'Gallerie',
    type: 'document',
    fields: [
        defineField({
            name: 'nome',
            title: 'Nome Galleria',
            type: 'string',
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
})