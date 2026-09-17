import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { escapeHtml, renderHtmlToPdf, renderLimit } from "@/lib/pdf-engine";
import { COMPANY_INFO } from "@/lib/company-info";
import { findPublishingPackage } from "@/lib/publishing-packages";

const ROMAN_MONTHS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
];

async function imageToDataUri(publicRelativePath: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", publicRelativePath);
  const buffer = await fs.readFile(filePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Nomor surat deterministik dari urutan pengajuan (tanpa perlu kolom
// counter baru): {urutan}/MRI-ISBN/{bulan romawi}/{tahun}, dihitung dari
// requestedAt request ini.
async function buildSuratNumber(requestedAt: Date): Promise<string> {
  const sequence = await prisma.publishingRequest.count({
    where: { requestedAt: { lte: requestedAt } },
  });
  const urutan = String(sequence).padStart(3, "0");
  const romanMonth = ROMAN_MONTHS[requestedAt.getMonth()];
  return `${urutan}/MRI-ISBN/${romanMonth}/${requestedAt.getFullYear()}`;
}

function buildSuratPermohonanIsbnHtml(params: {
  suratNumber: string;
  today: string;
  isEbook: boolean;
  adminName: string;
  bookTitle: string;
  authorName: string;
  bookUrl: string;
  signatureDataUri: string;
  stampDataUri: string;
}): string {
  // Pakai [X]/[ ] alih-alih glyph unicode (☑/☐) — font fallback di
  // Linux/headless Chromium sering tidak punya glyph itu, jadi tidak
  // tampak sama sekali di PDF.
  const checkbox = (checked: boolean) => (checked ? "[X]" : "[ ]");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
    margin: 0;
  }
  .letterhead {
    text-align: center;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 8px;
    margin-bottom: 24px;
  }
  .letterhead .name { font-size: 16pt; font-weight: 700; letter-spacing: 1px; }
  .letterhead .contact { font-size: 10pt; margin-top: 2px; }
  .meta-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
  .meta-left table td { vertical-align: top; padding-right: 6px; }
  table.fields td { vertical-align: top; padding: 2px 6px 2px 0; }
  table.fields td.label { white-space: nowrap; }
  p { margin: 0 0 12px 0; text-align: justify; }
  .signature-block { margin-top: 40px; }
  .signature-images { position: relative; height: 100px; margin: 8px 0; }
  .signature-images img.signature { position: absolute; left: 0; top: 0; height: 90px; }
  .signature-images img.stamp { position: absolute; left: 70px; top: 10px; height: 100px; opacity: 0.9; }
  .director-name { font-weight: 700; text-decoration: underline; margin-top: 4px; }
</style>
</head>
<body>
  <div class="letterhead">
    <div class="name">${escapeHtml(COMPANY_INFO.penerbitName.toUpperCase())}</div>
    <div class="contact">${escapeHtml(COMPANY_INFO.website)} · ${escapeHtml(COMPANY_INFO.phone)} · ${escapeHtml(COMPANY_INFO.email)}</div>
  </div>

  <div class="meta-row">
    <table class="fields">
      <tr><td class="label">No.</td><td>: ${escapeHtml(params.suratNumber)}</td></tr>
      <tr><td class="label">Lamp.</td><td>: Naskah buku (dummy), berkas pendukung</td></tr>
      <tr>
        <td class="label" style="vertical-align:top">Perihal</td>
        <td>: Permohonan<br/>
          &nbsp;&nbsp;${checkbox(!params.isEbook)} a. ISBN/Barcode untuk buku<br/>
          &nbsp;&nbsp;${checkbox(params.isEbook)} b. ISBN/Barcode untuk ebook
        </td>
      </tr>
    </table>
    <div>${escapeHtml(COMPANY_INFO.city)}, ${escapeHtml(params.today)}</div>
  </div>

  <p>Kepada Yth.<br/>
  Kepala Pusat Bibliografi dan Pengolahan Bahan Perpustakaan<br/>
  Perpustakaan Nasional RI</p>

  <p>Kami atas nama,</p>
  <table class="fields">
    <tr><td class="label">Penerbit</td><td>: ${escapeHtml(COMPANY_INFO.penerbitName)}</td></tr>
    <tr><td class="label">Penanggung jawab</td><td>: ${escapeHtml(COMPANY_INFO.directorName)}</td></tr>
    <tr><td class="label">Admin</td><td>: ${escapeHtml(params.adminName)}</td></tr>
  </table>

  <p style="margin-top:12px">Mengajukan permohonan ISBN untuk,</p>
  <table class="fields">
    <tr><td class="label">Judul</td><td>: ${escapeHtml(params.bookTitle)}</td></tr>
    <tr><td class="label">Kepengarangan</td><td>: ${escapeHtml(params.authorName)}</td></tr>
    <tr><td class="label">Link/akses ketersediaan buku</td><td>: ${escapeHtml(params.bookUrl)}</td></tr>
  </table>

  <p style="margin-top:12px">Bersama ini kami lampirkan dummy buku dan berkas pendukung terkait.</p>

  <p>Penerbit akan bertanggung jawab terhadap isi buku dan bersedia menanggung segala bentuk risiko yang terjadi jika ada permasalahan setelah buku tersebut diterbitkan.</p>

  <p>Demikian permohonan ini kami ajukan, atas perhatian dan kerja samanya diucapkan terima kasih.</p>

  <div class="signature-block">
    <p style="margin-bottom:0">Hormat kami,</p>
    <div class="signature-images">
      <img class="signature" src="${params.signatureDataUri}" />
      <img class="stamp" src="${params.stampDataUri}" />
    </div>
    <div class="director-name">${escapeHtml(COMPANY_INFO.directorName)}</div>
    <div>Pimpinan</div>
  </div>
</body>
</html>`;
}

const A4 = { widthMm: 210, heightMm: 297 };
const A4_MARGINS = { top: "25mm", bottom: "20mm", left: "25mm", right: "20mm" };

export async function generateSuratPermohonanIsbnPdf(
  publishingRequestId: string,
  adminName: string,
): Promise<Buffer> {
  const req = await prisma.publishingRequest.findUniqueOrThrow({
    where: { id: publishingRequestId },
    include: { bookProject: { include: { author: true } } },
  });

  const digitalPackage = findPublishingPackage("digital");
  const isEbook = req.packageName === digitalPackage?.name;

  const [signatureDataUri, stampDataUri, suratNumber] = await Promise.all([
    imageToDataUri("company/signature.jpg", "image/jpeg"),
    imageToDataUri("company/stamp.png", "image/png"),
    buildSuratNumber(req.requestedAt),
  ]);

  const html = buildSuratPermohonanIsbnHtml({
    suratNumber,
    today: formatIndonesianDate(new Date()),
    isEbook,
    adminName,
    bookTitle: req.bookProject.title,
    authorName: req.bookProject.author.name,
    bookUrl: `${process.env.APP_URL}/buku/${req.bookProject.slug}`,
    signatureDataUri,
    stampDataUri,
  });

  return renderLimit(() => renderHtmlToPdf(html, A4, A4_MARGINS));
}
