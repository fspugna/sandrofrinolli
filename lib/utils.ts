import { SanityImage } from "@/types";

export function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function extractImages(content: SanityImage[]): SanityImage[] {
    // Assicurati che l'oggetto filtrato rispetti SanityImage
    return content.filter((block): block is SanityImage => block._type === 'image');
}