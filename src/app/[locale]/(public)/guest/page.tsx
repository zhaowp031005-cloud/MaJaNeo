import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { listApprovedWishes } from "@/server/wishes";
import { submitWishAction } from "./actions";

const emojiOptions = [
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

export default async function GuestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { sent, error } = await searchParams;
  const t = await getTranslations("guest");
  const wishes = await listApprovedWishes();
  const seedItems = wishes.length
    ? wishes.slice(0, 24)
    : [
        { id: "placeholder-1", emoji: "✨", content: t("barrage1"), nickname: null },
        { id: "placeholder-2", emoji: "🌙", content: t("barrage2"), nickname: null },
        { id: "placeholder-3", emoji: "💫", content: t("barrage3"), nickname: null },
      ];
  const barrageItems = Array.from({ length: Math.max(18, seedItems.length * 4) }, (_, index) => {
    const wish = seedItems[index % seedItems.length]!;
    return {
      ...wish,
      id: `${wish.id}-lane-${index}`,
    };
  });

  return (
    <div className="mj-page relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 z-0">
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
            {wish.emoji} {wish.content} · {wish.nickname || t("fromAnonymous")}
          </div>
        ))}
      </div>

      <main className="mj-shell relative z-10 w-full max-w-6xl rounded-[2.2rem] px-5 py-5 sm:px-7 sm:py-7">
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="mj-eyebrow">{t("eyebrow")}</div>
              <h1 className="mj-title mt-4 text-5xl leading-none sm:text-6xl">{t("title")}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--mj-text-muted)]">{t("subtitle")}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--mj-text-soft)]">
                <span className="mj-stat-chip rounded-full px-4 py-2">{t("eyebrow")}</span>
                <span className="mj-stat-chip rounded-full px-4 py-2">{wishes.length}</span>
                <span className="mj-stat-chip rounded-full px-4 py-2">{t("listTitle")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-[var(--mj-text-muted)] hover:bg-white/10 hover:text-[var(--mj-text)]"
                aria-label={t("back")}
                title={t("back")}
              >
                ←
              </Link>
              <LocaleSwitcher />
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
            <div className="mj-panel-strong rounded-[2rem] p-6 sm:p-7">
              <div className="mj-kicker text-[10px]">{t("formTitle")}</div>
              <form action={submitWishAction} className="mt-5 space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <label className="grid gap-1 text-sm text-white/70">
                  {t("nameLabel")}
                  <input
                    name="nickname"
                    maxLength={24}
                    className="mj-input rounded-2xl px-4 py-3"
                    placeholder={t("namePlaceholder")}
                  />
                </label>

                <label className="grid gap-1 text-sm text-white/70">
                  {t("contentLabel")}
                  <textarea
                    name="content"
                    maxLength={120}
                    required
                    className="mj-textarea min-h-36 rounded-2xl px-4 py-3"
                    placeholder={t("contentPlaceholder")}
                  />
                </label>

                <div className="grid gap-2 text-sm text-white/70">
                  <div>{t("emojiLabel")}</div>
                  <select
                    name="emoji"
                    defaultValue="✨"
                    className="mj-select rounded-2xl px-4 py-3 text-sm"
                  >
                    {emojiOptions.map((emoji) => (
                      <option key={emoji} value={emoji}>
                        {emoji}
                      </option>
                    ))}
                  </select>
                </div>

                {sent ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {t("success")}
                  </div>
                ) : null}
                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {t("error")}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="mj-button-primary rounded-full px-5 py-2.5 text-sm font-semibold"
                >
                  {t("submit")}
                </button>
              </form>
            </div>

            <div className="mj-panel rounded-[2rem] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="mj-kicker text-[10px]">{t("listTitle")}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--mj-text-soft)]">
                  {wishes.length} items
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {wishes.length ? (
                  wishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="rounded-[1.35rem] border border-white/10 bg-[rgba(4,8,14,0.46)] px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">
                          {wish.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm leading-7 text-[var(--mj-text)]">{wish.content}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--mj-text-soft)]">
                            {wish.nickname
                              ? t("fromNamed", { name: wish.nickname })
                              : t("fromAnonymous")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-white/10 bg-[rgba(4,8,14,0.46)] px-4 py-6 text-sm text-[var(--mj-text-soft)]">
                    {t("empty")}
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
