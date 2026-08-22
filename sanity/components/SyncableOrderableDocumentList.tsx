import {OrderableDocumentList} from '@sanity/orderable-document-list'
import {useToast} from '@sanity/ui/toast'
import {useImperativeHandle, useRef, type Ref} from 'react'
import type {SanityClient} from 'sanity'

type OrderableListOptions = {
  type: string
  client: SanityClient
  currentVersion?: string
}

type OrderableListHandle = {
  actionHandlers: {
    resetOrder: () => Promise<void>
    showIncrements: () => void
  }
}

export type SyncableOrderableListHandle = {
  actionHandlers: OrderableListHandle['actionHandlers'] & {
    syncPublishedOrder: () => Promise<void>
  }
}

type Props = {
  options?: Record<string, unknown>
  ref?: Ref<SyncableOrderableListHandle>
}

type RankedDocument = {
  _id: string
  orderRank?: string
}

export function SyncableOrderableDocumentList({options: rawOptions, ref}: Props) {
    const options = rawOptions as unknown as OrderableListOptions
    const orderableListRef = useRef<OrderableListHandle>(null)
    const toast = useToast()

    useImperativeHandle(ref, () => ({
      actionHandlers: {
        resetOrder: async () => {
          await orderableListRef.current?.actionHandlers.resetOrder()
        },
        showIncrements: () => {
          orderableListRef.current?.actionHandlers.showIncrements()
        },
        syncPublishedOrder: async () => {
          try {
            const [publishedDocuments, draftIds] = await Promise.all([
              options.client.fetch<RankedDocument[]>(
                `*[_type == $type && !(_id in path("drafts.**"))]{_id, orderRank}`,
                {type: options.type},
              ),
              options.client.fetch<string[]>(
                `*[_type == $type && _id in path("drafts.**")]._id`,
                {type: options.type},
              ),
            ])

            const publishedRanks = new Map(
              publishedDocuments.map((document) => [document._id, document.orderRank]),
            )

            const transaction = draftIds.reduce((currentTransaction, draftId) => {
              const publishedId = draftId.replace(/^drafts\./, '')
              const publishedRank = publishedRanks.get(publishedId)

              return publishedRank
                ? currentTransaction.patch(draftId, {set: {orderRank: publishedRank}})
                : currentTransaction.patch(draftId, {unset: ['orderRank']})
            }, options.client.transaction())

            if (draftIds.length > 0) {
              await transaction.commit({
                tag: 'orderable-document-list.sync-published-order',
                visibility: 'async',
              })
            }

            toast.push({
              status: 'success',
              title: draftIds.length > 0
                ? `Ordine sincronizzato in ${draftIds.length} bozze`
                : 'Nessuna bozza da sincronizzare',
              closable: true,
            })
          } catch (error) {
            console.error('Impossibile sincronizzare l’ordine pubblicato', error)
            toast.push({
              status: 'error',
              title: 'Sincronizzazione non riuscita',
              description: error instanceof Error ? error.message : 'Errore sconosciuto',
              closable: true,
            })
          }
        },
      },
    }), [options, toast])

    return <OrderableDocumentList ref={orderableListRef} options={options} />
}
