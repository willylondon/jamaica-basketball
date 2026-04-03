"use client";
import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
    className?: string;
}

export default function CoverImage({ src, alt, priority, sizes, className }: CoverImageProps) {
    const [errored, setErrored] = useState(false);

    if (errored) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface via-[#1a1a1a] to-bg">
                <div className="flex flex-col items-center gap-2 opacity-30">
                    <svg className="h-10 w-10 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>
                    <span className="text-xs font-medium text-text-dim tracking-wider uppercase">Jamaica Basketball</span>
                </div>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className={className}
            priority={priority}
            onError={() => setErrored(true)}
        />
    );
}
