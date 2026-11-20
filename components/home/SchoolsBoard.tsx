"use client";

import { useState } from "react";
import Link from "next/link";
import type { SchoolsBoard as SchoolsData } from "@/lib/scoreboard";

export default function SchoolsBoard({ data }: { data: SchoolsData }) {
    const zones = Array.from(new Set(data.results.map((r) => r.zone)));
    const [zone, setZone] = useState(zones[0] ?? "");
    const rows = data.results.filter((r) => r.zone === zone);

    return (
        <section id="schools" aria-labelledby="schools-h" className="mt-16">
            <div className="section-head">
                <h2 id="schools-h">ISSA Schoolboys</h2>
                {zones.length > 1 && (
                    <div role="group" aria-label="Zone" className="flex gap-1.5">
                        {zones.map((z) => {
                            const active = z === zone;
                            return (
                                <button
                                    key={z}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setZone(z)}
                                    className={`h-11 rounded-full border-[1.5px] px-[18px] text-sm font-semibold transition-colors ${
                                        active ? "border-ink bg-ink text-ink-text" : "border-border-hover bg-bg text-text hover:border-ink"
                                    }`}
                                >
                                    {z}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
                <div className="min-w-0">
                    <h3 className="mb-2.5 font-body text-[0.9375rem] font-bold tracking-normal">{data.title}</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th scope="col">Age group</th>
                                    <th scope="col">Winner</th>
                                    <th scope="col">Opponent</th>
                                    <th scope="col">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={`${r.winner}-${r.opponent}-${r.group}`}>
                                        <td className="text-text-dim">{r.group}</td>
                                        <td className="font-semibold">{r.winner}</td>
                                        <td>{r.opponent}</td>
                                        <td className="whitespace-nowrap">{r.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2.5 text-[0.8125rem] text-text-dim">
                        {data.note}{" "}
                        <Link href="/category/high-school" className="font-semibold text-accent hover:text-accent-hover">
                            School basketball coverage
                        </Link>
                    </p>
                </div>
                {data.standouts.length > 0 && (
                    <div className="min-w-0">
                        <h3 className="mb-2.5 font-body text-[0.9375rem] font-bold tracking-normal">Standout performances</h3>
                        <ul className="flex flex-col gap-3">
                            {data.standouts.map((s) => (
                                <li key={s.name} className="flex items-center gap-4 rounded-md bg-surface px-[18px] py-4">
                                    <span className="min-w-16 font-display text-[2.75rem] font-extrabold leading-none text-accent">{s.stat}</span>
                                    <span>
                                        <span className="block text-[0.9375rem] font-bold">{s.name}</span>
                                        <span className="block text-[0.8125rem] text-text-dim">{s.detail}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
