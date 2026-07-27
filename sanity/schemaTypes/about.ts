import { defineField, defineType } from 'sanity'

export const about = defineType({
    name: 'about',
    title: 'Chi è',
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
                        options: { list: ['it', 'en', 'es'] }
                    },
                    { name: 'titolo', title: 'Titolo', type: 'string' },
                    { name: 'biografia', title: 'Biografia', type: 'array', of: [{ type: 'block' }] }
                ]
            }]
        }),
        defineField({ name: 'foto', title: 'Foto Artista', type: 'image' }),
        defineField({ name: 'sfondo', title: 'Sfondo sezione', type: 'image' }),
    ],
})