"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authCookieName, isPasscodeValid } from "@/server/auth";

export async function loginAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "zh");
  const passcode = String(formData.get("passcode") ?? "");

  if (!isPasscodeValid(passcode)) {
    redirect(`/${locale}/login?error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set(authCookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  });

  redirect(`/${locale}/family`);
}
