import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

// Rute publik (tanpa sesi) — cover kustom perlu tampil di halaman jualan
// publik juga, bukan cuma dashboard penulis. Tidak ada data sensitif di
// sini, cuma gambar sampul.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookProjectId: string }> },
) {
  const { bookProjectId } = await params;

  const project = await prisma.bookProject.findUnique({
    where: { id: bookProjectId },
    select: { customCoverPath: true },
  });

  if (!project?.customCoverPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(project.customCoverPath);
  const contentType = project.customCoverPath.toLowerCase().endsWith(".png")
    ? "image/png"
    : "image/jpeg";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
