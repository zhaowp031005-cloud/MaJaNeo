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
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        {barrageItems.map((wish, index) => (
          <div
            key={wish.id}
            className="mj-barrage-item absolute whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45 backdrop-blur-sm"
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

      <main className="relative z-10 w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{t("home.title")}</h1>
            <span className="text-sm text-white/50">{t("app.tagline")}</span>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_-40px_rgba(0,0,0,0.9)]">
            <p className="text-white/70">{t("home.subtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/timeline"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
              >
                {t("home.ctaTimeline")}
              </Link>
              <Link
                href="/post/new"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-5 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                {t("home.ctaNewPost")}
              </Link>
              <Link
                href="/wishes"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-5 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                {t("family.reviewCta")}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
            <div className="text-sm font-medium text-white/80">{t("family.neoLabel")}</div>
            <div className="mt-3 text-5xl font-semibold tracking-tight">{badge.title}</div>
            <div className="mt-2 text-sm text-white/60">{badge.subtitle}</div>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-medium text-white/75">{t("family.latestTitle")}</div>
              <div className="mt-4 space-y-3">
                {latestWishes.length ? (
                  latestWishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75"
                    >
                      <div>
                        {wish.emoji} {wish.content}
                      </div>
                      <div className="mt-2 text-xs text-white/35">
                        {wish.nickname
                          ? t("family.fromNamed", { name: wish.nickname })
                          : t("family.fromAnonymous")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/35">
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
