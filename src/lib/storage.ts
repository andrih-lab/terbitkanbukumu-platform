import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Penyimpanan berkas referensi PDF. Untuk MVP, berkas disimpan di disk lokal
// server (folder `storage/` di root proyek, di luar `public/` agar tidak bisa
// diakses langsung tanpa otorisasi). Lihat ROADMAP.md — di produksi, adapter
// ini diganti dengan storage object (mis. Supabase Storage / S3) tanpa
// mengubah pemanggil di lib/actions.
const STORAGE_ROOT = path.join(process.cwd(), "storage");

function safeFileName(originalName: string) {
  const ext = path.extname(originalName).slice(0, 10);
  return `${crypto.randomUUID()}${ext}`;
}

export async function saveReferenceFile(bookProjectId: string, file: File) {
  const dir = path.join(STORAGE_ROOT, "references", bookProjectId);
  await mkdir(dir, { recursive: true });

  const storedName = safeFileName(file.name);
  const fullPath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return {
    storedPath: path.join("references", bookProjectId, storedName),
    fileSizeBytes: buffer.byteLength,
  };
}

export async function readStoredFile(storedPath: string) {
  const fullPath = path.join(STORAGE_ROOT, storedPath);
  return readFile(fullPath);
}

export async function deleteStoredFile(storedPath: string) {
  const fullPath = path.join(STORAGE_ROOT, storedPath);
  await unlink(fullPath).catch(() => undefined);
}
