import { getTranslations } from "next-intl/server";
import { getTotals } from "@/server/stats";
import { RadarStats } from "@/components/RadarStats";
import { labelForLocale, statDimensions } from "@/shared/stats";
import { formatNeoBadge, getNeoMeta } from "@/server/neo";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("stats");
  const totals = await getTotals();
  const rootT = await getTranslations();
  const badge = formatNeoBadge(getNeoMeta(), {
    name: rootT("neo.name"),
    expectedTitle: rootT("neo.expectedTitle"),
    dobPrefix: rootT("neo.dobPrefix"),
    eddPrefix: rootT("neo.eddPrefix"),
    overdue: rootT("neo.overdue"),
    formatDays: (days) => rootT("neo.days", { count: days }),
  });
  const values = statDimensions.map((d) => totals.get(d.key as any) ?? 0);
  const max = Math.max(10, ...values, 0);

  const data = statDimensions.map((d) => ({
    key: d.key,
    label: labelForLocale(d, locale),
    value: totals.get(d.key as any) ?? 0,
    fullMark: max,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mj-eyebrow">{t("eyebrow")}</div>
          <div className="mj-title mt-3 text-5xl">{t("title")}</div>
          <p className="mt-4 text-sm leading-7 text-[var(--mj-text-muted)]">{t("description")}</p>
        </div>
        <div className="mj-shell rounded-[1.6rem] px-5 py-4 text-right">
          <div className="mj-kicker text-[10px]">{t("level")}</div>
          <div className="mj-title mt-2 text-3xl">{badge.title}</div>
          <div className="mt-1 text-sm text-[var(--mj-text-soft)]">{badge.subtitle}</div>
        </div>
      </div>

      <div className="mj-shell mt-8 rounded-[2rem] p-6">
        <RadarStats data={data} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data.map((d) => (
          <div
            key={d.key}
            className="mj-panel rounded-[1.5rem] p-5"
          >
            <div className="mj-kicker text-[10px]">{d.label}</div>
            <div className="mt-3 text-3xl font-semibold text-[var(--mj-text)]">{d.value}</div>
            <div className="mt-2 text-sm text-[var(--mj-text-soft)]">Full mark {d.fullMark}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
