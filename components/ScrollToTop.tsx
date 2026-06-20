"use client";

export default function ScrollToTop() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-3 bg-white/10 hover:bg-white text-black rounded-full transition-all"
        >
            ↑
        </button>
    );
}