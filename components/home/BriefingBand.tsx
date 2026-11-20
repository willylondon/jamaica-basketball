import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { SITE } from "@/lib/utils";

/** Full-width ink band with the email briefing signup and the Telegram community link. */
export default function BriefingBand() {
    return (
        <section id="briefing" aria-labelledby="briefing-h" className="mt-20 bg-ink text-ink-text">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-12 gap-y-6 px-4 py-12 lg:px-8">
                <div className="min-w-[280px] flex-1">
                    <h2 id="briefing-h" className="text-[2.5rem] font-extrabold uppercase leading-none text-white">
                        The <span className="text-gold">Jamaica Basketball</span> briefing
                    </h2>
                    <p className="mt-2.5 text-base leading-normal text-ink-muted">
                        Scores, fixtures and the stories that matter, in your inbox.{" "}
                        Prefer chat?{" "}
                        <a href={SITE.socials.telegram} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-text underline underline-offset-2 hover:text-gold">
                            Join the Telegram group
                        </a>
                        .
                    </p>
                </div>
                <div className="min-w-[280px] flex-1">
                    <NewsletterSignup variant="band" />
                </div>
            </div>
        </section>
    );
}
