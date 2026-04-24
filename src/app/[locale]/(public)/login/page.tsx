import { loginAction } from "./actions";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">MaJaNeo</div>
          <LocaleSwitcher />
        </div>

        <div className="mt-2 text-sm text-white/70">这扇门只给家人开</div>

        <form action={loginAction} className="mt-6 space-y-3">
          <input type="hidden" name="locale" value={locale} />
          <input
            name="passcode"
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30"
            placeholder="家庭口令"
            required
          />
          {error ? (
            <div className="text-sm text-red-300">咒语不对，再试一次</div>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
          >
            进屋
          </button>
        </form>
      </main>
    </div>
  );
}
