"use client";

import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[var(--mj-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <span className="mj-kicker text-[10px] text-[var(--mj-text-soft)]">{t("label")}</span>
      <select
        className="bg-transparent text-sm font-semibold tracking-[0.16em] text-[var(--mj-text)] outline-none"
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value as Locale })}
      >
        {locales.map((l) => (
          <option key={l} value={l} className="bg-slate-900 text-white">
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
