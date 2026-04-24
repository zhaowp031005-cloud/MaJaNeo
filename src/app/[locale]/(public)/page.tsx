import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export default function EntryPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/60">MaJaNeo</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">游客，还是家人？</h1>
            <p className="mt-3 text-white/65">先选一个小入口。</p>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/guest"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            游客
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
          >
            家人
          </Link>
        </div>
      </main>
    </div>
  );
}
