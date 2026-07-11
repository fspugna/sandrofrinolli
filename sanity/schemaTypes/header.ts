import { defineField, defineType } from 'sanity'

export const header = defineType({
    name: 'header',    
    type: 'document',
    fields: [             
        defineField({
            name: 'foto',
            title: 'Foto Homepage',
            type: 'image',
        }),
    ],
    preview: {
        select: {
            media: 'foto',
        },
        prepare({ media }) {
            return {
                title: 'Header Homepage',
                media,
            }
        },
    },
})
