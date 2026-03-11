export default function SponsorPlaceholder() {
    return (
        <aside
            className="rounded-xl border border-dashed border-border bg-surface/30 px-6 py-8 text-center"
            aria-label="Sponsor area"
        >
            <p className="text-xs font-medium uppercase tracking-widest text-text-dim">
                Partner with Us
            </p>
            <p className="mt-1 text-sm text-text-muted">
                Interested in reaching Jamaica&apos;s basketball community?{" "}
                <a
                    href="/contact"
                    className="text-accent transition-colors hover:text-accent-hover underline underline-offset-2"
                >
                    Get in touch
                </a>
            </p>
        </aside>
    );
}
