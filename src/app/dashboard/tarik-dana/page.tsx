import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { formatIdr } from "@/lib/format";

export default async function TarikDanaPage() {
  const author = await requireAuthor();

  const [earnings, withdrawals] = await Promise.all([
    prisma.order.aggregate({
      where: { bookProject: { authorId: author.id }, status: "LUNAS" },
      _sum: { authorEarningIdr: true },
    }),
    prisma.withdrawalRequest.aggregate({
      where: { authorId: author.id, status: { in: ["DIPROSES", "SELESAI"] } },
      _sum: { grossIdr: true },
    }),
  ]);

  const totalEarned = earnings._sum.authorEarningIdr ?? 0;
  const totalWithdrawn = withdrawals._sum.grossIdr ?? 0;
  const availableBalance = totalEarned - totalWithdrawn;

  const profileComplete = Boolean(
    author.bankName && author.bankAccountNumber && author.bankAccountName,
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Tarik Dana</h1>
      <p className="mt-1 text-slate-600">
        Cairkan hasil penjualan buku Anda ke rekening pribadi.
      </p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Saldo Tersedia</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatIdr(availableBalance)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Saldo dihitung dari total pendapatan buku terjual dikurangi
          penarikan yang sudah diproses.
        </p>
      </div>

      {!profileComplete && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Lengkapi data bank dan NPWP di{" "}
          <Link href="/dashboard/profil" className="font-medium underline">
            halaman Profil
          </Link>{" "}
          sebelum dapat mengajukan penarikan dana.
        </div>
      )}

      <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Ajukan Penarikan Dana
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Segera hadir — fitur ini menunggu integrasi payment gateway dan
          disbursement (rencana: Xendit/Midtrans) untuk pencairan otomatis ke
          rekening bank, lengkap dengan pemotongan pajak dan komisi pengelola
          platform sesuai kebijakan yang berlaku. Lihat{" "}
          <span className="font-medium">ROADMAP.md</span> untuk rencana fase
          ini.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-lg bg-indigo-300 px-4 py-2 text-sm font-semibold text-white"
        >
          Ajukan Penarikan
        </button>
      </section>
    </div>
  );
}
