import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const bookProject = await prisma.bookProject.findUnique({
    where: { id },
    include: { manuscriptDraft: true },
  });

  if (
    !bookProject ||
    bookProject.authorId !== session.user.id ||
    !bookProject.manuscriptDraft?.pdfPath
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(bookProject.manuscriptDraft.pdfPath);
  const fileName = `${bookProject.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
