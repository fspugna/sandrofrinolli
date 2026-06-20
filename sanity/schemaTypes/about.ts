import { defineField, defineType } from 'sanity'

export const about = defineType({
    name: 'about',
    title: 'Chi sono',
    type: 'document',
    fields: [
        defineField({
            name: 'titolo',
            title: 'Titolo',
            type: 'string',
        }),
        defineField({
            name: 'biografia',
            title: 'Biografia',
            type: 'array', // Cambia da 'text' a 'array'
            of: [{ type: 'block' }]
        }),
        defineField({
            name: 'foto',
            title: 'Foto Artista',
            type: 'image',
        }),
    ],
})