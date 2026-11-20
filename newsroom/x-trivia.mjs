import { blotatoPostStatus, scheduleBlotatoXPost, verifyBlotatoTarget } from "./blotato.mjs";
import { publicationLedger } from "./publication-ledger.mjs";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Jamaica", dateStyle: "short" });
const { TRIVIA_DATE: date, TRIVIA_QUESTION: question, TRIVIA_ANSWER: answer, TRIVIA_SOURCE: source } = process.env;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || today.format(new Date()) !== date) {
  throw new Error("Choose today's date in Jamaica for the trivia pair");
}
const sourceUrl = URL.parse(source || "");
if (!sourceUrl || sourceUrl.protocol !== "https:" || sourceUrl.username || sourceUrl.password) {
  throw new Error("Supply a public HTTPS source for the trivia answer");
}
const questionText = question?.trim();
const answerText = answer?.trim();
if (!questionText || !answerText || /https?:\/\//i.test(questionText + answerText)) {
  throw new Error("Supply the question and answer as text and send the reference URL in its own field");
}
const slots = [
  { name: "question", text: questionText, time: "12:15" },
  { name: "answer", text: `${answerText}\n\n${sourceUrl.href}`, time: "18:30" },
];
for (const { text } of slots) {
  const weighted = Array.from(text.replace(sourceUrl.href, "x".repeat(23)))
    .reduce((length, character) => length + (character.codePointAt(0) > 0x10ff ? 2 : 1), 0);
  if (weighted > 280) throw new Error("The question or answer exceeds X's 280-character limit");
}
const account = await verifyBlotatoTarget("twitter");

for (const { name, text, time } of slots) {
  const scheduledTime = new Date(`${date}T${time}:00-05:00`);
  if (scheduledTime.getTime() < Date.now() + 60000) throw new Error(`The X trivia ${name} slot has passed or is less than a minute away`);
  const ledger = publicationLedger(`jb:x-trivia:${account.id}:${date}:${name}`);
  const reservation = await ledger.reserve();
  if (reservation === "already-published") {
    console.log(`${name} already published`);
    continue;
  }
  let id;
  if (reservation === "reserved") {
    id = await scheduleBlotatoXPost(account, text, scheduledTime.toISOString());
    await ledger.record(`blotato-pending:${id}`);
  } else if (reservation.startsWith("blotato-pending:")) {
    id = reservation.slice("blotato-pending:".length);
  } else {
    throw new Error(`X trivia ${name} needs manual reconciliation`);
  }
  let result = await blotatoPostStatus(account, id);
  for (let attempt = 0; attempt < 3 && result.status === "in-progress"; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    result = await blotatoPostStatus(account, id);
  }
  if (result.status === "published") {
    await ledger.record(`blotato-published:${id}`);
    console.log(`${name} published ${result.publicUrl || id}`);
  } else if (result.status === "scheduled" && Date.parse(result.scheduledTime) === scheduledTime.getTime()) {
    console.log(`${name} scheduled ${scheduledTime.toISOString()} ${id}`);
  } else {
    throw new Error(`X trivia ${name} requires review in Blotato (${id})`);
  }
}
