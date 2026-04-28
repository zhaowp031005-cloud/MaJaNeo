import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authCookieName, isAuthed } from "@/server/auth";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function AppLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const t = await getTranslations();

  const cookieStore = await cookies();
  const value = cookieStore.get(authCookieName)?.value;
  if (!isAuthed(value)) redirect(`/${locale}/login`);

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(7,8,11,0.66)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/family" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-[var(--mj-accent-strong)]">
              N
            </span>
            <span>
              <span className="mj-kicker block text-[10px]">Family Archive</span>
              <span className="mj-title text-2xl leading-none">MaJaNeo</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/family" className="hover:text-white">
              {t("nav.dashboard")}
            </Link>
            <Link href="/timeline" className="hover:text-white">
              {t("nav.timeline")}
            </Link>
            <Link href="/stats" className="hover:text-white">
              {t("nav.stats")}
            </Link>
            <Link href="/wishes" className="hover:text-white">
              {t("nav.wishes")}
            </Link>
            <Link
              href="/post/new"
              className="mj-button-primary rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em]"
            >
              {t("nav.new")}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
