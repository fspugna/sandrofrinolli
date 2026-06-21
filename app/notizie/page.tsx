import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import NotizieList from '@/components/NotizieList';
import { client } from '@/sanity/lib/client';

export default async function NotiziePage() {
    // Recupera solo il primo blocco (es. prime 6)
    const initialNotizie = await client.fetch(`*[_type == "notizia"] | order(data desc)[0..5]`);

    return (
        <main className="min-h-screen bg-[#1c1d26] text-white">
            <Header />            
            <NotizieList initialNotizie={initialNotizie} />
            <Footer />
        </main>
    );
}