import { defineField, defineType } from 'sanity'

export const video = defineType({
    name: 'video',
    title: 'Video',
    type: 'document',
    fields: [
        defineField({ name: 'titolo', type: 'string' }),
        defineField({ name: 'data', type: 'date' }),
        defineField({
            name: 'url',
            title: 'URL YouTube',
            type: 'url',
            description: 'Inserisci il link del video (es. https://www.youtube.com/watch?v=...)'
        }),
    ],
    preview: {
        select: {
            title: 'titolo',
            subtitle: 'data'
        }
    }
})