import { getPublishedPosts, type Post } from "@/lib/content";
import { slugify } from "@/lib/utils";

export interface LeagueHub {
    slug: string;
    label: string;
    shortLabel: string;
    description: string;
    status: string;
    teamCount: number;
    levels: string[];
    competitionNames: string[];
    teams: string[];
    matchTags: string[];
    matchCategories: string[];
}

export const LEAGUE_HUBS: LeagueHub[] = [
    {
        slug: "jaba",
        label: "JABA",
        shortLabel: "JABA",
        description:
            "Jamaica Basketball Association governance, league administration, federation updates, and national-structure stories.",
        status: "Active federation coverage hub",
        teamCount: 4,
        levels: ["Senior Men", "Senior Women", "3x3 Men", "3x3 Women"],
        competitionNames: [
            "FIBA Basketball World Cup 2027 Americas Pre-Qualifiers / Qualifiers cycle (2025-26)",
            "FIBA CBC Women's Championship 2025",
            "FIBA 3x3 AmeriCup 2025",
        ],
        teams: [
            "Jamaica Senior Men's National Team",
            "Jamaica Senior Women's National Team",
            "Jamaica Men's 3x3 National Team",
            "Jamaica Women's 3x3 National Team",
        ],
        matchTags: ["JABA", "JaBA", "Jamaica Basketball Association"],
        matchCategories: ["national-team", "club-basketball", "3x3"],
    },
    {
        slug: "phase-1-academy",
        label: "P.H.A.S.E. 1 Academy",
        shortLabel: "P.H.A.S.E. 1",
        description:
            "Travel-team coverage for one of the most active academy programs touching youth development, international travel basketball, and player progression.",
        status: "Active academy program in dataset",
        teamCount: 7,
        levels: ["Academy U15", "Academy U16", "Academy U17", "Academy U18", "Academy U19", "Academy U21", "Girls Travel 13-21"],
        competitionNames: [
            "P.H.A.S.E. 1 Academy Boys Travel Team / 2024 public roster page",
            "P.H.A.S.E. 1 Academy Girls Travel Team / 2025-26 program page",
        ],
        teams: [
            "P.H.A.S.E. 1 Academy U15 Boys",
            "P.H.A.S.E. 1 Academy U16 Boys",
            "P.H.A.S.E. 1 Academy U17 Boys",
            "P.H.A.S.E. 1 Academy U18 Boys",
            "P.H.A.S.E. 1 Academy U19 Boys",
            "P.H.A.S.E. 1 Academy U21 Boys",
            "P.H.A.S.E. 1 Academy Girls Travel Team",
        ],
        matchTags: ["P.H.A.S.E. 1", "Phase 1", "Phase 1 Academy", "P.H.A.S.E. 1 Academy"],
        matchCategories: [],
    },
    {
        slug: "nbl",
        label: "National Basketball League",
        shortLabel: "NBL",
        description:
            "The top men's club competition in Jamaica, including title races, restructuring, sponsors, finals runs, and club-level news.",
        status: "10-team 2025 field confirmed in dataset",
        teamCount: 10,
        levels: ["NBL"],
        competitionNames: ["National Basketball League (2025)"],
        teams: [
            "Urban Knights",
            "Upper Room Eagles",
            "St George's Slayers",
            "UWI Runnin' Rebels",
            "Portmore Flames",
            "Spanish Town Spartans",
            "Rae Town Raptors",
            "Tivoli Wizards",
            "Central Celtics",
            "MoBay Boys' & Girls' Club Warriors",
        ],
        matchTags: ["NBL", "National Basketball League", "Jamaica basketball league"],
        matchCategories: ["club-basketball"],
    },
    {
        slug: "community-basketball",
        label: "Howard McCatty Community League",
        shortLabel: "Community League",
        description:
            "Community Division One and Howard McCatty league coverage, including grassroots clubs, neighborhood rivalries, and GK One sponsorship context.",
        status: "24 confirmed Division 1 teams in dataset",
        teamCount: 24,
        levels: ["Division 1"],
        competitionNames: [
            "GK One Howard McCatty Community Basketball League / South Conference Community Division One (public-confirmed teams)",
        ],
        teams: [
            "EXED Heats",
            "Majesty Gardens Legends",
            "CMU Spartans",
            "Spanish Town Spartans",
            "Rae Town Raptors",
            "Real Lions",
            "Delacree Park Hotsteppers",
            "Riverton Link-Up",
            "St George's Saints",
            "Donmair All-Stars",
            "Christian Gardens",
            "Aqua Youths",
        ],
        matchTags: ["Howard McCatty", "Community Basketball", "GK One", "Division 1"],
        matchCategories: [],
    },
    {
        slug: "under-19",
        label: "ISSA Under-19",
        shortLabel: "Under-19",
        description:
            "Urban and rural ISSA under-19 basketball across Jamaica, including schoolboy title races, finals, and standout youth talent.",
        status: "30 confirmed teams across urban and rural competitions",
        teamCount: 30,
        levels: ["Under-19", "Urban", "Rural"],
        competitionNames: ["ISSA Urban Area Under-19", "ISSA Rural Area Under-19"],
        teams: [
            "Campion College",
            "St George's College",
            "Jamaica College",
            "Camperdown High",
            "Ardenne High",
            "Kingston College",
            "Manchester High",
            "Holmwood Technical",
            "Herbert Morrison Technical",
            "Knox College",
        ],
        matchTags: ["Under-19", "U19", "ISSA Urban Area Under-19", "ISSA Rural Area Under-19"],
        matchCategories: ["high-school"],
    },
    {
        slug: "under-16",
        label: "ISSA Under-16",
        shortLabel: "Under-16",
        description:
            "Urban and rural ISSA under-16 basketball with early prospect coverage, school rivalries, and youth development storylines.",
        status: "24 confirmed teams across urban and rural competitions",
        teamCount: 24,
        levels: ["Under-16", "Urban", "Rural"],
        competitionNames: ["ISSA Urban Area Under-16", "ISSA Rural Area Under-16"],
        teams: [
            "Wolmer's Boys' School",
            "Jamaica College",
            "Campion College",
            "St George's College",
            "Kingston College",
            "Ardenne High",
            "Herbert Morrison Technical",
            "Manchester High",
            "Knox College",
            "York Castle High",
        ],
        matchTags: ["Under-16", "U16", "ISSA Urban Area Under-16", "ISSA Rural Area Under-16"],
        matchCategories: [],
    },
    {
        slug: "under-14",
        label: "Under-14",
        shortLabel: "Under-14",
        description:
            "The youngest publicly verified school competition layer in the dataset, currently strongest on the rural side.",
        status: "4 rural teams publicly confirmed in dataset",
        teamCount: 4,
        levels: ["Under-14"],
        competitionNames: ["ISSA Rural Area Under-14"],
        teams: [
            "Herbert Morrison Technical",
            "Manchester High",
            "Knox College",
            "Cornwall College",
        ],
        matchTags: ["Under-14", "U14", "ISSA Rural Area Under-14"],
        matchCategories: [],
    },
    {
        slug: "womens-basketball",
        label: "Women's Basketball",
        shortLabel: "Women's",
        description:
            "A dedicated hub for Jamaica senior women's national-team and women's 3x3 coverage, based on the current federation layer in the dataset.",
        status: "Senior women's and women's 3x3 programs confirmed",
        teamCount: 2,
        levels: ["Senior Women", "3x3 Women"],
        competitionNames: ["FIBA CBC Women's Championship 2025", "FIBA 3x3 AmeriCup 2025"],
        teams: ["Jamaica Senior Women's National Team", "Jamaica Women's 3x3 National Team"],
        matchTags: ["Women's Basketball", "Women", "CBC Women's Championship"],
        matchCategories: [],
    },
];

export function getLeagueHubBySlug(slug: string) {
    return LEAGUE_HUBS.find((hub) => hub.slug === slug);
}

export function getPostsForLeagueHub(hub: LeagueHub): Post[] {
    const posts = getPublishedPosts();
    const tagSlugs = new Set(hub.matchTags.map(slugify));
    const categorySlugs = new Set(hub.matchCategories);

    return posts.filter((post) => {
        const categoryMatch = categorySlugs.has(post.category);
        const tagMatch = post.tags.some((tag) => tagSlugs.has(slugify(tag)));
        return categoryMatch || tagMatch;
    });
}
