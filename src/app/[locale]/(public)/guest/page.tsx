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
  const barrageItems = wishes.length
    ? wishes.slice(0, 24)
    : [
        { id: "placeholder-1", emoji: "✨", content: t("barrage1") },
        { id: "placeholder-2", emoji: "🌙", content: t("barrage2") },
        { id: "placeholder-3", emoji: "💫", content: t("barrage3") },
      ];

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        {barrageItems.map((wish, index) => (
          <div
            key={wish.id}
            className="mj-barrage-item absolute whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/35 backdrop-blur-sm"
            style={{
              top: `${8 + (index % 10) * 8.5}%`,
              left: `${-15 - (index % 5) * 8}%`,
              animationDelay: `${(index % 8) * 1.1}s`,
              animationDuration: `${18 + (index % 6) * 2.5}s`,
            }}
          >
            {wish.emoji} {wish.content}
          </div>
        ))}
      </div>

      <main className="relative z-10 w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/60">{t("eyebrow")}</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-3 max-w-2xl text-white/65">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 hover:bg-white/5"
              aria-label={t("back")}
              title={t("back")}
            >
              ←
            </Link>
            <LocaleSwitcher />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-medium text-white/75">{t("formTitle")}</div>
            <form action={submitWishAction} className="mt-5 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <label className="grid gap-1 text-sm text-white/70">
                {t("nameLabel")}
                <input
                  name="nickname"
                  maxLength={24}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30"
                  placeholder={t("namePlaceholder")}
                />
              </label>

              <label className="grid gap-1 text-sm text-white/70">
                {t("contentLabel")}
                <textarea
                  name="content"
                  maxLength={120}
                  required
                  className="min-h-32 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30"
                  placeholder={t("contentPlaceholder")}
                />
              </label>

              <div className="grid gap-2 text-sm text-white/70">
                <div>{t("emojiLabel")}</div>
                <select
                  name="emoji"
                  defaultValue="✨"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                >
                  {emojiOptions.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>

              {sent ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {t("success")}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {t("error")}
                </div>
              ) : null}

              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
              >
                {t("submit")}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
            <div className="text-sm font-medium text-white/75">{t("listTitle")}</div>
            <div className="mt-5 space-y-3">
              {wishes.length ? (
                wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="text-lg">
                      {wish.emoji}{" "}
                      <span className="text-sm text-white/85">{wish.content}</span>
                    </div>
                    <div className="mt-2 text-xs text-white/40">
                      {wish.nickname ? t("fromNamed", { name: wish.nickname }) : t("fromAnonymous")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/40">
                  {t("empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
