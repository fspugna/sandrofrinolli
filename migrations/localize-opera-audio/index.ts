import {at, defineMigration, setIfMissing} from 'sanity/migrate'

type Translation = {
    _key?: string
    language?: string
    audio?: unknown
}

type OperaDocument = {
    audio?: unknown
    traduzioni?: Translation[]
}

export default defineMigration({
    title: 'Sposta l’audio delle opere nella traduzione italiana',
    documentTypes: ['opera'],
    filter: 'defined(audio.asset)',
    migrate: {
        document(document) {
            const opera = document as OperaDocument
            const italian = opera.traduzioni?.find(
                (translation) => translation.language === 'it',
            )

            if (!opera.audio || !italian?._key || italian.audio) return

            return at(
                ['traduzioni', {_key: italian._key}, 'audio'],
                setIfMissing(opera.audio),
            )
        },
    },
})
