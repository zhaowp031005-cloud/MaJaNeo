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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
      <span className="opacity-70">{t("label")}</span>
      <select
        className="bg-transparent outline-none"
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value as Locale })}
      >
        {locales.map((l) => (
          <option key={l} value={l} className="text-black">
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
