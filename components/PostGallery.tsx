'use client';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { urlFor } from '@/sanity/lib/image';
import PortableImage from './PortableImage';
import { SanityImage } from '@/types';

export default function PostGallery({ images }: { images: SanityImage[] }) {
    const [index, setIndex] = useState(-1);
    const slides = images.map((img) => ({ src: urlFor(img).url() }));

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {images.map((img, i) => (
                    <PortableImage
                        key={img._key || i}
                        value={img}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>

            <Lightbox
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                slides={slides}
                styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.9)" } }}
            />
        </>
    );
}