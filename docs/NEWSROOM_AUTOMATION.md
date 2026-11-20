# Jamaica Basketball newsroom automation

The Codex desk runs daily at 7:00 a.m. Jamaica time. It prepares a private, source-linked brief, original MDX drafts and separate Instagram and Facebook captions under the ignored `.newsroom/` directory. The desk can publish routine, verified coverage to the site under the owner's standing approval. Keep stories that need more reporting or editorial judgment in the draft queue. GitHub Actions runs native discovery and checks for eligible social posts at 7:15 a.m. Jamaica time. Instagram inbox handling starts when a signed Meta webhook reaches a configured Vercel deployment.

## Editorial workflow

1. Review new leads against the organizer, team, governing body or independent firsthand reporting. Confirm the sport, age group, teams, venue, result and local date. Check existing posts for the same event and cite sources inline or in a source list.
2. Submit an original article through the existing CMS or as a reviewed change in `content/posts/`. Source a real featured photo for each new article and substantive update. Prefer an image from the actual event or of the people or venue involved. Use a clearly labeled, relevant archival image when needed. Record permission and the source, add alt text and the public credit, and verify the thumbnail and sharing preview. Hold the story in draft if no suitable photo is cleared, with editor approval for time-sensitive exceptions. The site publishes from `main` through its Git deployment.
3. To include the article in social syndication, explicitly set `draft: false`, `syndicate: true`, an ISO date in the form `"YYYY-MM-DD"`, and both `instagramCaption` and `facebookCaption`. Use a unique slug. The next eligible run checks for the article’s syndication marker on the production domain before calling Meta. Instagram uses the featured photo or the article’s optional `instagramImage` JPEG crop of that same photo. Use a 4:5 to 1.91:1 aspect ratio and keep the JPEG under 8 MB. The workflow verifies that the file is publicly reachable as a JPEG before requesting publication, and Facebook posts the article link after checking that its live Open Graph image matches the approved featured photo and loads as a supported image on the production site. Use the featured photo as the sharing image for Facebook syndication.
4. Check the GitHub Actions run. For same-day pickup after Vercel deploys, select **Check approved stories for syndication without repeating discovery** and clear **Keep this manual run in dry-run**. Live posting also requires the environment switch. The workflow skips stories outside the current seven-day Jamaica-local publication window. `waiting-for-site` means the live article marker was absent. `waiting-for-facebook-preview` means the eligible Facebook post was held before publishing because the live preview was missing, mismatched, a placeholder, or unavailable. Correct the article or photo and let the next eligible run retry. `waiting-for-instagram-photo` means the Instagram photo was missing, unavailable, a placeholder, or unsuitable as a JPEG. `needs-review` means the external outcome may be uncertain. Check the relevant Meta channel before resolving the ledger entry.

The Codex editorial desk performs a public web and indexed-social pass even before the native search integrations are connected. Native discovery searches a bounded set of queries and public Instagram hashtags or selected professional handles. When Redis is configured in GitHub Actions, a private report holds lead URLs and per-provider coverage for seven days. The run log names the report key. Search results are leads. The action accepts social copy only from approved posts in Git.

## GitHub Actions

Use the repository's `newsroom` environment and restrict it to `main`. Enter credentials in GitHub environment secrets.

| Setting | Store | Use |
| --- | --- | --- |
| `BRAVE_SEARCH_API_KEY` | Secret | Brave Search web discovery |
| `X_BEARER_TOKEN` | Secret | X recent search with read access and a funded project |
| `IG_DISCOVERY_USER_TOKEN` | Optional secret | Dedicated Meta Facebook Login token for Instagram hashtag and Business Discovery |
| `IG_FACEBOOK_LOGIN_ID` | Optional variable | Professional account ID for the dedicated discovery token |
| `IG_DISCOVERY_HANDLES` | Optional variable | Up to eight verified public professional handles, comma-separated without @ |
| `IG_API_MODE` | Variable | Use `unified` for this Meta app. The earlier Instagram Login setup uses `instagram-login`. |
| `IG_ACCESS_TOKEN` | Secret | Business Integration System User Access Token for the Jamaica Basketball assets |
| `IG_ACCOUNT_ID` | Variable | ID for @jamaicabasketball from `/me/assigned_instagram_accounts` with Unified Login |
| `FB_PAGE_ACCESS_TOKEN` | Optional secret | Page access token for Jamaica Basketball. With Unified Login, the workflow can derive it from the assigned Page using the system-user token. |
| `FB_PAGE_ID` | Variable | Jamaica Basketball Page ID confirmed in Meta Business Suite |
| `META_GRAPH_VERSION` | Variable | Supported Graph API version shown in the Meta app dashboard, in the form `v27.0` |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Optional secrets | Private discovery reports |
| `NEWSROOM_PUBLISH_LIVE` | Variable | Set to `true` after reviewing the workflow and verifying each selected account |
| `NEWSROOM_PUBLISH_CHANNELS` | Optional variable | Select `facebook`, `instagram`, `telegram`, `tiktok`, and/or `twitter`, comma-separated. The workflow defaults to Facebook. |

For the Jamaica Basketball Newsroom app, Unified Login uses `instagram_basic`, `instagram_content_publish` and `instagram_manage_messages`. Facebook posting requires `pages_manage_posts`, `pages_read_engagement` and `pages_show_list`. Scope the asset grant to the Jamaica Basketball Promo Page and @jamaicabasketball. The Page can be tested independently with a Page token while Instagram authorization is pending. The default discovery path can try Instagram hashtag search with the same authorized account, subject to Meta's discovery permissions. A dedicated discovery token, when configured, must have its matching account ID. Start with **Verify the configured social account IDs without publishing** and compare the IDs with Meta Business Suite. Use **Verify the Instagram account and token without publishing** to check Instagram before enabling it as a live channel. Verify and renew expiring tokens in the Meta dashboard.

The public repository's Actions logs contain discovery counts and syndication outcomes. Use the private Upstash console to read `jb:reports:<run-id>:<attempt>` when configured.

The publishing job uses durable GitHub refs under `refs/newsroom/publications/`. GitHub accepts a single claim for each hash of `jb:syndication:<channel>:<account-id>:<slug>`. The job creates that claim before contacting the publishing provider and advances the ref without force as it records a submission or confirmed publication. The Git data contains the hash, the source commit and the provider’s receipt ID. Credentials, captions and inbox data are excluded. Only the gated publishing job gets repository write permission.

If a claim has no receipt, look up the actual post on the Page or profile. Keep the claim while the outcome is uncertain. An operator can reconcile it with a confirmed post ID or release the reservation after confirming there was no post and no run is still processing the claim. Keep the same ledger across runs so retries retain their claims.

[GitHub environment secrets](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) · [Brave Search API](https://api-dashboard.search.brave.com/app/documentation/web-search/response-headers) · [X developer console](https://console.x.com/) · [Meta app dashboard](https://developers.facebook.com/apps/1583995230155751/dashboard/) · [Facebook Page publishing](https://developers.facebook.com/docs/graph-api/reference/page/feed/) · [Instagram Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/)

## Vercel and Instagram inbox

Use the Vercel project assigned to `jamaicabasketball.online`. Set the following in that project's environment, then redeploy.

| Setting | Use |
| --- | --- |
| `META_APP_SECRET` | App secret for the Meta app delivering Instagram webhook events |
| `META_WEBHOOK_VERIFY_TOKEN` | A random callback verification token also entered in the Meta app |
| `IG_ACCOUNT_ID`, `IG_ACCESS_TOKEN`, `META_GRAPH_VERSION`, `IG_API_MODE` | The verified Instagram account ID, its token and the API version. Use `unified` for the newsroom app and grant `instagram_manage_messages` for DM replies. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Persistent ledger for status and retry deduplication |
| `BREVO_API_KEY`, `NEWSROOM_ALERT_FROM`, `NEWSROOM_ALERT_TO` | Transactional email API credential, verified sender email and editor email |
| `IG_INBOX_MODE` | Start with `observe` for signed events and alerts. Set to `reply` after testing. |
| `IG_PUBLIC_COMMENT_REPLIES` | Leave unset unless the editor opts in. Requires comment permissions, account subscription and inbox reply mode. |

Set the Instagram callback to `https://jamaicabasketball.online/api/instagram/webhook`. Configure the app's Instagram `messages` field, and subscribe the authorized Instagram professional account to that app. Add the `comments` field and `instagram_manage_comments` only if the editor requests alerts or replies for public comments. Verify account delivery using an actual inbound message from a permitted test account. Confirm that a general question or test attachment generates an alert, then verify the narrow approved replies in `reply` mode. Match the permissions and app mode to Meta's access rules.

A narrow set of greetings, website questions and tips questions can receive stock replies. Other cases route to the editor through Brevo. Public replies, if enabled, only respond to exact website questions on eligible top-level comments. DM text, usernames and attachments stay in Meta Business Suite. Alerts include a timestamp and reference. The inbox ledger contains hashed event keys and status for 30 days.

[Instagram Messaging setup](https://developers.facebook.com/documentation/business-messaging/instagram-messaging) · [Meta webhook events](https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram) · [Brevo transactional email](https://developers.brevo.com/reference/send-transac-email) · [Upstash REST credentials](https://upstash.com/docs/redis/features/restapi)

## Local checks

```sh
npm ci
node --test newsroom/newsroom.test.mjs
node newsroom/daily.mjs
npm run build
```

The local dry-run reads only configured discovery providers and saves `.newsroom/daily.json`. It skips all external publication. Keep keys in their respective credential stores. Use a local ignored environment file only for authorized development.

## Telegram group

Use the Jamaica Basketball bot in the selected group. Make the bot an administrator with Delete Messages access. Configure the bot token as an encrypted secret on GitHub and Vercel. Use the verified Telegram group ID in both places.

- In GitHub’s `newsroom` environment, set the `TELEGRAM_BOT_TOKEN` secret and the `TELEGRAM_GROUP_ID` and `TELEGRAM_START_DATE` variables. The start date is the first eligible article date in Jamaica in YYYY-MM-DD form. It prevents older stories from filling a new group. Use **Verify the Telegram bot, group, and deletion permission without sending** before adding `telegram` to the existing publication channels.
- In production Vercel, set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_GROUP_ID`, and a separate generated `TELEGRAM_WEBHOOK_SECRET`. Register the Telegram webhook at `https://jamaicabasketball.online/api/telegram/webhook` with that secret and only `message` and `edited_message` updates.
- The bot removes messages and captions matching clear profanity, direct insults, suspicious solicitations, or third-party group invite links. If the production Redis provider is configured, it also detects floods and repeats. That counter uses short-lived hashed identifiers and message fingerprints. The application does not log chat text or ban members. Admins can handle ambiguous cases directly in Telegram.

- In private chat with the bot, group members can use `/report <group message link> <reason>` or `/tip <details>`. The group owner must start the bot in private chat to receive submissions. The bot verifies membership, delivers submissions to the owner via Telegram and acknowledges confirmed delivery. Tips and reports do not appear in the group.

[Telegram Bot API](https://core.telegram.org/bots/api#setwebhook) · [Telegram group message delivery](https://core.telegram.org/bots/faq#what-messages-will-my-bot-get)

## Blotato syndication

Set the `BLOTATO_API_KEY` secret and the `BLOTATO_TIKTOK_ACCOUNT_ID`, `BLOTATO_TWITTER_ACCOUNT_ID` and `BLOTATO_START_DATE` variables in GitHub’s `newsroom` environment. The start date is the first eligible publication date in Jamaica. Dispatch the newsroom workflow with `check_blotato` to verify the destination IDs and handles without posting before adding the channels to `NEWSROOM_PUBLISH_CHANNELS`.

Only approved articles that are live on the website qualify. TikTok uses the article’s cleared JPEG or WebP photo, with the social crop preferred when available. X links to the article after its sharing image passes the same check used for Facebook. A Blotato submission ID is saved before checking the post’s status, so a later run checks it again without submitting another copy. Review failed submissions in Blotato before authorizing a retry.

[Blotato publishing status](https://help.blotato.com/rest-api-reference/publish-post/get-post)
