import { defineField, defineType } from 'sanity'

export const opera = defineType({
    name: 'opera',
    title: 'Opere',
    type: 'document',
    fields: [
        defineField({
            name: 'titolo',
            title: 'Titolo',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),        
        defineField({
            name: 'immagine',
            title: 'Immagine',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'descrizione',
            title: 'Descrizione',
            type: 'text',
        }),
    ],
})