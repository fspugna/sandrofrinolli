import type {StructureResolver} from 'sanity/structure'

const singletonTypes = new Set(['about'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenuti')
    .items([
      S.listItem()
        .id('about')
        .title('Chi è')
        .child(S.document().schemaType('about').documentId('about').title('Chi è')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !singletonTypes.has(item.getId() ?? ''),
      ),
    ])
