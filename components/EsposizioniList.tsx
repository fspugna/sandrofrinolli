'use client';
import { urlFor } from '@/sanity/lib/image';
import { Esposizione, SanityImage } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function EsposizioniList({ initialEsposizioni }: { initialEsposizioni: Esposizione[] }) {
    const [esposizioni] = useState<Esposizione[]>(initialEsposizioni);

    const getFirstImage = (esposizione: Esposizione): SanityImage | null => {
        return (esposizione.contenuto?.find((block) => block._type === 'image') as unknown as SanityImage) || null;
    };

    return (
        <main className="bg-[#1c1d26] min-h-screen">            
            <section className="max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-serif mb-16 text-white">Esposizioni</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {esposizioni.map((e) => {
                        const coverImage = getFirstImage(e);
                        return (
                            <Link key={e._id} href={`/esposizioni/${e._id}`} className="group flex flex-col h-full bg-[#272833] rounded-2xl overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-300">
                                <div className="h-60 w-full overflow-hidden bg-gray-800">
                                    {coverImage ? (
                                        <Image
                                            src={urlFor(coverImage).url()}
                                            alt={e.titolo || "Immagine esizione"}
                                            width={400}
                                            height={240}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><span>Nessuna immagine</span></div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <time className="text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-4 block">
                                        {new Date(e.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </time>
                                    <h2 className="text-xl font-serif leading-snug mb-6 group-hover:text-blue-400 transition-colors">{e.titolo}</h2>
                                    <span className="mt-auto text-xs uppercase tracking-widest opacity-50 border-b border-white/20 pb-1 self-start">Scopri di più</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}