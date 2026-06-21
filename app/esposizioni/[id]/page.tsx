import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import PostGallery from '@/components/PostGallery';
import { extractImages } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { Esposizione } from '@/types';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import Link from 'next/link';

// Query aggiornata per recuperare anche altre esposizioni per i "suggerimenti"
async function getEsposizioneCompleta(id: string) {
    const query = `{
    "esposizione": *[_type == "esposizione" && _id == $id][0],
    "altreEsposizioni": *[_type == "esposizione" && _id != $id][0..4] | order(data desc)    
}`;
    return await client.fetch(query, { id });
}

const components: PortableTextComponents = {
    types: {
        // 1. Diciamo al Portable Text di NON renderizzare le immagini nel flusso del testo
        image: () => null, // Ritorna null per nasconderla qui
    },
};

export default async function NotiziaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { esposizione, altreEsposizioni } = await getEsposizioneCompleta(id);

    if (!esposizione) return <div>Esposizione non trovata</div>;

    const images = extractImages(esposizione.contenuto);

    return (
        <main className="bg-[#1c1d26] text-white min-h-screen">

            {/* 1. Menu in alto (riutilizzato o identico a quello della home) */}
            <Header />

            {/* 2. Contenuto Principale */}
            <article className="max-w-3xl mx-auto py-24 px-6">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">{esposizione.titolo}</h1>
                <time className="text-sm opacity-50 mb-12 block uppercase tracking-widest">
                    {new Date(esposizione.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>

                <div className="prose prose-invert prose-lg max-w-none">
                    <PortableText value={esposizione.contenuto} components={components} />
                </div>

                {/* 4. SEZIONE GALLERIA SOTTOSTANTE */}
                {images.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-white/10">                        
                        <PostGallery images={images} />
                    </div>
                )}
            </article>

            {/* 3. Sezione Suggerimenti (Footer della pagina) */}
            {altreEsposizioni.length > 0 && (
                <section className="bg-[#272833] py-20 px-6 mt-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-end mb-10">
                            <h3 className="text-sm uppercase tracking-[0.2em] opacity-50">Altre Esposizioni</h3>
                            <Link
                                href="/esposizioni"
                                className="text-xs uppercase tracking-widest text-blue-400 hover:text-white transition-colors border-b border-blue-400/30 pb-1"
                            >
                                Vedi tutte le esposizioni →
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {altreEsposizioni.map((e: Esposizione) => (
                                <Link key={e._id} href={`/esposizioni/${e._id}`} className="group block border-t border-white/10 pt-6">
                                    <h4 className="text-lg mb-2 group-hover:text-blue-400 transition-colors">{e.titolo}</h4>
                                    <span className="text-[10px] uppercase opacity-40">Leggi di più →</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <Footer />
        </main>
    );
}