import { json, postJson } from "./services.mjs";

const base = "https://backend.blotato.com/v2";
const handles = { tiktok: "jamaicabasketball", twitter: "jamaicabasketb1" };
export const blotatoChannels = Object.keys(handles);
export const blotatoSubmissionFormat = /^[a-z0-9_-]{1,128}$/i;

function blotato(path, token, body) {
  const headers = { "blotato-api-key": token };
  return json(`${base}/${path}`, body ? postJson(body, headers) : { headers });
}

export async function verifyBlotatoTarget(channel) {
  const token = process.env.BLOTATO_API_KEY;
  const id = channel === "tiktok" ? process.env.BLOTATO_TIKTOK_ACCOUNT_ID : process.env.BLOTATO_TWITTER_ACCOUNT_ID;
  if (!token || !/^\d+$/.test(id || "")) throw new Error(`Blotato ${channel} is not configured`);
  const { items } = await blotato(`users/me/accounts?platform=${channel}`, token);
  if (!items?.some((entry) => String(entry.id) === id && entry.platform === channel &&
      entry.username?.replace(/^@/, "").toLowerCase() === handles[channel])) {
    throw new Error(`Blotato ${channel} account verification failed`);
  }
  return { id, token };
}

function truncate(text, limit) {
  const characters = Array.from(text);
  if (characters.length <= limit) return text;
  return characters.slice(0, limit - 1).join("").trimEnd() + "…";
}

export async function submitBlotatoPost(channel, account, { title, excerpt, url, photo, photoCaption }) {
  const tiktok = channel === "tiktok";
  const intro = [title, excerpt].filter(Boolean).join("\n\n");
  // Reserve space for X's weighted URL and allow for two units per code point.
  const text = tiktok ? `${(photoCaption || truncate(intro, 1800)).trim()}\n\nFull story at jamaicabasketball.online.` : `${truncate(intro, 125)}\n\n${url}`;
  const target = tiktok ? {
    targetType: channel,
    privacyLevel: "PUBLIC_TO_EVERYONE",
    disabledComments: false,
    disabledDuet: true,
    disabledStitch: true,
    isBrandedContent: false,
    isYourBrand: false,
    isAiGenerated: false,
    autoAddMusic: false,
    title: truncate(title, 90),
  } : { targetType: channel };
  return submit(account, { platform: channel, text, mediaUrls: photo ? [photo] : [] }, target);
}

export function scheduleBlotatoXPost(account, text, scheduledTime) {
  return submit(account, { platform: "twitter", text, mediaUrls: [] }, { targetType: "twitter" }, scheduledTime);
}

async function submit(account, content, target, scheduledTime) {
  const response = await blotato("posts", account.token, {
    post: { accountId: account.id, content, target },
    ...(scheduledTime && { scheduledTime }),
  });
  if (!blotatoSubmissionFormat.test(response.postSubmissionId || "")) {
    throw new Error("Blotato did not confirm a submission ID");
  }
  return response.postSubmissionId;
}

export async function blotatoPostStatus(account, id) {
  const result = await blotato(`posts/${id}`, account.token);
  if (result.postSubmissionId !== id) throw new Error("Unexpected Blotato status response");
  return result;
}
