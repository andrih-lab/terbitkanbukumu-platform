import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// Ukuran halaman dalam mm (dipakai langsung sebagai `width`/`height` di
// puppeteer `page.pdf()`, bukan lewat CSS `@page` — lihat render.ts).
const A5 = { pageWidthMm: 148, pageHeightMm: 210 };
const A4 = { pageWidthMm: 210, pageHeightMm: 297 };

const templates = [
  {
    name: "Akademik Klasik",
    description:
      "Tata letak dua kolom kutipan, nomor halaman di footer, gaya sitasi APA — cocok untuk buku referensi dan monograf.",
    configJson: {
      ...A5,
      marginTopMm: 22,
      marginBottomMm: 22,
      marginLeftMm: 20,
      marginRightMm: 18,
      fontFamily: "Georgia, 'Times New Roman', serif",
      bodyFontSizePt: 11,
      lineHeight: 1.5,
    },
  },
  {
    name: "Monograf Modern",
    description:
      "Satu kolom, margin lega, judul bab bergaya sans-serif besar — cocok untuk buku monograf hasil riset.",
    configJson: {
      ...A5,
      marginTopMm: 25,
      marginBottomMm: 25,
      marginLeftMm: 22,
      marginRightMm: 22,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      bodyFontSizePt: 11,
      lineHeight: 1.6,
    },
  },
  {
    name: "Handbook Praktis",
    description:
      "Banyak kotak highlight, tabel, dan poin ringkasan per bab — cocok untuk handbook dan buku panduan.",
    configJson: {
      ...A4,
      marginTopMm: 20,
      marginBottomMm: 20,
      marginLeftMm: 20,
      marginRightMm: 20,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      bodyFontSizePt: 10.5,
      lineHeight: 1.45,
    },
  },
  {
    name: "Teknologi Tepat Guna",
    description:
      "Menonjolkan diagram, langkah kerja bernomor, dan foto/ilustrasi — cocok untuk buku teknologi tepat guna.",
    configJson: {
      ...A4,
      marginTopMm: 20,
      marginBottomMm: 20,
      marginLeftMm: 22,
      marginRightMm: 20,
      fontFamily: "Georgia, 'Times New Roman', serif",
      bodyFontSizePt: 11,
      lineHeight: 1.5,
    },
  },
];

const covers = [
  {
    name: "Minimalis Akademik",
    description: "Warna solid, tipografi tebal, tanpa ilustrasi — kesan formal dan serius.",
    configJson: {
      backgroundColor: "#0f172a",
      titleColor: "#ffffff",
      titleFontSize: 34,
      authorColor: "#cbd5e1",
      accentColor: "#f59e0b",
    },
  },
  {
    name: "Ilustrasi Sains",
    description: "Elemen grafis abstrak bertema riset/sains di latar belakang.",
    configJson: {
      backgroundColor: "#0c4a6e",
      titleColor: "#ffffff",
      titleFontSize: 32,
      authorColor: "#bae6fd",
      accentColor: "#38bdf8",
    },
  },
  {
    name: "Foto Penuh",
    description: "Foto pilihan penulis sebagai latar penuh dengan judul di atasnya.",
    configJson: {
      backgroundColor: "#1c1917",
      titleColor: "#ffffff",
      titleFontSize: 36,
      authorColor: "#e7e5e4",
      accentColor: "#facc15",
    },
  },
  {
    name: "Geometris Kontemporer",
    description: "Bentuk geometris berwarna sebagai aksen, cocok untuk buku teknologi/inovasi.",
    configJson: {
      backgroundColor: "#312e81",
      titleColor: "#ffffff",
      titleFontSize: 32,
      authorColor: "#c7d2fe",
      accentColor: "#22d3ee",
    },
  },
];

async function main() {
  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }

  for (const cover of covers) {
    await prisma.coverDesign.upsert({
      where: { name: cover.name },
      update: cover,
      create: cover,
    });
  }

  console.log(`Seeded ${templates.length} template dan ${covers.length} desain cover.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
