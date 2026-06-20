import { defineField, defineType } from 'sanity'

export const notizia = defineType({
    name: 'notizia',
    title: 'Notizie',
    type: 'document',
    fields: [
        defineField({ name: 'titolo', type: 'string' }),
        defineField({ name: 'data', type: 'date' }),
        defineField({
            name: 'contenuto',
            title: 'Contenuto (Testo e Immagini)',
            type: 'array',
            of: [
                { type: 'block' }, // Permette testo, grassetti, elenchi
                { type: 'image' }   // Permette di inserire immagini tra i paragrafi
            ]
        })
    ],
    preview: {
        select: {
            title: 'titolo',
            subtitle: 'data'
        }
    }
})