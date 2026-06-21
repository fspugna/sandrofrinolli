import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import RecensioniList from '@/components/RecensioniList';
import { client } from '@/sanity/lib/client';

export default async function RecensioniPage() {  
    // Recupera solo il primo blocco (es. prime 6)
    const initialRecensioni = await client.fetch(`*[_type == "recensione"] | order(data desc)[0..5]`);

    return (
        <main className="min-h-screen bg-[#1c1d26] text-white">
            <Header />            
            <RecensioniList initialRecensioni={initialRecensioni} />
            <Footer />
        </main>
    );
}