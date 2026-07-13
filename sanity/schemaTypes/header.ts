import { defineField, defineType } from 'sanity'

export const header = defineType({
    name: 'header',
    type: 'document',
    fields: [
        defineField({
            name: 'fotoHeader',
            title: 'Foto Homepage (Casuali)',
            type: 'array',
            of: [{ type: 'image' }],
            options: {
                layout: 'grid'
            }
        }),
    ],
    preview: {
        select: {
            images: 'fotoHeader',
        },
        prepare({ images }) {
            return {
                title: 'Header Homepage',
                subtitle: `${images ? images.length : 0} immagini caricate`,
                media: images && images.length > 0 ? images[0] : undefined,
            }
        },
    },
})
