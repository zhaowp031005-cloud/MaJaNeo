import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const resolved = await requestLocale;
  const locale: Locale =
    resolved && locales.includes(resolved as Locale)
      ? (resolved as Locale)
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
