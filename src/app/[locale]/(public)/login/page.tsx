import { getTranslations } from "next-intl/server";
import { loginAction } from "./actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations("login");

  return (
    <div className="mj-page flex flex-1 items-center justify-center px-6 py-16">
      <div className="mj-hero-orb left-[12%] top-[18%] h-48 w-48 bg-[rgba(145,185,255,0.14)]" />
      <div className="mj-hero-orb right-[10%] top-[28%] h-60 w-60 bg-[rgba(216,182,122,0.12)]" />

      <main className="mj-shell w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mj-eyebrow">{t("eyebrow")}</div>
            <div className="mj-title mt-3 text-4xl">MaJaNeo</div>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="mt-5 max-w-md text-sm leading-7 text-[var(--mj-text-muted)]">{t("subtitle")}</div>

        <form action={loginAction} className="mt-8 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="grid gap-2 text-sm text-[var(--mj-text-soft)]">
            {t("passcodeLabel")}
            <input
              name="passcode"
              type="password"
              className="mj-input rounded-2xl px-4 py-3.5 text-sm"
              placeholder={t("placeholder")}
              required
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {t("error")}
            </div>
          ) : null}
          <button
            type="submit"
            className="mj-button-primary w-full rounded-2xl px-4 py-3.5 text-sm font-semibold"
          >
            {t("submit")}
          </button>
        </form>
      </main>
    </div>
  );
}
