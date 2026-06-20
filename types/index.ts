import { PortableTextBlock } from '@portabletext/types';

export interface SanityImage {
    asset: {
        _ref: string;
        url: string;
    };
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
}

export interface Galleria {
    _id: string;
    nome: string;
    opere: Opera[];
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