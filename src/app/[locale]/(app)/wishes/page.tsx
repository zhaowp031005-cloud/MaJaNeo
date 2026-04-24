import { listWishesByStatus } from "@/server/wishes";
import { approveWishAction, deleteWishAction, rejectWishAction } from "./actions";

function WishSection({
  title,
  locale,
  wishes,
  mode,
}: {
  title: string;
  locale: string;
  wishes: Array<{
    id: string;
    nickname: string | null;
    content: string;
    emoji: string;
  }>;
  mode: "pending" | "reviewed";
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-4 space-y-3">
        {wishes.length ? (
          wishes.map((wish) => (
            <div key={wish.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-lg">
                {wish.emoji} <span className="text-sm text-white/85">{wish.content}</span>
              </div>
              <div className="mt-2 text-xs text-white/40">
                {wish.nickname ? `来自 ${wish.nickname}` : "来自一位朋友"}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {mode === "pending" ? (
                  <>
                    <form action={approveWishAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={wish.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        通过
                      </button>
                    </form>
                    <form action={rejectWishAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={wish.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80"
                      >
                        拒绝
                      </button>
                    </form>
                  </>
                ) : null}

                <form action={deleteWishAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={wish.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300"
                  >
                    删除
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/40">
            暂无内容
          </div>
        )}
      </div>
    </div>
  );
}

export default async function WishesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const [pending, approved, rejected] = await Promise.all([
    listWishesByStatus("PENDING"),
    listWishesByStatus("APPROVED"),
    listWishesByStatus("REJECTED"),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/70">Blessings</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">游客祝福审核</div>
        </div>
        <div className="text-xs text-white/45">后续即使通过，也可以删除</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {error ? (
          <div className="lg:col-span-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            操作失败，数据库可能暂时不可用，请稍后再试。
          </div>
        ) : null}
        <WishSection title="待审核" locale={locale} wishes={pending} mode="pending" />
        <WishSection title="已通过" locale={locale} wishes={approved} mode="reviewed" />
        <WishSection title="已拒绝" locale={locale} wishes={rejected} mode="reviewed" />
      </div>
    </div>
  );
}
