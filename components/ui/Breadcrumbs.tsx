import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                <li>
                    <Link href="/" className="transition-colors hover:text-accent">
                        Home
                    </Link>
                </li>
                {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                        {item.href ? (
                            <Link href={item.href} className="transition-colors hover:text-accent">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-text">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
