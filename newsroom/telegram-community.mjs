import { telegram } from "./telegram.mjs";

const tipHelp = "Send /tip followed by what happened, the teams or players involved, the date, and a source link if you have one. Your message goes privately to the Jamaica Basketball group owner for newsroom review.";
const reportHelp = "Copy the message link from the Jamaica Basketball group. Send /report followed by that link and a short reason. Your report goes privately to the group owner.";
const help = "Jamaica Basketball community bot\n\n/report — Report a group message privately.\n/tip — Share a basketball news lead privately.";

function reportLink(text, id) {
  const [link] = text.split(/\s/u, 1);
  const group = id.slice(4);
  return link.match(/^https:\/\/t\.me\/c\/([1-9]\d*)\/([1-9]\d*)(?:\/([1-9]\d*))?(?:\?single)?$/u)?.[1] === group;
}

export async function handleTelegramCommunityUpdate(update, { id, token }) {
  const message = update?.message;
  const sender = message?.from?.id;
  if (message?.chat?.type !== "private" || message.chat.id !== sender ||
      !Number.isSafeInteger(sender) || sender <= 0 || message.from.is_bot ||
      !Number.isSafeInteger(message.message_id) || typeof message.text !== "string") return;

  const command = /^\/(start|help|report|tip)(?:@jamaicabasketball_bot)?(?:\s+([\s\S]+))?$/iu.exec(message.text.trim());
  if (!command) return;
  const action = command[1].toLowerCase();
  const details = command[2]?.trim() ?? "";
  const send = (chat_id, text) => telegram("sendMessage", token, {
    chat_id, text, link_preview_options: { is_disabled: true },
  });
  const reply = async (text) => {
    try {
      await send(sender, text);
    } catch {
      console.error("Telegram community reply could not be confirmed");
    }
  };

  if (action === "start" || action === "help") {
    await reply(details === "report" ? reportHelp : details === "tip" ? tipHelp : help);
    return;
  }
  if (!details || (action === "report" && !reportLink(details, id))) {
    await reply(action === "report" ? reportHelp : tipHelp);
    return;
  }
  if (details.length > 2000) {
    await reply("Please shorten your message to 2,000 characters and send it again.");
    return;
  }

  try {
    const member = await telegram("getChatMember", token, { chat_id: id, user_id: sender });
    if (!["creator", "administrator", "member"].includes(member.status) &&
        !(member.status === "restricted" && member.is_member)) {
      await reply("Join the Jamaica Basketball Telegram group before submitting a tip or report.");
      return;
    }

    const admins = await telegram("getChatAdministrators", token, { chat_id: id });
    const owner = admins.find((admin) => admin.status === "creator" && !admin.user?.is_bot);
    if (!Number.isSafeInteger(owner?.user?.id)) throw new Error("Telegram group owner unavailable");
    const title = action === "report" ? "Group message report" : "Newsroom tip";
    const delivery = await send(owner.user.id, `Jamaica Basketball • ${title}\n\n${details}`);
    if (!delivery?.message_id) throw new Error("Telegram private delivery was not confirmed");
  } catch {
    // Telegram can receive a submission even if the acknowledgement is interrupted.
    // Do not transparently retry the handoff and send the owner the same message twice.
    console.error("Telegram community submission could not be confirmed");
    await reply("I couldn't confirm delivery. Please message a Jamaica Basketball group admin privately.");
    return;
  }
  await reply(action === "report" ? "Your report was sent privately for review." : "Your tip was sent privately for newsroom review.");
}
