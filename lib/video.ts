import { VideoTranslation } from '@/types'

export function getLocalizedVideoTitle(
    translations: VideoTranslation[] | null | undefined,
    lang: string,
    fallbackTitle?: string | null
) {
    const safeTranslations = Array.isArray(translations) ? translations : []

    const localizedTitle = safeTranslations.find(
        (translation) => translation.language === lang && translation.titolo?.trim()
    )?.titolo

    if (localizedTitle) {
        return localizedTitle
    }

    return safeTranslations.find((translation) => translation.titolo?.trim())?.titolo
        || fallbackTitle?.trim()
        || 'Video senza titolo'
}
