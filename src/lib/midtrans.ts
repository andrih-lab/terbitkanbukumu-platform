import crypto from "node:crypto";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

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
  orderId: string;
  grossAmount: number;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
}) {
  const payload: SnapCreateTransactionParams = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      first_name: params.buyerName,
      email: params.buyerEmail,
    },
    item_details: [
      {
        id: params.orderId,
        price: params.grossAmount,
        quantity: 1,
        name: params.itemName.slice(0, 50),
      },
    ],
    callbacks: {
      finish: `${process.env.APP_URL}/pesanan/${params.orderId}`,
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
