"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { assertOwnedProject } from "@/lib/actions/book-projects";
import { buildMidtransOrderId, createSnapTransaction } from "@/lib/midtrans";
import { findPublishingPackage } from "@/lib/publishing-packages";

export async function requestPublishingAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const packageId = formData.get("packageId") as string;

  await assertOwnedProject(author.id, bookProjectId);

  const pkg = findPublishingPackage(packageId);
  if (!pkg) {
    revalidatePath(`/dashboard/buku/${bookProjectId}`);
    return;
  }

  const project = await prisma.bookProject.findUniqueOrThrow({
    where: { id: bookProjectId },
    include: { manuscriptDraft: true, publishingRequest: true },
  });

  const naskahSelesai = project.manuscriptDraft?.status === "SELESAI";
  const belumAdaPengajuanAktif =
    !project.publishingRequest || project.publishingRequest.status === "DITOLAK";

  if (!naskahSelesai || !belumAdaPengajuanAktif) {
    // Halaman akan menampilkan pesan penuntun yang sesuai, bukan error keras.
    revalidatePath(`/dashboard/buku/${bookProjectId}`);
    return;
  }

  const publishingRequest = await prisma.publishingRequest.upsert({
    where: { bookProjectId },
    create: {
      bookProjectId,
      packageName: pkg.name,
      priceIdr: pkg.priceIdr,
    },
    update: {
      packageName: pkg.name,
      priceIdr: pkg.priceIdr,
      status: "MENUNGGU_PEMBAYARAN",
      isbnNumber: null,
      issuedAt: null,
    },
  });

  const transaction = await createSnapTransaction({
    midtransOrderId: buildMidtransOrderId("isbn", publishingRequest.id),
    grossAmount: pkg.priceIdr,
    buyerName: author.name,
    buyerEmail: author.email,
    itemName: `Penerbitan ISBN — ${pkg.name} — ${project.title}`,
    finishPath: `/dashboard/buku/${bookProjectId}`,
  });

  redirect(transaction.redirect_url);
}
