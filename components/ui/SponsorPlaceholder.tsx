export default function SponsorPlaceholder() {
    return (
        <aside
            className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 text-center"
            aria-label="Sponsor area"
        >
            {/* Subtle accent glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-subtle via-transparent to-transparent opacity-60" />
            <div className="relative">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-text-dim">
                    Advertisement
                </p>
                <div className="my-4 flex items-center justify-center">
                    <div className="h-px flex-1 bg-border" />
                    <svg className="mx-3 h-5 w-5 text-accent/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="h-px flex-1 bg-border" />
                </div>
                <p className="text-sm font-semibold text-text-muted">Partner with Jamaica Basketball</p>
                <p className="mt-1 text-xs text-text-dim leading-relaxed">
                    Reach thousands of passionate fans and players across Jamaica.
                </p>
                <a
                    href="/contact"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 px-4 py-2 text-xs font-bold text-accent transition-all hover:bg-accent hover:text-black hover:border-accent"
                >
                    Get in Touch
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>
        </aside>
    );
}
