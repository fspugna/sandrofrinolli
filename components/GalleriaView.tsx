'use client';
import { urlFor } from '@/sanity/lib/image';
import { Galleria, Opera } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/styles.css";

export type GalleriaViewProps = {
    galleria: Galleria;
}

export default function GalleriaView({ galleria }: { galleria: Galleria }) {
    const [index, setIndex] = useState(-1);

    const slides = galleria.opere.map((opera: Opera) => ({
        src: urlFor(opera.immagine).url(),
        alt: opera.titolo,
        title: opera.titolo, // Titolo che apparirà nel lightbox
        description: opera.descrizione || "",
    }));

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleria.opere?.map((opera: Opera, i: number) => (
                    <div 
                        key={opera._id} 
                        className="group cursor-pointer"
                        onClick={() => setIndex(i)}
                    >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[#272833]">
                            {opera.immagine && (
                                <Image
                                    src={urlFor(opera.immagine).url()}
                                    alt={opera.titolo || "Opera"}
                                    width={600}
                                    height={800}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                        </div>
                        <h2 className="mt-4 text-sm uppercase tracking-widest opacity-70">
                            {opera.titolo}
                        </h2>
                        <p className="text-sm text-[#9ca9af]">
                            {opera.descrizione || ""}
                        </p>
                    </div>
                ))}
            </div>

            <Lightbox
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                slides={slides}
                plugins={[Captions]}
                captions={{
                    showToggle: true,
                    descriptionTextAlign: 'center'
                }}
                styles={{ container: { backgroundColor: "rgba(28, 29, 38, 0.95)" } }}
            />
        </>
    );
}