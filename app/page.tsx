import ScrollToTop from '@/components/ScrollToTop'
import { getYouTubeId } from '@/lib/utils'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { Esposizione, Galleria, HomeData, Notizia, Recensione, SocialItem, Video } from '@/types';
import MainMenu from '@/components/MainMenu'
import { Footer } from '@/components/Footer'

async function getHomeData(): Promise<HomeData> {
  return await client.fetch(`{
    "header": *[_type == "header"][0],
    "about": *[_type == "about"][0]{
  titolo,
  biografia,
  foto
},
    "gallerie": *[_type == "galleria"]{
  _id,
  nome,
  "opere": opere[]->{
    _id,
    titolo,
    immagine
  }
},
    "video": *[_type == "video"] | order(data desc)[0..2],
    "esposizioni": *[_type == "esposizione"] | order(data desc)[0..2],
    "notizie": *[_type == "notizia"] | order(data desc)[0..2],
    "recensioni": *[_type == "recensione"][0..2],
    "contatti": *[_type == "contatti"][0]{
  telefono,
  email,
  "fotoUrl": foto.asset->url,
  social
}
  }`)
}

export default async function Home() {
  const data = await getHomeData()

  return (
    <main className="bg-[#1c1d26] text-white">

      <MainMenu />

      <ScrollToTop />

      {/* 1. HERO */}
      <section id="hero" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Immagine di sfondo (usa next/image se hai l'URL, altrimenti un div con background-image) */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${urlFor(data.header.foto).url()})` }}>
          <div className="absolute inset-0 bg-black/30" /> {/* Overlay per leggibilità */}
        </div>

        {/* Contenuto del titolo */}
        <div className="relative z-20 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-tight">
            L&apos;istante catturato,<br />
            <span className="italic">la tela immaginata.</span>
          </h1>

          {/* Pulsanti di azione */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-8 py-3 border border-white/30 hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs">
              Esplora Fotografia
            </button>
            <button className="px-8 py-3 border border-white/30 hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs">
              Scopri la Pittura
            </button>
          </div>
        </div>
      </section>

      {/* 2. CHI È */}
      <section id="chi-è" className="bg-[#272833] py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div className="relative aspect-[4/5] w-full"> {/* Il div genitore deve avere 'relative' */}
            <Image
              src={urlFor(data.about.foto).url()}
              alt="Artista"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6 prose prose-invert">
            <h2 className="text-sm uppercase tracking-[0.4em] opacity-50 italic">L&apos;Artista</h2>
            <h3 className="text-4xl font-serif">Sandro Frinolli Puzzilli</h3>
            <PortableText value={data.about?.biografia} />
          </div>
        </div>
      </section>

      {/* 3. GALLERIA */}
      <section id="galleria" className="py-24 px-6">
        <h2 className="text-center text-3xl font-serif mb-16 uppercase">Gallerie</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {data.gallerie.map((galleria: Galleria) => (
            // Il Link avvolge tutto il contenuto della card
            <Link
              key={galleria._id}
              href={`/gallerie/${galleria._id}`}
              className="group cursor-pointer block"
            >
              <h3 className="mb-4 text-sm uppercase tracking-widest opacity-60 group-hover:text-blue-400 transition-colors">
                {galleria.nome}
              </h3>

              <div className="relative aspect-square bg-[#272833] overflow-hidden">
                {galleria.opere?.[0]?.immagine ? (
                  <Image
                    src={urlFor(galleria.opere[0].immagine).url()}
                    alt={galleria.opere[0].titolo || "Opera d'arte"}
                    fill
                    className="object-cover transition duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <span>Nessuna opera</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. VIDEO */}
      <section id="video" className="bg-[#272833] py-24 px-6 text-center">
        <h2 className="text-3xl font-serif mb-12 uppercase tracking-widest">Video</h2>

        <div className="max-w-4xl mx-auto grid gap-12">
          {data.video.map((v: Video) => {
            const id = getYouTubeId(v.url);
            if (!id) return null;

            return (
              <div key={v._id} className="space-y-4">
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-lg shadow-2xl"
                    src={`https://www.youtube.com/embed/${id}`}
                    title={v.titolo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="text-lg font-light italic opacity-80">{v.titolo}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ESPOSIZIONI E NOTIZIE */}
      <section className="py-24 px-6 grid md:grid-cols-2 gap-20 max-w-7xl mx-auto">

        {/* ESPOSIZIONI */}
        <div id="esposizioni">
          <h2 className="text-2xl font-serif mb-10 border-b border-white/10 pb-4 uppercase tracking-widest">Esposizioni</h2>
          <div className="space-y-8">
            {data.esposizioni.map((e: Esposizione) => (
              <article key={e._id} className="border-l border-white/10 pl-6">
                <time className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">
                  {new Date(e.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
                <h4 className="text-lg mb-2">{e.titolo}</h4>
              </article>
            ))}
          </div>
          <a href="/esposizioni" className="mt-8 inline-block text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">Vedi tutte le esposizioni →</a>
        </div>

        {/* NOTIZIE */}
        <div id="notizie">
          <h2 className="text-2xl font-serif mb-10 border-b border-white/10 pb-4 uppercase tracking-widest">Ultime Notizie</h2>
          <div className="space-y-8">
            {data.notizie.map((n: Notizia) => (
              <article key={n._id} className="border-l border-white/10 pl-6">
                <Link href={`/notizie/${n._id}`}>
                  <time className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">
                    {new Date(n.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                  <h4 className="text-lg mb-2">{n.titolo}</h4>
                </Link>
              </article>
            ))}
          </div>
          <a href="/notizie" className="mt-8 inline-block text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">Vedi tutte le notizie →</a>
        </div>
      </section>

      {/* 6. RECENSIONI */}
      <section id="recensioni" className="bg-[#272833] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-2xl font-serif mb-16 border-b border-white/10 pb-4 uppercase tracking-widest">
            Recensioni
          </h2>

          <div className="grid gap-8 mb-12">
            {data.recensioni.map((r: Recensione) => (
              <a
                key={r._id}
                href={`/recensioni/${r._id}`}
                className="group block p-6 border border-white/5 hover:border-white/20 transition-all duration-300"
              >
                <blockquote className="text-xl font-serif italic text-white/90 group-hover:text-blue-400 transition-colors leading-relaxed">
                  {r.titolo}
                </blockquote>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-4 block group-hover:text-white/60">
                  Leggi la recensione →
                </span>
              </a>
            ))}
          </div>

          {/* Link alla pagina completa */}
          <a
            href="/recensioni"
            className="inline-block text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-white/20 pb-1"
          >
            Vedi tutte le recensioni →
          </a>
        </div>
      </section>

      {/* 7. CONTATTI */}
      <section id="contatti" className="py-24 px-6 bg-[#1a1b26] text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Colonna Sinistra */}
          <div className="space-y-12">
            <h2 className="text-3xl font-serif uppercase tracking-widest border-b border-white/10 pb-6">
              Contatti
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">Recapiti</h3>
                <div className="space-y-2 text-lg">
                  <p className="flex items-center">
                    <span className="opacity-40 w-20 text-sm">Tel:</span>
                    <a href={`tel:${data.contatti.telefono}`} className="hover:text-blue-400 transition-colors">{data.contatti.telefono}</a>
                  </p>
                  <p className="flex items-center">
                    <span className="opacity-40 w-20 text-sm">Email:</span>
                    <a href={`mailto:${data.contatti.email}`} className="hover:text-blue-400 transition-colors">{data.contatti.email}</a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-6">Social Network</h3>
                <div className="flex flex-wrap gap-3">
                  {data.contatti.social.map((s: SocialItem) => (
                    <a
                      key={s.nome}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 border border-white/10 text-[11px] uppercase tracking-widest hover:bg-white hover:text-[#1a1b26] hover:border-white transition-all duration-300"
                    >
                      {s.nome}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonna Destra: Immagine con effetto hover */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20">
            <Image
              src={data.contatti.fotoUrl}
              alt="Sandro Frinolli Puzzilli"
              fill
              className="object-cover transition-all duration-700 ease-in-out grayscale hover:grayscale-0 scale-100 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}