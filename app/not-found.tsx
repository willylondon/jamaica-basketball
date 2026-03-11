import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                <span className="font-display text-4xl font-extrabold text-accent">
                    404
                </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text mb-3">
                Page Not Found
            </h1>
            <p className="text-text-muted max-w-md mb-6">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Let&apos;s get you back on the court.
            </p>
            <div className="flex gap-3">
                <Link
                    href="/"
                    className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
                >
                    Go Home
                </Link>
                <Link
                    href="/search"
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-accent/30 hover:text-accent"
                >
                    Search
                </Link>
            </div>
        </div>
    );
}
