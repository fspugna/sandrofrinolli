export function Footer() {
    return <footer className="py-12 px-6 bg-[#161720] border-t border-white/5 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">
                © {new Date().getFullYear()} Sandro Frinolli Puzzilli. Tutti i diritti riservati.
            </p>

        </div>
    </footer>
}