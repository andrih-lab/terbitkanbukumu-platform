import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMidtransOrderId, verifyMidtransSignature } from "@/lib/midtrans";

type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
};

function isPaid(transaction_status: string, fraud_status?: string) {
  return (
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept")
  );
}

function isCancelled(transaction_status: string) {
  return (
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "expire"
  );
}

function isRefunded(transaction_status: string) {
  return transaction_status === "refund" || transaction_status === "partial_refund";
}

export async function POST(request: Request) {
  const body = (await request.json()) as MidtransNotification;

  if (!verifyMidtransSignature(body)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const parsed = parseMidtransOrderId(body.order_id);
  if (!parsed) {
    return new NextResponse("Unknown order_id format", { status: 404 });
  }

  const { transaction_status, fraud_status } = body;

  if (parsed.kind === "book") {
    const order = await prisma.order.findUnique({ where: { id: parsed.id } });
    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (isPaid(transaction_status, fraud_status)) {
      if (order.status !== "LUNAS") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "LUNAS", paidAt: new Date() },
        });
      }
    } else if (isCancelled(transaction_status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "DIBATALKAN" },
      });
    } else if (isRefunded(transaction_status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "REFUND" },
      });
    }
    // "pending" dan status lain: tidak diubah, tunggu notifikasi berikutnya.
  } else {
    const req = await prisma.publishingRequest.findUnique({
      where: { id: parsed.id },
    });
    if (!req) {
      return new NextResponse("Publishing request not found", { status: 404 });
    }

    if (isPaid(transaction_status, fraud_status)) {
      if (req.status === "MENUNGGU_PEMBAYARAN") {
        await prisma.publishingRequest.update({
          where: { id: req.id },
          data: { status: "DIBAYAR" },
        });
      }
    } else if (isCancelled(transaction_status)) {
      await prisma.publishingRequest.update({
        where: { id: req.id },
        data: { status: "DITOLAK" },
      });
    }
    // Refund untuk penerbitan ISBN belum ada alurnya — ditangani manual admin.
  }

  return NextResponse.json({ received: true });
}
