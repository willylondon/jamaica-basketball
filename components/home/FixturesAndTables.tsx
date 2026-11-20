import Link from "next/link";
import type { FixtureTable, StandingsTable } from "@/lib/scoreboard";

interface Props {
    fixtures?: FixtureTable;
    standings?: StandingsTable;
}

export default function FixturesAndTables({ fixtures, standings }: Props) {
    if (!fixtures && !standings) return null;

    return (
        <section aria-labelledby="tables-h" className="mt-16">
            <div className="section-head">
                <h2 id="tables-h">Fixtures &amp; tables</h2>
                <Link href="/category/national-team" className="text-sm font-semibold text-accent hover:text-accent-hover">
                    National team coverage
                </Link>
            </div>
            <div className="grid gap-10 lg:grid-cols-2">
                {fixtures && (
                    <div className="min-w-0">
                        <h3 className="mb-2.5 font-body text-[0.9375rem] font-bold tracking-normal">{fixtures.title}</h3>
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Game</th>
                                        <th scope="col">Tip-off (JA)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fixtures.rows.map((row) => (
                                        <tr key={`${row.date}-${row.game}`}>
                                            <td className="whitespace-nowrap text-text-dim">{row.date}</td>
                                            <td className="font-semibold">{row.game}</td>
                                            <td className="whitespace-nowrap">{row.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {fixtures.note && <p className="mt-2.5 text-[0.8125rem] text-text-dim">{fixtures.note}</p>}
                    </div>
                )}
                {standings && (
                    <div className="min-w-0">
                        <h3 className="mb-2.5 font-body text-[0.9375rem] font-bold tracking-normal">{standings.title}</h3>
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col" className="w-8">#</th>
                                        <th scope="col">Team</th>
                                        <th scope="col" className="text-right">W–L</th>
                                        <th scope="col">Diff</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.rows.map((row, i) => {
                                        const mine = row.team === standings.highlight;
                                        return (
                                            <tr key={row.team} className={mine ? "bg-surface" : undefined}>
                                                <td className="text-text-dim">{i + 1}</td>
                                                <td className={mine ? "font-bold text-accent" : "font-semibold"}>{row.team}</td>
                                                <td className={`text-right ${mine ? "font-bold" : ""}`}>{row.record}</td>
                                                <td className={mine ? "font-bold" : undefined}>{row.diff}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {standings.note && <p className="mt-2.5 text-[0.8125rem] text-text-dim">{standings.note}</p>}
                    </div>
                )}
            </div>
        </section>
    );
}
