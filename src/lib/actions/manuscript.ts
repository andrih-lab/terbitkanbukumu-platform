"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/session";
import { assertOwnedProject } from "@/lib/actions/book-projects";
import {
  deleteStoredFile,
  saveManuscriptPdf,
  saveManuscriptSourceFile,
} from "@/lib/storage";
import { detectManuscriptFormat, parseManuscriptFile } from "@/lib/manuscript/parse";
import {
  renderBookPdf,
  type CoverConfig,
  type TemplateConfig,
} from "@/lib/manuscript/render";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export type UploadManuscriptState = {
  error?: string;
};

export async function uploadManuscriptAction(
  _prevState: UploadManuscriptState,
  formData: FormData,
): Promise<UploadManuscriptState> {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;
  const file = formData.get("file") as File | null;

  await assertOwnedProject(author.id, bookProjectId);

  if (!file || file.size === 0) {
    return { error: "Pilih berkas naskah terlebih dahulu." };
  }

  const format = detectManuscriptFormat(file.name);
  if (!format) {
    return { error: "Hanya berkas .docx atau .md/.markdown yang diterima." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran berkas maksimal 20MB." };
  }

  const existing = await prisma.manuscriptDraft.findUnique({
    where: { bookProjectId },
  });
  if (existing?.sourceStoredPath) {
    await deleteStoredFile(existing.sourceStoredPath);
  }
  if (existing?.pdfPath) {
    await deleteStoredFile(existing.pdfPath);
  }

  const { storedPath } = await saveManuscriptSourceFile(bookProjectId, file);
  const content = await parseManuscriptFile(file, format);

  await prisma.manuscriptDraft.upsert({
    where: { bookProjectId },
    create: {
      bookProjectId,
      content,
      sourceFileName: file.name,
      sourceStoredPath: storedPath,
      sourceFormat: format,
      status: "BELUM_DIMULAI",
    },
    update: {
      content,
      sourceFileName: file.name,
      sourceStoredPath: storedPath,
      sourceFormat: format,
      status: "BELUM_DIMULAI",
      pdfPath: null,
      errorMessage: null,
      completedAt: null,
    },
  });

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
  return {};
}

export async function generateBookPdfAction(formData: FormData) {
  const author = await requireAuthor();
  const bookProjectId = formData.get("bookProjectId") as string;

  await assertOwnedProject(author.id, bookProjectId);

  if (!author.emailVerifiedAt) {
    // Dijaga juga di UI (tombol tidak ditampilkan) — ini pengaman kedua.
    revalidatePath(`/dashboard/buku/${bookProjectId}`);
    return;
  }

  const project = await prisma.bookProject.findUniqueOrThrow({
    where: { id: bookProjectId },
    include: {
      manuscriptDraft: true,
      template: true,
      coverDesign: true,
      author: true,
    },
  });

  if (
    !project.manuscriptDraft?.content ||
    !project.template ||
    !project.coverDesign
  ) {
    // Belum lengkap (naskah/template/cover) — halaman akan menampilkan
    // pesan penuntun, bukan error keras.
    revalidatePath(`/dashboard/buku/${bookProjectId}`);
    return;
  }

  await prisma.manuscriptDraft.update({
    where: { bookProjectId },
    data: { status: "DIPROSES", errorMessage: null },
  });

  try {
    const pdfBuffer = await renderBookPdf({
      contentHtml: project.manuscriptDraft.content,
      templateConfig: project.template.configJson as unknown as TemplateConfig,
      coverConfig: project.coverDesign.configJson as unknown as CoverConfig,
      title: project.title,
      authorName: project.author.name,
    });

    if (project.manuscriptDraft.pdfPath) {
      await deleteStoredFile(project.manuscriptDraft.pdfPath);
    }
    const { storedPath } = await saveManuscriptPdf(bookProjectId, pdfBuffer);

    await prisma.manuscriptDraft.update({
      where: { bookProjectId },
      data: {
        status: "SELESAI",
        pdfPath: storedPath,
        completedAt: new Date(),
        errorMessage: null,
      },
    });
  } catch (error) {
    await prisma.manuscriptDraft.update({
      where: { bookProjectId },
      data: {
        status: "GAGAL",
        errorMessage:
          error instanceof Error ? error.message : "Gagal membuat PDF buku.",
      },
    });
  }

  revalidatePath(`/dashboard/buku/${bookProjectId}`);
}
