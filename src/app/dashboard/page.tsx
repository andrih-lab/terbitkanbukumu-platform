import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { formatIdr } from "@/lib/format";

export default async function DashboardPage() {
  const author = await requireAuthor();

  const [projectCount, referenceCount, orderStats] = await Promise.all([
    prisma.bookProject.count({ where: { authorId: author.id } }),
    prisma.reference.count({
      where: { bookProject: { authorId: author.id } },
    }),
    prisma.order.aggregate({
      where: { bookProject: { authorId: author.id }, status: "LUNAS" },
      _count: true,
      _sum: { authorEarningIdr: true },
    }),
  ]);

  const stats = [
    { label: "Proyek Buku", value: projectCount },
    { label: "Referensi Diunggah", value: referenceCount },
    { label: "Buku Terjual", value: orderStats._count },
    {
      label: "Pendapatan Tervalidasi",
      value: formatIdr(orderStats._sum.authorEarningIdr ?? 0),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Selamat datang, {author.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-slate-600">
        Ringkasan aktivitas penerbitan buku Anda.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Mulai Proyek Buku Baru
          </h2>
          <Link
            href="/dashboard/buku/baru"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Buku Baru
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Masukkan topik dan unggah referensi ilmiah Anda untuk mulai
          mengembangkan naskah buku baru.
        </p>
      </div>
    </div>
  );
}
