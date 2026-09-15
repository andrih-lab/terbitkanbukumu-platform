import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

// Penyimpanan berkas referensi PDF, dengan dua mode:
// - Vercel Blob (dipakai otomatis saat BLOB_READ_WRITE_TOKEN tersedia, mis.
//   setelah menghubungkan Blob store di dashboard Vercel) — wajib di
//   produksi karena filesystem Vercel Functions tidak persisten.
// - Disk lokal (folder `storage/` di root proyek) — dipakai saat
//   BLOB_READ_WRITE_TOKEN tidak diset, untuk pengembangan lokal.
// `storedPath` yang disimpan di database membedakan keduanya: URL Blob
// (diawali "http") atau path relatif lokal.
const STORAGE_ROOT = path.join(process.cwd(), "storage");
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function safeFileName(originalName: string) {
  const ext = path.extname(originalName).slice(0, 10);
  return `${crypto.randomUUID()}${ext}`;
}

export async function saveReferenceFile(bookProjectId: string, file: File) {
  const storedName = safeFileName(file.name);

  if (useBlob) {
    const blob = await put(`references/${bookProjectId}/${storedName}`, file, {
      access: "public",
    });
    return { storedPath: blob.url, fileSizeBytes: file.size };
  }

  const dir = path.join(STORAGE_ROOT, "references", bookProjectId);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return {
    storedPath: path.join("references", bookProjectId, storedName),
    fileSizeBytes: buffer.byteLength,
  };
}

export async function readStoredFile(storedPath: string) {
  if (storedPath.startsWith("http")) {
    const response = await fetch(storedPath);
    if (!response.ok) {
      throw new Error(`Gagal mengambil berkas dari Blob: ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  return readFile(path.join(STORAGE_ROOT, storedPath));
}

export async function deleteStoredFile(storedPath: string) {
  if (storedPath.startsWith("http")) {
    await del(storedPath).catch(() => undefined);
    return;
  }

  await unlink(path.join(STORAGE_ROOT, storedPath)).catch(() => undefined);
}
