import crypto from "node:crypto";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Satu akun Midtrans dipakai untuk dua jenis transaksi (penjualan buku &
// penerbitan ISBN) yang datang dari tabel berbeda (Order / PublishingRequest)
// — prefix ini biar webhook tahu tabel mana yang harus di-update, tanpa
// mengubah id asli di database.
export type MidtransOrderKind = "book" | "isbn";

export function buildMidtransOrderId(kind: MidtransOrderKind, id: string): string {
  return `${kind}-${id}`;
}

export function parseMidtransOrderId(
  orderId: string,
): { kind: MidtransOrderKind; id: string } | null {
  const match = orderId.match(/^(book|isbn)-(.+)$/);
  if (!match) return null;
  return { kind: match[1] as MidtransOrderKind, id: match[2] };
}

// @types/midtrans-client cuma mendeklarasikan `transaction_details` —
// field lain di bawah ini nyata & didukung API Snap Midtrans (lihat docs),
// jadi didefinisikan sendiri di sini lalu di-cast saat memanggil SDK.
type SnapCreateTransactionParams = {
  transaction_details: { order_id: string; gross_amount: number };
  customer_details: { first_name: string; email: string };
  item_details: { id: string; price: number; quantity: number; name: string }[];
  callbacks: { finish: string };
};

export async function createSnapTransaction(params: {
  // Order ID yang dikirim ke Midtrans — pakai buildMidtransOrderId(...).
  midtransOrderId: string;
  grossAmount: number;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
  // Path relatif (mis. "/pesanan/xxx") tujuan redirect setelah pembeli
  // selesai bayar — beda jenis transaksi, beda halaman tujuan.
  finishPath: string;
}) {
  const payload: SnapCreateTransactionParams = {
    transaction_details: {
      order_id: params.midtransOrderId,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      first_name: params.buyerName,
      email: params.buyerEmail,
    },
    item_details: [
      {
        id: params.midtransOrderId,
        price: params.grossAmount,
        quantity: 1,
        name: params.itemName.slice(0, 50),
      },
    ],
    callbacks: {
      finish: `${process.env.APP_URL}${params.finishPath}`,
    },
  };

  const transaction = await snap.createTransaction(
    payload as unknown as Parameters<typeof snap.createTransaction>[0],
  );

  return transaction as { token: string; redirect_url: string };
}

// Verifikasi signature_key dari notifikasi webhook Midtrans:
// SHA-512(order_id + status_code + gross_amount + server_key). Pakai
// nilai mentah dari body notifikasi, jangan dibentuk ulang.
export function verifyMidtransSignature(body: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const raw = `${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === body.signature_key;
}
