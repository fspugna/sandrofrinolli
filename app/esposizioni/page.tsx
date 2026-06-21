import EsposizioniList from '@/components/EsposizioniList';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { client } from '@/sanity/lib/client';

export default async function EsposizioniPage() {
    // Recupera solo il primo blocco (es. prime 6)
    const initialEsposizioni = await client.fetch(`*[_type == "esposizione"] | order(data desc)[0..5]`);

    return (
        <main className="min-h-screen bg-[#1c1d26] text-white">
            <Header />            
            <EsposizioniList initialEsposizioni={initialEsposizioni} />
            <Footer />
        </main>
    );
}