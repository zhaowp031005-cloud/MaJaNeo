"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authCookieName, isAuthed } from "@/server/auth";
import { deleteWish, reviewWish } from "@/server/wishes";

async function ensureFamily(locale: string) {
  const cookieStore = await cookies();
  const value = cookieStore.get(authCookieName)?.value;
  if (!isAuthed(value)) redirect(`/${locale}/login`);
}

export async function approveWishAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "zh");
  const id = String(formData.get("id") ?? "");
  await ensureFamily(locale);
  try {
    if (id) await reviewWish(id, "APPROVED");
  } catch {
    redirect(`/${locale}/wishes?error=db`);
  }

  redirect(`/${locale}/wishes`);
}

export async function rejectWishAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "zh");
  const id = String(formData.get("id") ?? "");
  await ensureFamily(locale);
  try {
    if (id) await reviewWish(id, "REJECTED");
  } catch {
    redirect(`/${locale}/wishes?error=db`);
  }

  redirect(`/${locale}/wishes`);
}

export async function deleteWishAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "zh");
  const id = String(formData.get("id") ?? "");
  await ensureFamily(locale);
  try {
    if (id) await deleteWish(id);
  } catch {
    redirect(`/${locale}/wishes?error=db`);
  }

  redirect(`/${locale}/wishes`);
}
