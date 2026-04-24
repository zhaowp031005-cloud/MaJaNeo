export const locales = ["zh", "en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
