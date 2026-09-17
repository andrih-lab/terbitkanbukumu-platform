import mammoth from "mammoth";
import { marked } from "marked";

export type ManuscriptSourceFormat = "DOCX" | "MARKDOWN";

// Tag yang diizinkan bertahan di HTML naskah — cukup untuk struktur
// bab/paragraf dasar yang dibutuhkan render.ts dan suggestions.ts. Semua
// tag lain (termasuk <img>, <script>, <style>) dan semua atribut dibuang.
const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "br",
]);

function sanitizeHtml(html: string): string {
  let cleaned = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  cleaned = cleaned.replace(
    /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g,
    (_match, closingSlash: string, tagName: string) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      return `<${closingSlash}${tag}>`;
    },
  );
  return cleaned;
}

export function detectManuscriptFormat(
  fileName: string,
): ManuscriptSourceFormat | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) return "DOCX";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "MARKDOWN";
  return null;
}

// Ekstrak berkas naskah (.docx/.md) menjadi HTML semantik yang sudah
// disaring (h1-h3/p/ul/ol/li/strong/em/br saja). Gambar dalam naskah
// sengaja didrop di v1 — lihat catatan di manuscript-upload-form.tsx.
export async function parseManuscriptFile(
  file: File,
  format: ManuscriptSourceFormat,
): Promise<string> {
  if (format === "DOCX") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return sanitizeHtml(html);
  }

  const text = await file.text();
  const html = await marked.parse(text);
  return sanitizeHtml(html);
}
