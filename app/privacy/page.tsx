import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Newsroom App Privacy",
    description: "How the Jamaica Basketball Newsroom app handles Instagram messages, connected accounts and data deletion requests.",
    alternates: { canonical: `${SITE.url}/privacy` },
};

export default function NewsroomPrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={[{ label: "Newsroom App Privacy" }]} />
            <div className="article-body">
                <h1>Jamaica Basketball Newsroom App Privacy</h1>
                <p>
                    Jamaica Basketball is an independent media outlet. This notice describes how its
                    newsroom app uses data from Instagram and Facebook.
                </p>
                <h2>Connected accounts and messages</h2>
                <p>
                    The app uses the newsroom&apos;s connected professional accounts to publish Jamaica
                    Basketball coverage. When Instagram messaging is enabled, the app receives
                    messages sent to @jamaicabasketball. It checks the message text to answer routine
                    questions, such as where to read our coverage. Messages that need a person&apos;s
                    attention are reviewed in Meta Business Suite.
                </p>
                <h2>Storage and service providers</h2>
                <p>
                    Message text and attachments are processed to handle the incoming event. The
                    automation keeps a hashed event reference and processing status for up to 30 days
                    to prevent duplicate replies. Editor alerts contain a reference and status.
                    Instagram conversations remain available in Meta Business Suite.
                </p>
                <p>
                    Meta provides the account and messaging services. Vercel hosts the application.
                    Upstash provides the processing records, and Brevo delivers editor alerts when
                    email alerts are enabled.
                </p>
                <h2 id="data-deletion">Data deletion requests</h2>
                <p>
                    To request deletion of data the Jamaica Basketball newsroom app holds about
                    you, email <a href="mailto:hello@jamaicabasketball.online?subject=Newsroom%20data%20deletion">
                    hello@jamaicabasketball.online</a> with the subject &quot;Newsroom data deletion.&quot;
                    Include your Instagram handle and the approximate date of the interaction so
                    we can locate the relevant records. You can also use Instagram or Facebook to
                    manage data held by Meta.
                </p>
            </div>
        </main>
    );
}
