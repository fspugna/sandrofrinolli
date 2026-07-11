import { defineField, defineType } from 'sanity'

export const video = defineType({
    name: 'video',
    title: 'Video',
    type: 'document',
    fields: [
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
                        }
                    },
                    { name: 'titolo', type: 'string', title: 'Titolo' }
                ]
            }]
        }),
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
            title: 'traduzioni.0.titolo',
            subtitle: 'data'
        }
    }
})
