import { bearer, graph, json } from "./services.mjs";

const topics = [
  'Jamaica basketball FIBA national team women men youth 3x3',
  'Jamaica ISSA school basketball under-14 under-16 under-19 girls boys rural urban',
  'Jamaica basketball JABA NBL club parish community league business house',
  'Jamaica basketball youth grassroots academy wheelchair university intercollegiate',
  'Jamaican basketball players diaspora NBA WNBA NCAA professional overseas',
  'site:instagram.com Jamaica basketball JABA ISSA 3x3',
  'site:x.com Jamaica Jamaican basketball FIBA ISSA JABA',
];

const hashtags = ["jamaicabasketball", "jamaicanbasketball", "issabasketball", "jabasketball"];
const xQueries = [
  '((Jamaica OR Jamaican) basketball OR #JamaicaBasketball) -is:retweet',
  '((ISSA OR JABA) basketball) -is:retweet',
];

async function searchWeb() {
  const token = process.env.BRAVE_SEARCH_API_KEY;
  if (!token) return null;
  return searchEach(topics, async (q) => {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.search = new URLSearchParams({ q, freshness: "pw", count: "8", text_decorations: "false" });
    const data = await json(url, { headers: { "X-Subscription-Token": token, Accept: "application/json" } });
    return (data.web?.results || []).map(({ url, age }) => ({ url, date: age }));
  });
}

async function searchX() {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return null;
  return searchEach(xQueries, async (query) => {
    const url = new URL("https://api.x.com/2/tweets/search/recent");
    url.search = new URLSearchParams({
      query,
      start_time: new Date(Date.now() - 48 * 3600_000).toISOString(),
      max_results: "25",
      "tweet.fields": "created_at",
    });
    const data = await json(url, { headers: bearer(token) });
    if (data.errors?.length) throw new Error("X returned incomplete search results");
    return (data.data || []).map(({ id, created_at }) => ({ url: `https://x.com/i/web/status/${id}`, date: created_at }));
  });
}

async function searchInstagram() {
  const unified = process.env.IG_API_MODE === "unified";
  const dedicated = process.env.IG_DISCOVERY_USER_TOKEN || process.env.IG_FACEBOOK_LOGIN_ID;
  const token = dedicated ? process.env.IG_DISCOVERY_USER_TOKEN : unified && process.env.IG_ACCESS_TOKEN;
  const id = dedicated ? process.env.IG_FACEBOOK_LOGIN_ID : unified && process.env.IG_ACCOUNT_ID;
  if (!token || !/^\d+$/.test(id || "")) return null;
  const handles = (process.env.IG_DISCOVERY_HANDLES || "").split(",")
    .map((handle) => handle.trim()).filter((handle) => /^[a-zA-Z0-9._]{1,30}$/.test(handle)).slice(0, 8);
  const queries = [...handles.map((handle) => `@${handle}`), ...hashtags.map((tag) => `#${tag}`)];
  return searchEach(queries, async (query) => {
    const name = query.slice(1);
    if (query.startsWith("@")) {
      const fields = `business_discovery.username(${name}){media.limit(10){permalink,timestamp}}`;
      const data = await graph(id, token, { fields });
      return (data.business_discovery?.media?.data || [])
        .filter(({ timestamp }) => Date.parse(timestamp) > Date.now() - 7 * 86400_000)
        .map(({ permalink, timestamp }) => ({ url: permalink, date: timestamp }));
    }
    const q = name;
    const search = await graph("ig_hashtag_search", token, { user_id: id, q });
    const hashtagId = search.data?.[0]?.id;
    if (!/^\d+$/.test(hashtagId || "")) return [];
    const media = await graph(`${hashtagId}/recent_media`, token, { user_id: id, fields: "permalink,timestamp", limit: "25" });
    return (media.data || []).map(({ permalink, timestamp }) => ({ url: permalink, date: timestamp }));
  }, (query, error) => {
    if (query.startsWith("#") && error?.code === 10) return "hashtags-unapproved";
  });
}

async function searchEach(queries, search, stopOnError) {
  const leads = new Map();
  const errors = [];
  let completed = 0;
  let stopped;
  for (const query of queries) {
    try {
      for (const lead of await search(query)) {
        if (typeof lead.url !== "string" || !URL.canParse(lead.url) || new URL(lead.url).protocol !== "https:") continue;
        const current = leads.get(lead.url);
        if (current) current.queries.push(query);
        else leads.set(lead.url, { ...lead, queries: [query] });
      }
      completed++;
    } catch (error) {
      const message = String(error?.message || error);
      const reason = stopOnError?.(query, error);
      if (reason) {
        stopped = { reason, query, message };
        break;
      }
      errors.push({ query, message });
    }
  }
  const failures = errors.length;
  const status = failures ? (completed ? "partial" : "failed") : stopped?.reason || "ok";
  return { status, failures, errors, ...(stopped && { stopped }), leads: [...leads.values()] };
}

export async function discover() {
  const providers = { web: searchWeb, instagram: searchInstagram, x: searchX };
  const results = await Promise.all(Object.entries(providers).map(async ([name, search]) => [
    name, await search() || { status: "unconfigured", leads: [] },
  ]));
  return Object.fromEntries(results);
}
