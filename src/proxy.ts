import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/routing";

const proxy = createMiddleware({
  locales: [...locales],
  defaultLocale,
});

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
