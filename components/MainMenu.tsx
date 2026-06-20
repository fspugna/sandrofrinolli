import Image from "next/image";
import Link from "next/link";

export default function MainMenu() {
    return (
        <nav className="absolute top-0 left-0 w-full z-50 px-6 py-8 flex flex-col md:flex-row justify-between items-center text-white gap-6">
            {/* Logo */}
            <div className="relative h-10 md:h-12 w-auto shrink-0">
                <Link href="/" className="block relative w-full h-full">
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

            {/* Menu - Gestito con flex-wrap per andare a capo se necessario */}
            <ul className="hidden md:flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest opacity-80 text-center">
                <li><Link href="#about" className="hover:text-blue-400 transition-colors">Chi è</Link></li>
                <li><Link href="#galleria" className="hover:text-blue-400 transition-colors">Galleria</Link></li>
                <li><Link href="#video" className="hover:text-blue-400 transition-colors">Video</Link></li>
                <li><Link href="#esposizioni" className="hover:text-blue-400 transition-colors">Esposizioni</Link></li>
                <li><Link href="#notizie" className="hover:text-blue-400 transition-colors">Notizie</Link></li>
                <li><Link href="#recensioni" className="hover:text-blue-400 transition-colors">Recensioni</Link></li>
                <li><Link href="#contatti" className="hover:text-blue-400 transition-colors">Contatti</Link></li>
            </ul>

            {/* Mobile Hamburger (sempre visibile su schermi piccoli) */}
            <button className="md:hidden">
                <div className="w-6 h-0.5 bg-white mb-1.5" />
                <div className="w-6 h-0.5 bg-white" />
            </button>
        </nav>
    )
}