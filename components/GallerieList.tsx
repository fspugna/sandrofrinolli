'use client';
import { Header } from '@/components/Header';
import { urlFor } from '@/sanity/lib/image';
import { Galleria } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Footer } from './Footer';

export default function GallerieList({ initialGallerie }: { initialGallerie: Galleria[] }) {
    const [gallerie] = useState<Galleria[]>(initialGallerie);

    return (
        <main className="bg-[#1c1d26] min-h-screen">
            <Header />
            <section className="max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-serif mb-16 text-white">Gallerie</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {gallerie.map((g) => {
                        return (
                            <Link
                                key={g._id}
                                href={`/gallerie/${g._id}`}
                                className="group flex flex-col h-full bg-[#272833] rounded-2xl overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-300"
                            >
                                <div className="h-60 w-full overflow-hidden bg-gray-800">
                                    {g.copertina ? (
                                        <Image
                                            src={urlFor(g.copertina).url()}
                                            alt={g.nome}
                                            width={400}
                                            height={240}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20 text-white">
                                            <span>Nessuna opera</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    {/* Titolo: assicuriamo che sia bianco brillante */}
                                    <h2 className="text-xl font-serif leading-snug text-white group-hover:text-blue-400 transition-colors">
                                        {g.nome}
                                    </h2>

                                    {/* Conteggio opere: aumentiamo leggermente l'opacità o il colore per migliorarne la visibilità */}
                                    <p className="mt-2 text-xs uppercase tracking-widest text-white/60">
                                        {g.opere?.length || 0} Opere
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
            <Footer />
        </main>
    );
}