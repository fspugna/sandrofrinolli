import { client } from '@/sanity/lib/client';
import { Header } from '@/components/Header';
import GalleriaView from '@/components/GalleriaView'; // Importa il componente client
import AltreGallerie from '@/components/AltreGallerie';
import { Footer } from '@/components/Footer';

export default async function GalleriaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // 1. Esegui la query QUI (Server Side)
    const galleria = await client.fetch(`
        *[_type == "galleria" && _id == $id][0] {
            nome,
            "opere": opere[]->{_id, titolo, immagine, descrizione}
        }
    `, { id });

    if (!galleria) return <main>Galleria non trovata</main>;

    // 2. Passa i dati al componente client
    return (
        <main className="bg-[#1c1d26] min-h-screen text-white">
            <Header />
            <section className="max-w-7xl mx-auto px-6 py-16">                
                <h1 className="text-4xl md:text-5xl font-serif mb-6">{galleria.nome}</h1>
                <GalleriaView galleria={galleria} />

                <AltreGallerie currentId={id} />
            </section>
            <Footer />
        </main>
    );
}