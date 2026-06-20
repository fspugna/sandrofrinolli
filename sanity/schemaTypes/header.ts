import { defineField, defineType } from 'sanity'

export const header = defineType({
    name: 'header',
    title: 'Intestazione',
    type: 'document',
    fields: [             
        defineField({
            name: 'foto',
            title: 'Foto Homepage',
            type: 'image',
        }),
    ],
})