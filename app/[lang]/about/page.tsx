import AboutView from '@/components/AboutView';
import { Header } from '@/components/Header';
import { client } from '@/sanity/lib/client';
import { About, labelsTranslations } from '@/types';

async function getAboutData(lang: string): Promise<About> {
    return await client.fetch(`*[_type == "about" && language == "${lang}"][0]{
      titolo,
      biografia,
      foto,
      sfondo    
  }`)
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const aboutData = await getAboutData(lang);   

    return (
        <main className="bg-[#1c1d26] text-white relative min-h-screen selection:bg-blue-500/30">
            <Header />

            <AboutView aboutData={aboutData} lang={lang} />
        </main>
    );
}