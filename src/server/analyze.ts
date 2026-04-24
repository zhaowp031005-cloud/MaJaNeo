import { StatDimension } from "@/generated/prisma/client";

type Suggestion = { dimension: StatDimension; delta: number; reason: string };

const rules: Array<{
  dimension: StatDimension;
  delta: number;
  keywords: string[];
  reason: string;
}> = [
  {
    dimension: "LANGUAGE",
    delta: 2,
    keywords: ["说", "讲", "读", "背", "唱", "story", "read", "talk", "singen", "lesen", "sprechen"],
    reason: "语言相关行为"
  },
  {
    dimension: "MOTOR",
    delta: 2,
    keywords: ["跑", "跳", "爬", "骑", "球", "swim", "run", "jump", "klettern", "rennen", "springen"],
    reason: "运动相关行为"
  },
  {
    dimension: "COGNITION",
    delta: 2,
    keywords: ["拼图", "积木", "数", "颜色", "形状", "problem", "puzzle", "count", "farben", "formen", "rätsel"],
    reason: "认知探索相关行为"
  },
  {
    dimension: "SOCIAL",
    delta: 2,
    keywords: ["分享", "一起", "朋友", "合作", "share", "friend", "together", "teilen", "freund", "zusammen"],
    reason: "社交合作相关行为"
  },
  {
    dimension: "EMOTION",
    delta: 2,
    keywords: ["生气", "开心", "害怕", "安慰", "情绪", "calm", "happy", "angry", "beruhigt", "glücklich", "wütend"],
    reason: "情绪管理相关行为"
  },
  {
    dimension: "SELFCARE",
    delta: 2,
    keywords: ["自己", "刷牙", "穿衣", "吃饭", "上厕所", "independent", "wash", "dress", "essen", "anziehen", "zähne"],
    reason: "自理能力相关行为"
  }
];

export function suggestStatEvents(content: string) {
  const text = content.toLowerCase();
  const suggestions: Suggestion[] = [];

  for (const rule of rules) {
    if (rule.keywords.some((k) => text.includes(k.toLowerCase()))) {
      suggestions.push({
        dimension: rule.dimension,
        delta: rule.delta,
        reason: rule.reason,
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      dimension: "COGNITION",
      delta: 1,
      reason: "默认：记录一次成长事件",
    });
  }

  return suggestions;
}
