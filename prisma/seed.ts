import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    name: "Akademik Klasik",
    description:
      "Tata letak dua kolom kutipan, nomor halaman di footer, gaya sitasi APA — cocok untuk buku referensi dan monograf.",
  },
  {
    name: "Monograf Modern",
    description:
      "Satu kolom, margin lega, judul bab bergaya sans-serif besar — cocok untuk buku monograf hasil riset.",
  },
  {
    name: "Handbook Praktis",
    description:
      "Banyak kotak highlight, tabel, dan poin ringkasan per bab — cocok untuk handbook dan buku panduan.",
  },
  {
    name: "Teknologi Tepat Guna",
    description:
      "Menonjolkan diagram, langkah kerja bernomor, dan foto/ilustrasi — cocok untuk buku teknologi tepat guna.",
  },
];

const covers = [
  {
    name: "Minimalis Akademik",
    description: "Warna solid, tipografi tebal, tanpa ilustrasi — kesan formal dan serius.",
  },
  {
    name: "Ilustrasi Sains",
    description: "Elemen grafis abstrak bertema riset/sains di latar belakang.",
  },
  {
    name: "Foto Penuh",
    description: "Foto pilihan penulis sebagai latar penuh dengan judul di atasnya.",
  },
  {
    name: "Geometris Kontemporer",
    description: "Bentuk geometris berwarna sebagai aksen, cocok untuk buku teknologi/inovasi.",
  },
];

async function main() {
  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    });
  }

  for (const cover of covers) {
    await prisma.coverDesign.upsert({
      where: { name: cover.name },
      update: {},
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
