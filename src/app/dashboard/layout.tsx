import Link from "next/link";
import { requireAuthor } from "@/lib/session";
import { signOutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/buku", label: "Buku Saya" },
  { href: "/dashboard/penjualan", label: "Penjualan" },
  { href: "/dashboard/tarik-dana", label: "Tarik Dana" },
  { href: "/dashboard/profil", label: "Profil" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const author = await requireAuthor();

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <aside className="border-b border-slate-200 bg-slate-900 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="px-6 py-5">
          <Link href="/" className="text-lg font-bold text-white">
            TerbitkanBukumu
          </Link>
          <p className="mt-1 truncate text-xs text-slate-400">{author.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="px-3 pb-6 lg:mt-auto">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Keluar
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-slate-50 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
