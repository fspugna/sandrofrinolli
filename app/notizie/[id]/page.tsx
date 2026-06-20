import { client } from '@/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { Notizia } from '@/types';
import Link from 'next/link';
import MainMenu from '@/components/MainMenu';

// Query aggiornata per recuperare anche altre notizie per i "suggerimenti"
async function getNotiziaCompleta(id: string) {
    const query = `{
    "notizia": *[_type == "notizia" && _id == $id][0],
    "altreNotizie": *[_type == "notizia" && _id != $id][0..4] | order(data desc)
}`;
    return await client.fetch(query, { id });
}

export default async function NotiziaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { notizia, altreNotizie } = await getNotiziaCompleta(id);

    if (!notizia) return <div>Notizia non trovata</div>;

    return (
        <main className="bg-[#1c1d26] text-white min-h-screen">

            {/* 1. Menu in alto (riutilizzato o identico a quello della home) */}
            <div className="w-full px-6 py-12 flex justify-between items-center border-b border-white/10">
                <MainMenu />
            </div>

            {/* 2. Contenuto Principale */}
            <article className="max-w-3xl mx-auto py-24 px-6">
                <h1 className="text-4xl md:text-5xl font-serif mb-6">{notizia.titolo}</h1>
                <time className="text-sm opacity-50 mb-12 block uppercase tracking-widest">
                    {new Date(notizia.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>

                <div className="prose prose-invert prose-lg max-w-none">
                    <PortableText value={notizia.contenuto} />
                </div>
            </article>

            {/* 3. Sezione Suggerimenti (Footer della pagina) */}
            {altreNotizie.length > 0 && (
                <section className="bg-[#272833] py-20 px-6 mt-12">
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-sm uppercase tracking-[0.2em] opacity-50 mb-10">Altre Notizie</h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            {altreNotizie.map((n: Notizia) => (
                                <Link key={n._id} href={`/notizie/${n._id}`} className="group block border-t border-white/10 pt-6">
                                    <h4 className="text-lg mb-2 group-hover:text-blue-400 transition-colors">{n.titolo}</h4>
                                    <span className="text-[10px] uppercase opacity-40">Leggi di più →</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}