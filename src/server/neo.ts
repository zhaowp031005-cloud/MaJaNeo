function parseDate(input: string | undefined) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fullYearsBetween(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  const m = to.getMonth() - from.getMonth();
  if (m < 0 || (m === 0 && to.getDate() < from.getDate())) years -= 1;
  return Math.max(0, years);
}

export type NeoMeta =
  | { kind: "born"; dob: Date; level: number }
  | { kind: "expected"; dueDate: Date; daysLeft: number }
  | { kind: "unknown" };

function emojiForLevel(level: number) {
  const lv = Math.max(1, Math.min(100, Math.floor(level)));
  const decade = Math.min(9, Math.floor((lv - 1) / 10));
  const emojis = ["🍼", "🧸", "🚲", "🎒", "🎓", "💼", "🏡", "🌿", "🧘", "🏆"];
  return emojis[decade] ?? "⭐";
}

export function getNeoMeta(now = new Date()): NeoMeta {
  const dob = parseDate(process.env["NEO_DOB"] ?? "2026-04-23");
  if (dob && dob.getTime() <= now.getTime()) {
    return { kind: "born", dob, level: Math.min(100, fullYearsBetween(dob, now) + 1) };
  }

  const dueDate = parseDate(process.env["NEO_DUE_DATE"] ?? "2026-04-24");
  if (dueDate) {
    const msLeft = dueDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return { kind: "expected", dueDate, daysLeft };
  }

  return { kind: "unknown" };
}

export function formatNeoBadge(meta: NeoMeta) {
  if (meta.kind === "born") {
    const lv = meta.level;
    return {
      title: `LV${lv} ${emojiForLevel(lv)}`,
      subtitle: `DOB ${formatYmd(meta.dob)}`,
    };
  }

  if (meta.kind === "expected") {
    const left = meta.daysLeft;
    return {
      title: "Expected ⭐",
      subtitle: `EDD ${formatYmd(meta.dueDate)} · ${left >= 0 ? `${left} days` : "overdue"}`,
    };
  }

  return { title: "Neo", subtitle: "" };
}
