"use server";

import { redirect } from "next/navigation";
import { createWish } from "@/server/wishes";

const allowedEmojis = [
  "🥰",
  "❤️",
  "✨",
  "😊",
  "🌈",
  "🌟",
  "🫶",
  "🐣",
  "😄",
  "🥹",
  "😌",
  "🤍",
  "💛",
  "💚",
  "💙",
  "💜",
  "🩵",
  "🩷",
  "🌙",
  "☀️",
  "⭐",
  "🎈",
  "🎁",
  "🍀",
  "🦋",
  "🐳",
  "🐻",
  "🐰",
  "🌸",
  "🌻",
  "🍓",
  "🧁",
];

export async function submitWishAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "zh");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "✨");

  if (!content || content.length > 120 || !allowedEmojis.includes(emoji)) {
    redirect(`/${locale}/guest?error=1`);
  }

  try {
    await createWish({ nickname, content, emoji });
  } catch {
    redirect(`/${locale}/guest?error=db`);
  }

  redirect(`/${locale}/guest?sent=1`);
}
