import { StatDimension } from "@/generated/prisma/client";
import { locales, type Locale } from "@/i18n/routing";

export type Suggestion = { dimension: StatDimension; delta: number; reason: string };

const rules: Array<{
  dimension: StatDimension;
  delta: number;
  keywords: string[];
  reasonKey:
    | "language"
    | "motor"
    | "cognition"
    | "social"
    | "emotion"
    | "selfcare";
}> = [
  {
    dimension: "LANGUAGE",
    delta: 2,
    keywords: ["说", "讲", "读", "背", "唱", "story", "read", "talk", "singen", "lesen", "sprechen"],
    reasonKey: "language",
  },
  {
    dimension: "MOTOR",
    delta: 2,
    keywords: ["跑", "跳", "爬", "骑", "球", "swim", "run", "jump", "klettern", "rennen", "springen"],
    reasonKey: "motor",
  },
  {
    dimension: "COGNITION",
    delta: 2,
    keywords: ["拼图", "积木", "数", "颜色", "形状", "problem", "puzzle", "count", "farben", "formen", "rätsel"],
    reasonKey: "cognition",
  },
  {
    dimension: "SOCIAL",
    delta: 2,
    keywords: ["分享", "一起", "朋友", "合作", "share", "friend", "together", "teilen", "freund", "zusammen"],
    reasonKey: "social",
  },
  {
    dimension: "EMOTION",
    delta: 2,
    keywords: ["生气", "开心", "害怕", "安慰", "情绪", "calm", "happy", "angry", "beruhigt", "glücklich", "wütend"],
    reasonKey: "emotion",
  },
  {
    dimension: "SELFCARE",
    delta: 2,
    keywords: ["自己", "刷牙", "穿衣", "吃饭", "上厕所", "independent", "wash", "dress", "essen", "anziehen", "zähne"],
    reasonKey: "selfcare",
  }
];

const reasonMessages = {
  zh: {
    language: "语言相关行为",
    motor: "运动相关行为",
    cognition: "认知探索相关行为",
    social: "社交合作相关行为",
    emotion: "情绪管理相关行为",
    selfcare: "自理能力相关行为",
    fallback: "默认：记录一次成长事件",
  },
  en: {
    language: "Language-related activity",
    motor: "Motor-related activity",
    cognition: "Cognition and exploration activity",
    social: "Social and cooperation activity",
    emotion: "Emotion management activity",
    selfcare: "Self-care activity",
    fallback: "Default: record one growth moment",
  },
  de: {
    language: "Sprachbezogene Aktivität",
    motor: "Motorische Aktivität",
    cognition: "Aktivität zu Kognition und Entdeckung",
    social: "Soziale und kooperative Aktivität",
    emotion: "Aktivität zur Emotionsregulation",
    selfcare: "Aktivität zur Selbstständigkeit",
    fallback: "Standard: ein Wachstumsmoment wird festgehalten",
  },
} as const;

function normalizeLocale(localeInput = "zh") {
  return (locales.includes(localeInput as Locale) ? localeInput : "zh") as Locale;
}

function getReasonMap(localeInput = "zh") {
  return reasonMessages[normalizeLocale(localeInput)];
}

function clampDelta(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-2, Math.min(5, Math.round(n)));
}

function isDimension(value: unknown): value is StatDimension {
  return (
    value === "LANGUAGE" ||
    value === "MOTOR" ||
    value === "COGNITION" ||
    value === "SOCIAL" ||
    value === "EMOTION" ||
    value === "SELFCARE"
  );
}

export function suggestStatEvents(content: string, localeInput = "zh") {
  const locale = (locales.includes(localeInput as Locale) ? localeInput : "zh") as Locale;
  const reasonMap = reasonMessages[locale];
  const text = content.toLowerCase();
  const suggestions: Suggestion[] = [];

  for (const rule of rules) {
    if (rule.keywords.some((k) => text.includes(k.toLowerCase()))) {
      suggestions.push({
        dimension: rule.dimension,
        delta: rule.delta,
        reason: reasonMap[rule.reasonKey],
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      dimension: "COGNITION",
      delta: 1,
      reason: reasonMap.fallback,
    });
  }

  return suggestions;
}

function extractJsonArray(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

export async function suggestStatEventsWithDeepSeek(content: string, localeInput = "zh") {
  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) {
    return { suggestions: suggestStatEvents(content, localeInput), source: "rules" as const };
  }

  const locale = normalizeLocale(localeInput);
  const reasonMap = getReasonMap(locale);
  const languagePrompt =
    locale === "de"
      ? "Antworte auf Deutsch."
      : locale === "en"
        ? "Respond in English."
        : "请用中文作答。";

  const systemPrompt = [
    "You are a child growth scoring assistant for MaJaNeo.",
    languagePrompt,
    "Analyze only the user's text content.",
    "Score only these six dimensions: LANGUAGE, MOTOR, COGNITION, SOCIAL, EMOTION, SELFCARE.",
    "For each dimension, choose an integer delta between -2 and 5.",
    "Only include dimensions with enough evidence from the text.",
    "Each item must contain: dimension, delta, reason.",
    "Return JSON array only. No markdown. No explanation outside JSON.",
  ].join(" ");

  const userPrompt = [
    "Text to analyze:",
    content,
    "",
    "Return example:",
    '[{"dimension":"LANGUAGE","delta":2,"reason":"..."}]',
  ].join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Return a JSON object with key "suggestions". ${userPrompt}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`DEEPSEEK_HTTP_${res.status}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawContent = json.choices?.[0]?.message?.content ?? "";
  if (!rawContent) {
    throw new Error("DEEPSEEK_EMPTY");
  }

  let parsedSuggestions: unknown;
  try {
    const parsed = JSON.parse(rawContent) as { suggestions?: unknown };
    parsedSuggestions = parsed.suggestions;
  } catch {
    const arrayText = extractJsonArray(rawContent);
    if (!arrayText) throw new Error("DEEPSEEK_INVALID_JSON");
    parsedSuggestions = JSON.parse(arrayText);
  }

  if (!Array.isArray(parsedSuggestions)) {
    throw new Error("DEEPSEEK_INVALID_SHAPE");
  }

  const normalized: Suggestion[] = parsedSuggestions
    .map((item) => {
      const row = item as { dimension?: unknown; delta?: unknown; reason?: unknown };
      if (!isDimension(row.dimension)) return null;
      const delta = clampDelta(row.delta);
      if (delta === 0) return null;
      return {
        dimension: row.dimension,
        delta,
        reason:
          typeof row.reason === "string" && row.reason.trim()
            ? row.reason.trim().slice(0, 120)
            : reasonMap.fallback,
      } satisfies Suggestion;
    })
    .filter((item): item is Suggestion => Boolean(item));

  if (!normalized.length) {
    return { suggestions: suggestStatEvents(content, locale), source: "rules" as const };
  }

  const deduped = Array.from(
    new Map(normalized.map((item) => [item.dimension, item])).values()
  );

  return { suggestions: deduped, source: "deepseek" as const };
}
