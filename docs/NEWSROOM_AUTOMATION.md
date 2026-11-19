# Jamaica Basketball newsroom automation

The daily Codex desk searches public sources and prepares a private, source-linked brief, original MDX drafts and separate Instagram and Facebook captions. Drafts are kept under the ignored `.newsroom/` directory. GitHub Actions runs scheduled discovery and syndication at 7:15 a.m. Jamaica time once the workflow is on `main`. The initial mode is dry-run. Instagram inbox handling starts when a signed Meta webhook reaches a configured Vercel deployment.

## Editorial workflow

1. Review new leads against the organizer, team, governing body or independent firsthand reporting. Confirm the sport, age group, teams, venue, result and local date. Check existing posts for the same event and cite sources inline or in a source list.
2. Submit an original article through the existing CMS or as a reviewed change in `content/posts/`. Follow the editorial guidelines and use owned or rights-cleared imagery. Record any required credit. The site publishes from `main` through its Git deployment.
3. To include the article in social syndication, explicitly set `draft: false`, `syndicate: true`, an ISO date in the form `"YYYY-MM-DD"`, and both `instagramCaption` and `facebookCaption`. Use a unique slug. The next eligible run checks for the article’s syndication marker on the production domain before calling Meta. Instagram uses the existing Jamaica Basketball logo JPEG, and Facebook posts the article link.
4. Check the GitHub Actions run. The workflow skips stories outside the current seven-day Jamaica-local publication window. `waiting-for-site` means the live article marker was absent. Retry after Vercel deploys or let the next scheduled run pick it up. `needs-review` means an external request may already have succeeded. Check the relevant Meta channel before resolving the ledger entry.

The Codex editorial desk performs a public web and indexed-social pass even before the native search integrations are connected. Native discovery searches a bounded set of queries and public Instagram hashtags or selected professional handles. A private, seven-day Redis report contains the lead URLs, per-provider coverage and publication statuses when Redis is configured in GitHub Actions. The run log names the report key. Search results are leads. The action accepts social copy only from approved posts in Git.

## GitHub Actions

Use the repository's `newsroom` environment and restrict it to `main`. Enter credentials in GitHub environment secrets.

| Setting | Store | Use |
| --- | --- | --- |
| `BRAVE_SEARCH_API_KEY` | Secret | Brave Search web discovery |
| `X_BEARER_TOKEN` | Secret | X recent search with read access and a funded project |
| `IG_DISCOVERY_USER_TOKEN` | Secret | Meta Facebook Login token for Instagram hashtag and Business Discovery |
| `IG_FACEBOOK_LOGIN_ID` | Variable | Professional account ID returned via the linked Page for Facebook Login discovery |
| `IG_DISCOVERY_HANDLES` | Optional variable | Up to eight verified public professional handles, comma-separated without @ |
| `IG_ACCESS_TOKEN` | Secret | Instagram Login token for @jamaicabasketball with publishing permission |
| `IG_ACCOUNT_ID` | Variable | Instagram Login account ID returned by `/me` for @jamaicabasketball |
| `FB_PAGE_ACCESS_TOKEN` | Secret | Page access token for Jamaica Basketball with permission to create Page posts |
| `FB_PAGE_ID` | Variable | Jamaica Basketball Page ID confirmed in Meta Business Suite |
| `META_GRAPH_VERSION` | Variable | Supported Graph API version shown in the Meta app dashboard, in the form `v27.0` |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Secrets | Private reports and persistent publication ledger |
| `NEWSROOM_PUBLISH_LIVE` | Variable | Set to `true` after approving the dry-run and independently checking both targets |

Instagram discovery and publishing use separate Meta login products and can have different account IDs. Confirm professional account status, the Page link, API permissions and access level for the app. Instagram Login publishing uses `instagram_business_basic` and `instagram_business_content_publishing`. Facebook requires a Page token with `pages_manage_posts`, plus the access needed to enumerate and read the managed Page. Start with the workflow's **Verify the Instagram and Facebook account IDs without publishing** input. Compare both resulting IDs with the assets in Meta Business Suite. Verify and renew expiring tokens in the Meta dashboard.

The public repository's Actions logs contain discovery counts and syndication outcomes. Use the private Upstash console to read `jb:reports:<run-id>:<attempt>`, which expires after seven days. Keep the social ledger persistent. If a record is stuck on `sending`, use the Redis console to reconcile `jb:syndication:<channel>:<account-id>:<slug>` against the Page or profile. Record the confirmed post ID if it was published. Clear a claim only after confirming that the channel did not publish it and no workflow is still running.

[GitHub environment secrets](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) · [Brave Search API](https://api-dashboard.search.brave.com/app/documentation/web-search/response-headers) · [X developer console](https://console.x.com/) · [Meta app dashboard](https://developers.facebook.com/apps/) · [Facebook Page publishing](https://developers.facebook.com/docs/graph-api/reference/page/feed/) · [Meta Instagram API collection](https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api)

## Vercel and Instagram inbox

Use the Vercel project assigned to `jamaicabasketball.online`. Set the following in that project's environment, then redeploy.

| Setting | Use |
| --- | --- |
| `META_APP_SECRET` | App secret for the Meta app delivering Instagram webhook events |
| `META_WEBHOOK_VERIFY_TOKEN` | A random callback verification token also entered in the Meta app |
| `IG_ACCOUNT_ID`, `IG_ACCESS_TOKEN`, `META_GRAPH_VERSION` | Instagram Login account ID, token and version. Include `instagram_business_manage_messages` for DM replies. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Persistent ledger for status and retry deduplication |
| `BREVO_API_KEY`, `NEWSROOM_ALERT_FROM`, `NEWSROOM_ALERT_TO` | Transactional email API credential, verified sender email and editor email |
| `IG_INBOX_MODE` | Start with `observe` for signed events and alerts. Set to `reply` after testing. |
| `IG_PUBLIC_COMMENT_REPLIES` | Leave unset unless the editor opts in. Requires comment permissions, account subscription and inbox reply mode. |

Set the Instagram callback to `https://jamaicabasketball.online/api/instagram/webhook`. Configure the app's Instagram `messages` field, and subscribe the authorized Instagram professional account to that app. Add the `comments` field and `instagram_business_manage_comments` only if the editor requests alerts or replies for public comments. Verify account delivery using an actual inbound message from a permitted test account. Confirm that a general question or test attachment generates an alert, then verify the narrow approved replies in `reply` mode. Match the permissions and app mode to Meta's access rules.

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
