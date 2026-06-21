import AltriVideo from '@/components/AltriVideo';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { client } from '@/sanity/lib/client';

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const video = await client.fetch(`
        *[_type == "video" && _id == $id][0]
    `, { id });

    if (!video) return <div>Video non trovato</div>;

    const videoId = video.url.split('v=')[1]?.split('&')[0];

    return (
        <main className="bg-[#1c1d26] min-h-screen text-white">
            <Header />
            <section className="max-w-5xl mx-auto px-6 py-16">
                <h1 className="text-3xl md:text-4xl font-serif mb-8">{video.titolo}</h1>
                
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allowFullScreen
                    ></iframe>
                </div>
                
                <p className="mt-8 text-white/60">
                    Pubblicato il: {new Date(video.data).toLocaleDateString()}
                </p>
                
                <AltriVideo currentId={id} />
            </section>
            
            <Footer />
        </main>
    );
}