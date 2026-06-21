import { PortableTextBlock } from '@portabletext/types';

// 1. Tipo base per ogni immagine proveniente da Sanity
export interface SanityImage {
    _type: 'image';
    _key?: string; // Utile per le liste in PortableText
    asset: {
        _ref: string;
    };
    alt?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    crop?: any;    // Sanity li aggiunge automaticamente se usati
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hotspot?: any;
}

// 2. Interfaccia unica per le componenti che renderizzano immagini
export interface PortableImageProps {
    value: SanityImage;
    className?: string;
}

export interface Header {
    foto: SanityImage;
}

export interface About {
    titolo: string;
    biografia: PortableTextBlock[];
    foto: SanityImage;
}

export interface SocialItem {
    nome: string;
    url: string;
}

export interface Contatti {
    telefono: string;
    email: string;
    fotoUrl: string;
    social: SocialItem[];
}

export interface Esposizione {
    _id: string;
    titolo: string;
    data: string;
    contenuto: PortableTextBlock[];
}

export interface Notizia {
    _id: string;
    titolo: string;
    data: string;
    contenuto: PortableTextBlock[];
}

export interface Recensione {
    _id: string;
    titolo: string;
    data: string;
    contenuto: PortableTextBlock[];
}

export interface Opera {
    _id: string;
    titolo: string;
    immagine: SanityImage;
    descrizione: string;
}

export interface Galleria {
    _id: string;
    nome: string;
    opere: Opera[];
    copertina: SanityImage;
}

export interface Video {  
    _id: string;
    titolo: string;
    data: string,
    url: string;
}

export interface HomeData {
    header: Header;
    about: About;
    gallerie: Galleria[];
    video: Video[];
    esposizioni: Esposizione[];
    notizie: Notizia[];
    recensioni: Recensione[];
    contatti: Contatti;
}