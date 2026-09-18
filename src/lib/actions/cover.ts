"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { assertOwnedProject } from "@/lib/actions/book-projects";
import { deleteStoredFile, saveCustomCoverFile } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

export type UploadCustomCoverState = {
  error?: string;
};

export async function uploadCustomCoverAction(
  _prevState: UploadCustomCoverState,
  formData: FormData,
): Promise<UploadCustomCoverState> {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const file = formData.get("file") as File | null;

  const project = await assertOwnedProject(author.id, bookProjectId);

  if (!file || file.size === 0) {
    return { error: "Pilih berkas gambar terlebih dahulu." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Hanya berkas .jpg atau .png yang diterima." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran berkas maksimal 5MB." };
  }

  if (project.customCoverPath) {
    await deleteStoredFile(project.customCoverPath);
  }

  const { storedPath } = await saveCustomCoverFile(bookProjectId, file);

  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { customCoverPath: storedPath },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
  return {};
}

export async function removeCustomCoverAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;

  const project = await assertOwnedProject(author.id, bookProjectId);

  if (project.customCoverPath) {
    await deleteStoredFile(project.customCoverPath);
  }

  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { customCoverPath: null },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
}
