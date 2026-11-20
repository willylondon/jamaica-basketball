import CoverImage from "@/components/ui/CoverImage";
import { getCategoryLabel, usesTypographicCover } from "@/lib/content";
import type { Post } from "@/lib/content";
import { cn } from "@/lib/utils";

type CoverPost = Pick<Post, "image" | "imageAlt" | "category" | "title"> & {
    imagePosition?: string;
    coverStat?: string;
    coverLabel?: string;
};

interface PostCoverProps {
    post: CoverPost;
    size?: "card" | "lead";
    sizes?: string;
    priority?: boolean;
    className?: string;
}

/** Category → cover tone. Gold only ever sits under ink text, green and ink under white. */
const TONES: Record<string, { bg: string; label: string; stat: string }> = {
    "national-team": { bg: "bg-ink", label: "text-gold", stat: "text-white" },
    "high-school": { bg: "bg-gold", label: "text-ink", stat: "text-ink" },
    "3x3": { bg: "bg-accent", label: "text-white", stat: "text-white" },
    "player-spotlight": { bg: "bg-ink", label: "text-gold", stat: "text-white" },
    "club-basketball": { bg: "bg-accent", label: "text-white", stat: "text-white" },
};
const DEFAULT_TONE = { bg: "bg-surface border border-border-hover", label: "text-text-dim", stat: "text-text" };

/**
 * A post's cover: the photo when it has a real one, otherwise a typographic
 * card built from its coverStat (or category). Fills its positioned parent.
 */
export default function PostCover({ post, size = "card", sizes, priority, className }: PostCoverProps) {
    if (!usesTypographicCover(post)) {
        return (
            <CoverImage
                src={post.image}
                alt={post.imageAlt}
                objectPosition={post.imagePosition}
                sizes={sizes}
                priority={priority}
                className={cn("object-cover", className)}
            />
        );
    }

    const tone = TONES[post.category] ?? DEFAULT_TONE;
    const label = post.coverLabel || getCategoryLabel(post.category);
    const stat = post.coverStat;
    const lead = size === "lead";

    return (
        <div
            role="img"
            aria-label={stat ? `${label}: ${stat}` : label}
            className={cn("absolute inset-0 flex flex-col justify-between", lead ? "p-6 md:p-8" : "p-4", tone.bg)}
        >
            <span
                className={cn(
                    "font-display font-bold uppercase tracking-[0.1em]",
                    lead ? "text-sm md:text-[0.9375rem]" : "text-xs",
                    tone.label
                )}
            >
                {label}
            </span>
            {stat ? (
                <span
                    className={cn(
                        "font-display font-extrabold leading-[0.85] tracking-[-0.01em]",
                        lead ? "text-[clamp(5rem,14vw,10.5rem)]" : "text-[clamp(3.5rem,9vw,5.5rem)]",
                        tone.stat
                    )}
                >
                    {stat}
                </span>
            ) : (
                <span
                    className={cn(
                        "font-display font-extrabold uppercase leading-[0.9]",
                        lead ? "text-[clamp(3rem,8vw,6rem)]" : "text-[clamp(2rem,5vw,2.75rem)]",
                        tone.stat
                    )}
                >
                    Jamaica Basketball
                </span>
            )}
        </div>
    );
}
