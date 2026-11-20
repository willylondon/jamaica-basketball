import Link from "next/link";
import type { NextGame } from "@/lib/scoreboard";

export default function NextGameCard({ game }: { game: NextGame }) {
    return (
        <section aria-labelledby="next-game-h" className="rounded-md border border-border-hover p-6">
            <h2 id="next-game-h" className="kicker text-text-dim">
                Next game · {game.competition}
            </h2>
            <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink font-display text-2xl font-extrabold text-gold">
                        {game.home.code}
                    </span>
                    <span className="text-sm font-semibold">{game.home.name}</span>
                </div>
                <span className="font-display text-xl font-bold text-text-dim">vs</span>
                <div className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border-hover bg-surface font-display text-2xl font-extrabold text-text">
                        {game.away.code}
                    </span>
                    <span className="text-sm font-semibold">{game.away.name}</span>
                </div>
            </div>
            <div className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4">
                <p className="font-display text-[1.625rem] font-bold leading-tight">{game.when}</p>
                <p className="text-sm text-text-dim">{game.where}</p>
                {game.note && <p className="mt-1 text-sm text-text-muted">{game.note}</p>}
            </div>
            {game.href && (
                <Link
                    href={game.href}
                    className="mt-5 flex h-11 items-center justify-center rounded-full border-[1.5px] border-ink text-[0.9375rem] font-semibold text-text transition-colors hover:bg-ink hover:text-ink-text"
                >
                    {game.cta ?? "Read more"}
                </Link>
            )}
        </section>
    );
}
