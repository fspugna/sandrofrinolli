import { client } from '@/sanity/lib/client';
import GallerieList from '@/components/GallerieList';

export default async function GalleriePage() {
    const gallerie = await client.fetch(`
    *[_type == "galleria"] {
        _id,
        nome,      
        "copertina": copertina->immagine, 
        opere[]->{ _id } // Prendiamo solo gli ID per il conteggio
    }
`);

    return <GallerieList initialGallerie={gallerie} />;
}