import Link from "next/link";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-indigo-700">
          TerbitkanBukumu
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Dashboard Saya
            </Link>
          ) : (
            <>
              <Link href="/masuk" className="text-slate-700 hover:text-indigo-700">
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
