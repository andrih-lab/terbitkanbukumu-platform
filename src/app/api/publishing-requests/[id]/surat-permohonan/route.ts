import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSuratPermohonanIsbnPdf } from "@/lib/publishing-docs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = await prisma.author.findUnique({
    where: { id: session.user.id },
  });
  if (!admin || admin.role !== "ADMIN") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { id } = await params;

  const buffer = await generateSuratPermohonanIsbnPdf(id, admin.name);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="surat-permohonan-isbn-${id}.pdf"`,
    },
  });
}
