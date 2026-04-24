import { prisma } from "@/server/db";
import { StatDimension } from "@/generated/prisma/client";
import { statDimensions } from "@/shared/stats";

export async function getTotals() {
  const grouped = (await prisma.statEvent
    .groupBy({
      by: ["dimension"],
      _sum: { delta: true },
    })
    .catch(() => [])) as Array<{ dimension: StatDimension; _sum: { delta: number | null } }>;

  const totals = new Map<StatDimension, number>();
  for (const dim of statDimensions) totals.set(dim.key as StatDimension, 0);
  for (const row of grouped) totals.set(row.dimension, row._sum.delta ?? 0);

  return totals;
}
