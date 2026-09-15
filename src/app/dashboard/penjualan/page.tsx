import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { formatDate, formatIdr } from "@/lib/format";

export default async function PenjualanPage() {
  const author = await requireAuthor();

  const orders = await prisma.order.findMany({
    where: { bookProject: { authorId: author.id } },
    include: { bookProject: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalEarning = orders
    .filter((order) => order.status === "LUNAS")
    .reduce((sum, order) => sum + order.authorEarningIdr, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Laporan Penjualan</h1>
      <p className="mt-1 text-slate-600">
        Riwayat penjualan buku Anda di TerbitkanBukumu.
      </p>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Total Pendapatan (buku terjual)</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatIdr(totalEarning)}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Belum ada penjualan.</p>
          <p className="mt-2 text-sm text-slate-500">
            Marketplace penjualan daring sedang dalam pengembangan — lihat
            ROADMAP.md. Setelah aktif, setiap transaksi akan tercatat di sini
            secara otomatis, lengkap dengan rincian komisi dan pajak.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Buku</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Pendapatan Anda</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {order.bookProject.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatIdr(order.priceIdr)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatIdr(order.authorEarningIdr)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
