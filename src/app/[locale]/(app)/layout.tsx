import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authCookieName, isAuthed } from "@/server/auth";
import { Link } from "@/i18n/navigation";

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
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#07080a]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/family" className="text-sm font-semibold tracking-tight">
            MaJaNeo
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
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
              className="rounded-full bg-white px-4 py-1.5 text-black"
            >
              {t("nav.new")}
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
