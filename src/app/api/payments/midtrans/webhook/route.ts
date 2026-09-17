import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";

type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MidtransNotification;

  if (!verifyMidtransSignature(body)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.order_id },
  });
  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  const { transaction_status, fraud_status } = body;

  if (
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept")
  ) {
    if (order.status !== "LUNAS") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "LUNAS", paidAt: new Date() },
      });
    }
  } else if (
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "expire"
  ) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DIBATALKAN" },
    });
  } else if (
    transaction_status === "refund" ||
    transaction_status === "partial_refund"
  ) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUND" },
    });
  }
  // "pending" dan status lain: tidak diubah, tunggu notifikasi berikutnya.

  return NextResponse.json({ received: true });
}
