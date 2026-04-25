import { getTranslations } from "next-intl/server";
import { listWishesByStatus } from "@/server/wishes";
import { approveWishAction, deleteWishAction, rejectWishAction } from "./actions";

function WishSection({
  title,
  locale,
  wishes,
  mode,
  labels,
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
  labels: {
    fromNamed: string;
    fromAnonymous: string;
    approve: string;
    reject: string;
    delete: string;
    empty: string;
  };
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
                {wish.nickname
                  ? labels.fromNamed.replace("{name}", wish.nickname)
                  : labels.fromAnonymous}
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
                        {labels.approve}
                      </button>
                    </form>
                    <form action={rejectWishAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={wish.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80"
                      >
                        {labels.reject}
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
                    {labels.delete}
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/40">
            {labels.empty}
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
  const t = await getTranslations("wishes");
  const [pending, approved, rejected] = await Promise.all([
    listWishesByStatus("PENDING"),
    listWishesByStatus("APPROVED"),
    listWishesByStatus("REJECTED"),
  ]);
  const labels = {
    fromNamed: t("fromNamed"),
    fromAnonymous: t("fromAnonymous"),
    approve: t("approve"),
    reject: t("reject"),
    delete: t("delete"),
    empty: t("empty"),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/70">{t("eyebrow")}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</div>
        </div>
        <div className="text-xs text-white/45">{t("subtitle")}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {error ? (
          <div className="lg:col-span-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {t("error")}
          </div>
        ) : null}
        <WishSection title={t("pending")} locale={locale} wishes={pending} mode="pending" labels={labels} />
        <WishSection title={t("approved")} locale={locale} wishes={approved} mode="reviewed" labels={labels} />
        <WishSection title={t("rejected")} locale={locale} wishes={rejected} mode="reviewed" labels={labels} />
      </div>
    </div>
  );
}
