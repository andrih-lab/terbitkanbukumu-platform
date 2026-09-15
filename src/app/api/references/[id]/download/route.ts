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
  const reference = await prisma.reference.findUnique({
    where: { id },
    include: { bookProject: true },
  });

  if (!reference || reference.bookProject.authorId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(reference.storedPath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${reference.fileName}"`,
    },
  });
}
