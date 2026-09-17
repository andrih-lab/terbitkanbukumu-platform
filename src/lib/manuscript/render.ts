import puppeteer, { type Browser } from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import pLimit from "p-limit";

// Parameter render diambil dari Template.configJson / CoverDesign.configJson
// (lihat prisma/seed.ts untuk contoh nilainya).
export type TemplateConfig = {
  pageWidthMm: number;
  pageHeightMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  fontFamily: string;
  bodyFontSizePt: number;
  lineHeight: number;
};

export type CoverConfig = {
  backgroundColor: string;
  titleColor: string;
  titleFontSize: number;
  authorColor: string;
  accentColor: string;
};

// Satu instance browser dipakai ulang lintas request (hindari biaya launch
// ~1-2 detik/100MB+ tiap kali), dan render diserialisasi (p-limit(1)) supaya
// paling banyak satu render jalan bersamaan — VPS ini hanya 3.8GB RAM dan
// juga menjalankan Nextcloud + Postgres + MariaDB.
let browserPromise: Promise<Browser> | null = null;
const renderLimit = pLimit(1);

async function getBrowser(): Promise<Browser> {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildBodyHtml(contentHtml: string, config: TemplateConfig): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: ${config.fontFamily};
    font-size: ${config.bodyFontSizePt}pt;
    line-height: ${config.lineHeight};
    color: #1a1a1a;
    margin: 0;
  }
  h1, h2, h3 { break-before: page; font-weight: 700; margin-top: 0; }
  h1:first-child, h2:first-child, h3:first-child { break-before: avoid; }
  p { margin: 0 0 0.8em 0; text-align: justify; }
  ul, ol { margin: 0 0 0.8em 1.4em; }
</style>
</head>
<body>${contentHtml}</body>
</html>`;
}

function buildCoverHtml(
  config: CoverConfig,
  title: string,
  authorName: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    background: ${config.backgroundColor};
  }
  .cover {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 10mm;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }
  .accent {
    width: 60px;
    height: 6px;
    background: ${config.accentColor};
    margin-bottom: 24px;
  }
  .title {
    color: ${config.titleColor};
    font-size: ${config.titleFontSize}pt;
    font-weight: 700;
    line-height: 1.25;
  }
  .author {
    margin-top: 20px;
    color: ${config.authorColor};
    font-size: 14pt;
  }
</style>
</head>
<body>
  <div class="cover">
    <div class="accent"></div>
    <div class="title">${escapeHtml(title)}</div>
    <div class="author">${escapeHtml(authorName)}</div>
  </div>
</body>
</html>`;
}

async function renderHtmlToPdf(
  html: string,
  pageSize: Pick<TemplateConfig, "pageWidthMm" | "pageHeightMm">,
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
      width: `${pageSize.pageWidthMm}mm`,
      height: `${pageSize.pageHeightMm}mm`,
      printBackground: true,
      margin: margins,
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}

// Render naskah (content HTML) + cover jadi satu PDF buku, sesuai Template
// dan CoverDesign pilihan penulis. Cover selalu memakai ukuran halaman dari
// `templateConfig` (bukan konfigurasinya sendiri) supaya PDF gabungan
// konsisten. Dijalankan sinkron di Server Action — VPS ini tidak punya
// batas waktu function seperti serverless.
export async function renderBookPdf(params: {
  contentHtml: string;
  templateConfig: TemplateConfig;
  coverConfig: CoverConfig;
  title: string;
  authorName: string;
}): Promise<Buffer> {
  return renderLimit(async () => {
    const { templateConfig } = params;

    const coverPdfBytes = await renderHtmlToPdf(
      buildCoverHtml(params.coverConfig, params.title, params.authorName),
      templateConfig,
      { top: "0", bottom: "0", left: "0", right: "0" },
    );

    const bodyPdfBytes = await renderHtmlToPdf(
      buildBodyHtml(params.contentHtml, templateConfig),
      templateConfig,
      {
        top: `${templateConfig.marginTopMm}mm`,
        bottom: `${templateConfig.marginBottomMm}mm`,
        left: `${templateConfig.marginLeftMm}mm`,
        right: `${templateConfig.marginRightMm}mm`,
      },
    );

    const outputDoc = await PDFDocument.create();

    const coverDoc = await PDFDocument.load(coverPdfBytes);
    const coverPages = await outputDoc.copyPages(
      coverDoc,
      coverDoc.getPageIndices(),
    );
    coverPages.forEach((p) => outputDoc.addPage(p));

    const bodyDoc = await PDFDocument.load(bodyPdfBytes);
    const bodyPages = await outputDoc.copyPages(
      bodyDoc,
      bodyDoc.getPageIndices(),
    );
    bodyPages.forEach((p) => outputDoc.addPage(p));

    const finalBytes = await outputDoc.save();
    return Buffer.from(finalBytes);
  });
}
