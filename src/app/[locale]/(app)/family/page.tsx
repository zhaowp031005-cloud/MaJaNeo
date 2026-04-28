import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { formatNeoBadge, getNeoMeta } from "@/server/neo";
import { listApprovedWishes } from "@/server/wishes";

export default async function FamilyHomePage() {
  const t = await getTranslations();
  const badge = formatNeoBadge(getNeoMeta(), {
    name: t("neo.name"),
    expectedTitle: t("neo.expectedTitle"),
    dobPrefix: t("neo.dobPrefix"),
    eddPrefix: t("neo.eddPrefix"),
    overdue: t("neo.overdue"),
    formatDays: (days) => t("neo.days", { count: days }),
  });
  const wishes = await listApprovedWishes();
  const seedItems = wishes.length
    ? wishes.slice(0, 24)
    : [
        { id: "placeholder-1", emoji: "✨", content: t("family.barrage1") },
        { id: "placeholder-2", emoji: "🌙", content: t("family.barrage2") },
        { id: "placeholder-3", emoji: "💫", content: t("family.barrage3") },
      ];
  const barrageItems = Array.from({ length: Math.max(18, seedItems.length * 4) }, (_, index) => {
    const wish = seedItems[index % seedItems.length]!;
    return {
      ...wish,
      id: `${wish.id}-lane-${index}`,
    };
  });
  const latestWishes = wishes.slice(0, 3);

  return (
    <div className="mj-page relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        {barrageItems.map((wish, index) => (
          <div
            key={wish.id}
            className="mj-barrage-item absolute whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--mj-text-soft)] backdrop-blur-sm"
            style={{
              top: `${6 + (index % 12) * 7.2}%`,
              left: `${-30 - (index % 6) * 18}%`,
              animationDelay: `${(index % 12) * 1.15}s`,
              animationDuration: `${16 + (index % 7) * 2.4}s`,
            }}
          >
            {wish.emoji} {wish.content}
          </div>
        ))}
      </div>

      <main className="relative z-10 w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mj-eyebrow">{t("family.eyebrow")}</div>
            <h1 className="mj-title mt-3 text-5xl sm:text-6xl">{t("home.title")}</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--mj-text-muted)]">{t("app.tagline")}</p>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="mj-shell rounded-[2rem] p-6 sm:p-8">
            <div className="mj-kicker text-[10px]">{t("family.briefLabel")}</div>
            <div className="mj-title mt-4 text-4xl sm:text-5xl">{badge.title}</div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--mj-text-muted)]">{t("home.subtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--mj-text-soft)]">
              <span className="mj-stat-chip rounded-full px-4 py-2">{badge.subtitle}</span>
              <span className="mj-stat-chip rounded-full px-4 py-2">
                {t("family.highlighted", { count: latestWishes.length })}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/timeline"
                className="mj-button-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                {t("home.ctaTimeline")}
              </Link>
              <Link
                href="/post/new"
                className="mj-button-secondary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
              >
                {t("home.ctaNewPost")}
              </Link>
              <Link
                href="/wishes"
                className="mj-button-secondary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
              >
                {t("family.reviewCta")}
              </Link>
            </div>
          </div>

          <div className="mj-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="mj-kicker text-[10px]">{t("family.neoLabel")}</div>
                <div className="mj-title mt-3 text-4xl">{badge.title}</div>
                <div className="mt-2 text-sm text-[var(--mj-text-muted)]">{badge.subtitle}</div>
              </div>
              <div className="mj-float rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--mj-accent-strong)]">
                Neo
              </div>
            </div>
            <div className="mj-soft-divider mt-6" />
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[rgba(4,8,14,0.42)] p-4">
              <div className="text-sm font-medium text-[var(--mj-text)]">{t("family.latestTitle")}</div>
              <div className="mt-4 space-y-3">
                {latestWishes.length ? (
                  latestWishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-[var(--mj-text-muted)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg">
                          {wish.emoji}
                        </div>
                        <div>
                          <div className="leading-7 text-[var(--mj-text)]">{wish.content}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--mj-text-soft)]">
                            {wish.nickname
                              ? t("family.fromNamed", { name: wish.nickname })
                              : t("family.fromAnonymous")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-6 text-sm text-[var(--mj-text-soft)]">
                    {t("family.empty")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
