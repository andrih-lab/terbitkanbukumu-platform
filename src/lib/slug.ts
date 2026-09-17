import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Slug + akhiran acak 6 karakter untuk keunikan URL publik buku
// (mis. "konservasi-mangrove-a1b2c3").
export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "buku";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base}-${suffix}`;
    const existing = await prisma.bookProject.findUnique({
      where: { slug: candidate },
    });
    if (!existing) return candidate;
  }

  // Sangat tidak mungkin tercapai (5x tabrakan berturut-turut), tapi tetap
  // sediakan fallback yang pasti unik.
  return `${base}-${crypto.randomUUID()}`;
}
