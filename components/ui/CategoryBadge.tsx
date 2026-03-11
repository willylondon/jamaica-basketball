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
        "inline-block rounded-full font-bold uppercase tracking-wider text-accent bg-accent-subtle transition-colors hover:bg-accent hover:text-black",
        size === "sm" ? "px-2.5 py-1 text-[0.625rem]" : "px-3 py-1.5 text-xs"
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
