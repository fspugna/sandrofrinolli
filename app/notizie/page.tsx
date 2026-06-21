// app/notizie/page.tsx
import NotizieList from '@/components/NotizieList';
import { client } from '@/sanity/lib/client';

export default async function NotiziePage({ searchParams }: { searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 6; // Numero di articoli per pagina
    const offset = (page - 1) * limit;

    // Fetch con paginazione (Sanity supporta [start..end])
    const notizie = await client.fetch(`
        *[_type == "notizia"] | order(data desc) [${offset}...${offset + limit}] {
            _id,
            titolo,
            data,
            contenuto
        }
    `);

    const total = await client.fetch(`count(*[_type == "notizia"])`);
    const totalPages = Math.ceil(total / limit);

    return <NotizieList notizie={notizie} currentPage={page} totalPages={totalPages} />;
}