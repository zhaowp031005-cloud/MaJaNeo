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
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/70">{t("eyebrow")}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">{t("level")}</div>
          <div className="text-3xl font-semibold">{badge.title}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <RadarStats data={data} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {data.map((d) => (
          <div
            key={d.key}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm text-white/70">{d.label}</div>
            <div className="mt-2 text-2xl font-semibold">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
