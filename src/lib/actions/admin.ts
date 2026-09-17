"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function markPublishingInProgressAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("publishingRequestId") as string;

  await prisma.publishingRequest.update({
    where: { id },
    data: { status: "DALAM_PROSES" },
  });

  revalidatePath("/admin/penerbitan");
}

export async function issueIsbnAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("publishingRequestId") as string;
  const isbnNumber = (formData.get("isbnNumber") as string)?.trim();

  if (!isbnNumber) return;

  await prisma.publishingRequest.update({
    where: { id },
    data: { status: "ISBN_TERBIT", isbnNumber, issuedAt: new Date() },
  });

  revalidatePath("/admin/penerbitan");
}

export async function rejectPublishingAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("publishingRequestId") as string;

  await prisma.publishingRequest.update({
    where: { id },
    data: { status: "DITOLAK" },
  });

  revalidatePath("/admin/penerbitan");
}
