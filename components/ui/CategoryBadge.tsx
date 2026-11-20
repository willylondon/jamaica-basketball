import Link from "next/link";
import { getCategoryLabel } from "@/lib/content";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
    category: string;
    size?: "sm" | "md";
    linked?: boolean;
}

export default function CategoryBadge({
    category,
    size = "sm",
    linked = true,
}: CategoryBadgeProps) {
    const classes = cn(
        "inline-block font-bold uppercase tracking-[0.08em] text-accent transition-colors hover:text-accent-hover",
        size === "sm" ? "text-xs" : "text-[0.8125rem]"
    );

    if (linked) {
        return (
            <Link href={`/category/${category}`} className={classes}>
                {getCategoryLabel(category)}
            </Link>
        );
    }

    return <span className={classes}>{getCategoryLabel(category)}</span>;
}
