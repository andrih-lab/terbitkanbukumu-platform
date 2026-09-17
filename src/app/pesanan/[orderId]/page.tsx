import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { formatIdr } from "@/lib/format";

const STATUS_COPY: Record<
  string,
  { title: string; description: string }
> = {
  MENUNGGU_PEMBAYARAN: {
    title: "Menunggu Pembayaran",
    description:
      "Pesanan Anda belum lunas. Kalau sudah membayar tapi status belum berubah, tunggu beberapa menit lalu muat ulang halaman ini.",
  },
  LUNAS: {
    title: "Pembayaran Berhasil",
    description: "Terima kasih! Buku Anda sudah bisa diunduh di bawah ini.",
  },
  DIBATALKAN: {
    title: "Pembayaran Dibatalkan",
    description: "Transaksi ini dibatalkan atau kedaluwarsa.",
  },
  REFUND: {
    title: "Dana Dikembalikan",
    description: "Transaksi ini sudah di-refund.",
  },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { bookProject: true },
  });

  if (!order) {
    notFound();
  }

  const copy = STATUS_COPY[order.status] ?? STATUS_COPY.MENUNGGU_PEMBAYARAN;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{copy.description}</p>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left text-sm">
            <p className="font-medium text-slate-800">
              {order.bookProject.title}
            </p>
            <p className="mt-1 text-slate-600">{formatIdr(order.priceIdr)}</p>
          </div>

          {order.status === "LUNAS" && (
            <a
              href={`/api/orders/${order.id}/download`}
              target="_blank"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Unduh Buku
            </a>
          )}
        </div>
      </main>
    </>
  );
}
