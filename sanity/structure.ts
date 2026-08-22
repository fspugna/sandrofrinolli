import {GenerateIcon} from '@sanity/icons/Generate'
import {SortIcon} from '@sanity/icons/Sort'
import {SyncIcon} from '@sanity/icons/Sync'
import type {ConfigContext} from 'sanity'
import type {Child, StructureBuilder, StructureResolver} from 'sanity/structure'
import {SyncableOrderableDocumentList} from './components/SyncableOrderableDocumentList'

const singletonTypes = new Set(['about', 'header'])
const orderableTypes = new Set(['notizia', 'recensione', 'esposizione', 'video'])

function syncableOrderableList(
  S: StructureBuilder,
  context: ConfigContext,
  type: string,
  title: string,
) {
  const id = `orderable-${type}`
  const perspectiveStack = Reflect.get(context, 'perspectiveStack')
  const currentVersion = Array.isArray(perspectiveStack) ? perspectiveStack[0] : undefined
  const client = context.getClient({apiVersion: '2026-06-20'})
  const menuItems = [
    S.menuItem().title(`Crea ${title}`).intent({type: 'create', params: {type}}).serialize(),
    S.menuItem().title('Reset Order').icon(GenerateIcon).action('resetOrder').serialize(),
    S.menuItem()
      .title('Sincronizza ordine da Pubblicato')
      .icon(SyncIcon)
      .action('syncPublishedOrder')
      .serialize(),
    S.menuItem().title('Toggle Increments').icon(SortIcon).action('showIncrements').serialize(),
  ]

  const orderablePane = Object.assign(
    S.documentTypeList(type)
      .canHandleIntent((_intentName, params) => params?.type === type)
      .serialize(),
    {
      __preserveInstance: true,
      key: id,
      type: 'component' as const,
      component: SyncableOrderableDocumentList,
      options: {type, client, currentVersion},
      menuItems,
    },
  ) as Child

  return S.listItem()
    .id(id)
    .title(title)
    .schemaType(type)
    .child(orderablePane)
}

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
      syncableOrderableList(S, context, 'notizia', 'Notizie'),
      syncableOrderableList(S, context, 'recensione', 'Recensioni'),
      syncableOrderableList(S, context, 'esposizione', 'Esposizioni'),
      syncableOrderableList(S, context, 'video', 'Video'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => {
          const id = item.getId() ?? ''
          return !singletonTypes.has(id) && !orderableTypes.has(id)
        },
      ),
    ])
