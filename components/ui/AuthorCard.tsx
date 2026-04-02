import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/lib/content";

interface AuthorCardProps {
  author: Author;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="my-10 rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-accent">
          <Image
            src={author.image}
            alt={author.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
            <div>
              <h4 className="font-display text-xl font-bold text-text">
                {author.name}
              </h4>
              <p className="text-sm font-medium text-accent">
                {author.role}
              </p>
            </div>
            {author.website && (
               <Link 
                href={author.website}
                target="_blank"
                className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-accent transition-colors"
               >
                 Visit Website →
               </Link>
            )}
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {author.bio}
          </p>
          {(author.socials?.instagram || author.socials?.tiktok) && (
            <div className="mt-4 flex items-center gap-3">
              {author.socials.instagram && (
                <Link href={author.socials.instagram} className="text-text-dim hover:text-accent transition-colors">
                  <span className="sr-only">Instagram</span>
                  {/* Instagram icon */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Link>
              )}
              {author.socials.tiktok && (
                <Link href={author.socials.tiktok} className="text-text-dim hover:text-accent transition-colors">
                  <span className="sr-only">TikTok</span>
                  {/* TikTok icon */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.38 6.38 0 0 1-1.06-.72v6.52a6.27 6.27 0 0 1-6.23 6.23 6.27 6.27 0 0 1-6.23-6.23 6.27 6.27 0 0 1 6.23-6.23c.07 0 .14 0 .21.01V11.3c-.07-.01-.14-.01-.21-.01a6.01 6.01 0 0 0-6.01 6.01 6.01 6.01 0 0 0 6.01 6.01 6.01 6.01 0 0 0 6.01-6.01V0h-4.74z"/>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}