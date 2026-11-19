export async function json(url, options = {}) {
  const service = new URL(url).hostname;
  let response;
  try {
    response = await fetch(url, { ...options, redirect: "error", signal: AbortSignal.timeout(12000) });
  } catch {
    throw new Error(`${service} request could not be confirmed`);
  }
  if (!response.ok) throw new Error(`${service} returned HTTP ${response.status}`);
  return response.json();
}

export function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

export function postJson(body, headers = {}) {
  return { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export function redis(...command) {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;
  if (!url || !token) throw new Error("Newsroom Redis is not configured");
  return json(url, postJson(command, bearer(token))).then(({ result, error }) => {
    if (error) throw new Error("Newsroom Redis command failed");
    return result;
  });
}

export function graph(path, token, params = {}, method = "GET", host = "graph.facebook.com") {
  const version = process.env.META_GRAPH_VERSION;
  if (!/^v\d+\.\d+$/.test(version || "") || !token) throw new Error("Meta Graph credentials or version are missing");
  const url = new URL(`https://${host}/${version}/${path}`);
  if (method === "GET") {
    url.search = new URLSearchParams(params).toString();
    return json(url, { headers: bearer(token) });
  }
  return json(url, postJson(params, bearer(token)));
}

export function instagramHost() {
  const mode = process.env.IG_API_MODE;
  if (!mode || mode === "instagram-login") return "graph.instagram.com";
  if (mode === "unified") return "graph.facebook.com";
  throw new Error("Unsupported Instagram API mode");
}
