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
    <div className="mj-panel rounded-[1.8rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="mj-title text-2xl">{title}</div>
        <div className="mj-stat-chip rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
          {wishes.length}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {wishes.length ? (
          wishes.map((wish) => (
            <div key={wish.id} className="rounded-[1.4rem] border border-white/10 bg-[rgba(4,8,14,0.46)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">
                  {wish.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-7 text-[var(--mj-text)]">{wish.content}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--mj-text-soft)]">
                    {wish.nickname
                      ? labels.fromNamed.replace("{name}", wish.nickname)
                      : labels.fromAnonymous}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {mode === "pending" ? (
                  <>
                    <form action={approveWishAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={wish.id} />
                      <button
                        type="submit"
                        className="mj-button-primary rounded-full px-4 py-2 text-sm font-medium"
                      >
                        {labels.approve}
                      </button>
                    </form>
                    <form action={rejectWishAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={wish.id} />
                      <button
                        type="submit"
                        className="mj-button-secondary rounded-full px-4 py-2 text-sm"
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
          <div className="rounded-[1.4rem] border border-white/10 bg-[rgba(4,8,14,0.46)] px-4 py-6 text-sm text-[var(--mj-text-soft)]">
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
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mj-eyebrow">{t("eyebrow")}</div>
          <div className="mj-title mt-3 text-5xl">{t("title")}</div>
          <div className="mt-4 text-sm leading-7 text-[var(--mj-text-muted)]">{t("subtitle")}</div>
        </div>
        <div className="mj-stat-chip rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]">
          {t("queueLabel")}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {error ? (
          <div className="lg:col-span-3 rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
