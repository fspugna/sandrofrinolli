import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

const singletonTypes = new Set(['about', 'header'])
const orderableTypes = new Set(['notizia', 'recensione', 'esposizione', 'video'])

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Contenuti')
    .items([
      S.listItem()
        .id('about')
        .title('Chi è')
        .child(S.document().schemaType('about').documentId('about').title('Chi è')),
      S.listItem()
        .id('header')
        .title('Header Homepage')
        .child(S.document().schemaType('header').documentId('header').title('Header Homepage')),
      S.divider(),
      orderableDocumentListDeskItem({type: 'notizia', title: 'Notizie', S, context}),
      orderableDocumentListDeskItem({type: 'recensione', title: 'Recensioni', S, context}),
      orderableDocumentListDeskItem({type: 'esposizione', title: 'Esposizioni', S, context}),
      orderableDocumentListDeskItem({type: 'video', title: 'Video', S, context}),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => {
          const id = item.getId() ?? ''
          return !singletonTypes.has(id) && !orderableTypes.has(id)
        },
      ),
    ])
