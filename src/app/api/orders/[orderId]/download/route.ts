import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

// Rute publik (tanpa sesi) — pembeli tidak punya akun. "Tiket" akses
// cukup id Order (cuid, praktis tidak bisa ditebak) + status LUNAS.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { bookProject: { include: { manuscriptDraft: true } } },
  });

  const pdfPath = order?.bookProject.manuscriptDraft?.pdfPath;

  if (!order || order.status !== "LUNAS" || !pdfPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(pdfPath);
  const fileName = `${order.bookProject.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
