'use client';
import { Video } from '@/types';
import Link from 'next/link';
import { Header } from './Header';
import Image from 'next/image';
import { Footer } from './Footer';

// Helper per estrarre l'ID di YouTube dall'URL
const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
};

export default function VideoList({ initialVideos }: { initialVideos: Video[] }) {
    return (
        <main className="bg-[#1c1d26] min-h-screen">
            <Header />
            <section className="max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-serif mb-16 text-white">Video</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {initialVideos.map((v) => {
                        const thumbnail = getYouTubeThumbnail(v.url);
                        return (
                            <Link key={v._id} href={`/video/${v._id}`}                             
                            className="group block bg-[#272833] rounded-lg overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    {thumbnail ? (
                                        <Image
                                            src={thumbnail}
                                            alt={v.titolo}
                                            fill
                                            className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        // Fallback se l'immagine non viene trovata
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <span className="text-xs text-gray-500">Video</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h2 className="text-white text-xl font-serif leading-snug mb-6 group-hover:text-blue-400 transition-colors">{v.titolo}</h2>                                    
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