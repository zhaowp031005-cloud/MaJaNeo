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
  const wishes = await listApprovedWishes();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/60">Public Blessings</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">你想对 Neo 说什么？</h1>
            <p className="mt-3 max-w-2xl text-white/65">
              留一句小话，再挑个 emoji。过审后，它会出现在公开墙，也会悄悄飘进家人首页。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-white/75 hover:bg-white/5"
              aria-label="返回入口"
              title="返回入口"
            >
              ←
            </Link>
            <LocaleSwitcher />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-medium text-white/75">丢一颗小星星</div>
            <form action={submitWishAction} className="mt-5 space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <label className="grid gap-1 text-sm text-white/70">
                你的名字（可空着）
                <input
                  name="nickname"
                  maxLength={24}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30"
                  placeholder="比如：Maya / 路过的朋友"
                />
              </label>

              <label className="grid gap-1 text-sm text-white/70">
                想说什么
                <textarea
                  name="content"
                  maxLength={120}
                  required
                  className="min-h-32 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30"
                  placeholder="给 Neo 留一句温柔的话"
                />
              </label>

              <div className="grid gap-2 text-sm text-white/70">
                <div>心情 emoji</div>
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
                  收到啦。过审后它就会冒出来。
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  这次没飞出去，再试一下。
                </div>
              ) : null}

              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
              >
                发射
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
            <div className="text-sm font-medium text-white/75">已经亮起来的话</div>
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
                      {wish.nickname ? `来自 ${wish.nickname}` : "来自一位路过的朋友"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/40">
                  这里还空空的，等第一句小话落下来。
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
