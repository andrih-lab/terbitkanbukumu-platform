"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { deleteStoredFile, saveReferenceFile } from "@/lib/storage";
import { generateUniqueSlug } from "@/lib/slug";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const createProjectSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  topic: z.string().min(10, "Uraikan topik minimal 10 karakter"),
  category: z.enum([
    "MONOGRAF",
    "REFERENSI",
    "TEKNOLOGI_TEPAT_GUNA",
    "HANDBOOK",
  ]),
  synopsis: z.string().optional(),
});

export type CreateProjectState = {
  error?: string;
};

export async function createBookProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const author = await requireAuthor();

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    topic: formData.get("topic"),
    category: formData.get("category"),
    synopsis: formData.get("synopsis") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const slug = await generateUniqueSlug(parsed.data.title);

  const project = await prisma.bookProject.create({
    data: { ...parsed.data, authorId: author.id, slug },
  });

  revalidatePath("/dashboard/buku");
  redirect(`/dashboard/buku/${project.id}`);
}

export async function assertOwnedProject(authorId: string, bookProjectId: string) {
  const project = await prisma.bookProject.findUnique({
    where: { id: bookProjectId },
  });
  if (!project || project.authorId !== authorId) {
    throw new Error("Proyek buku tidak ditemukan.");
  }
  return project;
}

export type UploadReferenceState = {
  error?: string;
};

export async function uploadReferenceAction(
  _prevState: UploadReferenceState,
  formData: FormData,
): Promise<UploadReferenceState> {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const citation = (formData.get("citation") as string) || undefined;
  const file = formData.get("file") as File | null;

  await assertOwnedProject(author.id, bookProjectId);

  if (!file || file.size === 0) {
    return { error: "Pilih berkas PDF terlebih dahulu." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Hanya berkas PDF yang diterima." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran berkas maksimal 20MB." };
  }

  const { storedPath, fileSizeBytes } = await saveReferenceFile(
    bookProjectId,
    file,
  );

  await prisma.reference.create({
    data: {
      bookProjectId,
      fileName: file.name,
      storedPath,
      fileSizeBytes,
      citation,
    },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
  return {};
}

export async function deleteReferenceAction(formData: FormData) {
  const author = await requireAuthor();
  const referenceId = formData.get("referenceId") as string;

  const reference = await prisma.reference.findUnique({
    where: { id: referenceId },
    include: { bookProject: true },
  });

  if (!reference || reference.bookProject.authorId !== author.id) {
    throw new Error("Referensi tidak ditemukan.");
  }

  await deleteStoredFile(reference.storedPath);
  await prisma.reference.delete({ where: { id: referenceId } });

  revalidatePath(`/dashboard/buku/${reference.bookProjectId}`);
}

export async function chooseTemplateAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const templateId = formData.get("templateId") as string;

  await assertOwnedProject(author.id, bookProjectId);

  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { templateId },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
}

export async function chooseCoverAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const coverDesignId = formData.get("coverDesignId") as string;

  await assertOwnedProject(author.id, bookProjectId);

  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { coverDesignId },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
}

const priceSchema = z.coerce.number().int().min(0).max(10_000_000);

export async function setPriceAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const parsedPrice = priceSchema.safeParse(formData.get("priceIdr"));

  await assertOwnedProject(author.id, bookProjectId);

  if (!parsedPrice.success) return;

  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { priceIdr: parsedPrice.data },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
}
