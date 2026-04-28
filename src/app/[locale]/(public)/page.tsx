import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export default async function EntryPage() {
  const t = await getTranslations("entry");

  return (
    <div className="mj-page flex flex-1 items-center justify-center px-6 py-16 sm:py-20">
      <div className="mj-hero-orb mj-slow-pulse left-[10%] top-[12%] h-44 w-44 bg-[rgba(145,185,255,0.16)]" />
      <div className="mj-hero-orb right-[8%] top-[18%] h-56 w-56 bg-[rgba(216,182,122,0.12)]" />

      <main className="mj-shell w-full max-w-6xl rounded-[2.2rem] px-5 py-6 sm:px-8 sm:py-8">
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="mj-eyebrow">{t("eyebrow")}</div>
              <h1 className="mj-title mt-4 text-5xl leading-none sm:text-7xl">{t("title")}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--mj-text-muted)] sm:text-base">
                {t("subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--mj-text-soft)]">
                <span className="mj-stat-chip rounded-full px-4 py-2">Family Archive</span>
                <span className="mj-stat-chip rounded-full px-4 py-2">Guest Blessings</span>
                <span className="mj-stat-chip rounded-full px-4 py-2">Growth Timeline</span>
              </div>
            </div>
            <LocaleSwitcher />
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Link
              href="/guest"
              className="group mj-panel block rounded-[2rem] p-6 sm:p-8"
            >
              <div className="mj-kicker text-[10px]">{t("guestLabel")}</div>
              <div className="mj-title mt-4 text-3xl sm:text-4xl">{t("guest")}</div>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--mj-text-muted)]">
                {t("guestDesc")}
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--mj-text)] group-hover:bg-white/5">
                <span>{t("guestEnter")}</span>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>

            <Link
              href="/login"
              className="group mj-panel-strong block rounded-[2rem] p-6 sm:p-8"
            >
              <div className="mj-kicker text-[10px]">{t("familyLabel")}</div>
              <div className="mj-title mt-4 text-3xl sm:text-4xl">{t("family")}</div>
              <p className="mt-4 max-w-md text-sm leading-7 text-[var(--mj-text-muted)]">
                {t("familyDesc")}
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#120f0b] mj-button-primary">
                <span>{t("familyEnter")}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
