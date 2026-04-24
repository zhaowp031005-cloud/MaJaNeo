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
  const totals = await getTotals();
  const badge = formatNeoBadge(getNeoMeta());
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
          <div className="text-sm font-medium text-white/70">Stats</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Neo</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">Level</div>
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
