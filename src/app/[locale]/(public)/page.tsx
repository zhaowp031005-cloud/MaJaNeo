import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export default async function EntryPage() {
  const t = await getTranslations("entry");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/60">MaJaNeo</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-3 text-white/65">{t("subtitle")}</p>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/guest"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            {t("guest")}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
          >
            {t("family")}
          </Link>
        </div>
      </main>
    </div>
  );
}
