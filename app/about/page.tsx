import type { Metadata } from "next";
import { SITE } from "@/lib/utils";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about Jamaica Basketball, the definitive independent source for basketball news, features, and analysis in Jamaica.",
    alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "About" }]} />

            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4">
                About Jamaica Basketball
            </h1>

            <div className="article-body">
                <p>
                    <strong>Jamaica Basketball</strong> is an independent media platform
                    dedicated to covering every level of basketball in Jamaica — from the
                    schoolyard to the national team.
                </p>

                <h2>Our Mission</h2>
                <p>
                    We exist to document, celebrate, and grow the basketball culture in
                    Jamaica. In a sporting landscape dominated by track and field and
                    football, basketball has quietly built a passionate following across
                    the island. This platform is here to give the sport the coverage it
                    deserves.
                </p>

                <h2>What We Cover</h2>
                <ul>
                    <li>
                        <strong>National Team</strong> — Full coverage of Jamaica&apos;s
                        FIBA campaigns, qualifiers, and player call-ups
                    </li>
                    <li>
                        <strong>High School Basketball</strong> — Schoolboy and schoolgirl
                        basketball seasons, tournaments, and standout players
                    </li>
                    <li>
                        <strong>Club Basketball</strong> — JABA Premier League and club
                        competition across the island
                    </li>
                    <li>
                        <strong>3x3 Basketball</strong> — Jamaica&apos;s growing presence in
                        the FIBA 3x3 circuit
                    </li>
                    <li>
                        <strong>Player & Coach Spotlights</strong> — In-depth profiles on
                        the people shaping Jamaican basketball
                    </li>
                    <li>
                        <strong>Opinion & Analysis</strong> — Informed takes on the state
                        and future of the sport
                    </li>
                </ul>

                <h2>Contact</h2>
                <p>
                    For tips, story ideas, or collaboration inquiries, visit our{" "}
                    <a href="/contact">contact page</a>.
                </p>
                <p>Follow us on social media for the latest updates:</p>
                <ul>
                    <li>
                        <a
                            href="https://instagram.com/jamaicabasketball"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Instagram
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://tiktok.com/@jamaicabasketball"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TikTok
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
