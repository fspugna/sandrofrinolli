'use client'
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation'

const supportedLanguages = ['it', 'en', 'es'] as const
const menuLabels = {
    it: {
        home: 'Home',
        about: 'Chi è',
        galleries: 'Gallerie',
        videos: 'Video',
        exhibitions: 'Esposizioni',
        news: 'Notizie',
        reviews: 'Recensioni',
        contatti: 'Contatti',
    },
    en: {
        home: 'Home',
        about: 'Who is',
        galleries: 'Galleries',
        videos: 'Videos',
        exhibitions: 'Exhibitions',
        news: 'News',
        reviews: 'Reviews',
        contatti: 'Contacts',
    },
    es: {
        home: 'Inicio',
        about: 'Quién es',
        galleries: 'Galerias',
        videos: 'Videos',
        exhibitions: 'Exposiciones',
        news: 'Noticias',
        reviews: 'Reseñas',
        contatti: 'Contacto',
    },
} as const

export default function MainMenu({ lang = 'it' }: { lang?: string }) {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentLang = supportedLanguages.includes(pathSegments[0] as typeof supportedLanguages[number])
        ? pathSegments[0]
        : lang
    const labels = menuLabels[currentLang as keyof typeof menuLabels] ?? menuLabels.it
    const currentPath = currentLang && pathname.startsWith(`/${currentLang}`)
        ? pathname.slice(currentLang.length + 1) || '/'
        : pathname

    // Funzione helper per creare link localizzati
    const getLocalizedHref = (path: string) => `/${currentLang}${path === '/' ? '' : path}`;

    return (
        /* 
          1. Abbiamo cambiato py-8 in py-4 md:py-8 per ridurre l'altezza complessiva su mobile.
          2. Abbiamo rimosso gap-6 e usato gap-3 per mobile.
        */
        <nav className="absolute top-0 left-0 w-full z-50 px-6 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center text-white gap-3 md:gap-6">
            {/* Logo */}
            <div className="relative h-8 md:h-12 w-auto shrink-0">
                <Link href={getLocalizedHref('/')} className="block relative w-full h-full">
                    <Image
                        src="/assets/images/logo.png"
                        alt="Sandro Frinolli Puzzilli"
                        width={300}
                        height={80}
                        className="object-contain h-full w-auto"
                        priority
                    />
                </Link>
            </div>

            {/* Menu */}
            <ul className="hidden md:flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest opacity-80 text-center">
                <li><Link href={getLocalizedHref('/')} className="hover:text-blue-400 transition-colors">{labels.home}</Link></li>
                <li><Link href={getLocalizedHref('/about')} className="hover:text-blue-400 transition-colors">{labels.about}</Link></li>
                <li><Link href={getLocalizedHref('/gallerie')} className="hover:text-blue-400 transition-colors">{labels.galleries}</Link></li>
                <li><Link href={getLocalizedHref('/video')} className="hover:text-blue-400 transition-colors">{labels.videos}</Link></li>
                <li><Link href={getLocalizedHref('/esposizioni')} className="hover:text-blue-400 transition-colors">{labels.exhibitions}</Link></li>
                <li><Link href={getLocalizedHref('/notizie')} className="hover:text-blue-400 transition-colors">{labels.news}</Link></li>
                <li><Link href={getLocalizedHref('/recensioni')} className="hover:text-blue-400 transition-colors">{labels.reviews}</Link></li>
                <li><Link href={getLocalizedHref('/contatti')} className="hover:text-blue-400 transition-colors">{labels.contatti}</Link></li>
            </ul>

            {/* Selettore Lingue - Ridotto il tracking su mobile per non allargarlo troppo */}
            <div className="flex gap-3 text-[10px] uppercase tracking-widest md:tracking-[0.2em] opacity-60">
                {['it', 'en', 'es'].map((l) => (
                    <Link 
                        key={l} 
                        href={`/${l}${currentPath === '/' ? '' : currentPath}`}
                        className={`${currentLang === l ? 'text-white border-b border-white' : 'hover:text-white'}`}
                    >
                        {l}
                    </Link>
                ))}
            </div>
        </nav>
    )
}