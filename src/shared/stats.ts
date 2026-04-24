export const statDimensions = [
  { key: "LANGUAGE", zh: "语言表达", en: "Language", de: "Sprache" },
  { key: "MOTOR", zh: "运动协调", en: "Motor", de: "Motorik" },
  { key: "COGNITION", zh: "认知探索", en: "Cognition", de: "Kognition" },
  { key: "SOCIAL", zh: "社交合作", en: "Social", de: "Sozial" },
  { key: "EMOTION", zh: "情绪管理", en: "Emotion", de: "Emotion" },
  { key: "SELFCARE", zh: "自理能力", en: "Self-care", de: "Selbstständigkeit" }
] as const;

export type StatDimensionKey = (typeof statDimensions)[number]["key"];

export function labelForLocale(d: (typeof statDimensions)[number], locale: string) {
  if (locale === "de") return d.de;
  if (locale === "en") return d.en;
  return d.zh;
}
