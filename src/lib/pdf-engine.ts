import puppeteer, { type Browser } from "puppeteer-core";
import pLimit from "p-limit";

// Satu instance browser dipakai ulang lintas request (hindari biaya launch
// ~1-2 detik/100MB+ tiap kali), dan render diserialisasi (p-limit(1)) supaya
// paling banyak satu render jalan bersamaan — VPS ini hanya 3.8GB RAM dan
// juga menjalankan Nextcloud + Postgres + MariaDB. Dipakai bersama oleh
// src/lib/manuscript/render.ts (PDF buku) dan src/lib/publishing-docs.ts
// (surat ISBN) — jangan bikin instance Chrome kedua di modul lain.
let browserPromise: Promise<Browser> | null = null;
export const renderLimit = pLimit(1);

export async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const existing = await browserPromise;
    if (existing.isConnected()) return existing;
  }
  browserPromise = puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  return browserPromise;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function renderHtmlToPdf(
  html: string,
  pageSize: { widthMm: number; heightMm: number },
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  },
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({
      width: `${pageSize.widthMm}mm`,
      height: `${pageSize.heightMm}mm`,
      printBackground: true,
      margin: margins,
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}
