export async function json(url, options = {}) {
  const service = new URL(url).hostname;
  let response;
  try {
    response = await fetch(url, { ...options, redirect: "error", signal: AbortSignal.timeout(12000) });
  } catch {
    throw new Error(`${service} request could not be confirmed`);
  }
  if (!response.ok) {
    const detail = await errorDetail(response);
    throw new Error(`${service} returned HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.json();
}

// Surface the service's own reason (e.g. Meta's error.message) without echoing long or credential-like strings.
async function errorDetail(response) {
  let text;
  try {
    text = await response.text();
  } catch {
    return "";
  }
  let detail = text;
  try {
    const body = JSON.parse(text);
    const error = body?.error;
    detail = [error?.message, error?.code && `code ${error.code}`, error?.error_subcode && `subcode ${error.error_subcode}`]
      .filter(Boolean).join(", ") || (typeof error === "string" && error) || body?.message || text;
  } catch {}
  return String(detail).replace(/[A-Za-z0-9_\-.]{40,}/g, "[redacted]").replace(/\s+/g, " ").trim().slice(0, 300);
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
