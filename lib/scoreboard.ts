import data from "@/content/settings/scoreboard.json";

/**
 * Hand-edited scores, fixtures and tables shown in the score strip and on the
 * homepage. Edit content/settings/scoreboard.json (or the CMS) to update them;
 * any section can be removed and the page simply skips it.
 */

export interface StripItem {
    meta: string;
    text: string;
    href?: string;
}

export interface StripGroup {
    label: string;
    items: StripItem[];
}

export interface Team {
    code: string;
    name: string;
}

export interface NextGame {
    competition: string;
    home: Team;
    away: Team;
    when: string;
    where: string;
    note?: string;
    href?: string;
    cta?: string;
}

export interface FixtureTable {
    title: string;
    note?: string;
    rows: { date: string; game: string; time: string }[];
}

export interface StandingsTable {
    title: string;
    note?: string;
    highlight?: string;
    rows: { team: string; record: string; diff: string }[];
}

export interface SchoolsBoard {
    title: string;
    note?: string;
    results: { zone: string; group: string; winner: string; opponent: string; score: string }[];
    standouts: { stat: string; name: string; detail: string }[];
}

export interface Scoreboard {
    strip?: StripGroup[];
    nextGame?: NextGame;
    fixtures?: FixtureTable;
    standings?: StandingsTable;
    schools?: SchoolsBoard;
}

export const scoreboard: Scoreboard = data as Scoreboard;
