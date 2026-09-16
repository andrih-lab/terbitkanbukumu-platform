-- Jalankan skrip ini SEKALI di Supabase SQL Editor untuk membuat
-- struktur tabel + isi awal katalog Template/CoverDesign, sebagai
-- pengganti sementara `prisma migrate deploy` yang macet di build Vercel.
-- Lihat README.md bagian "Setup Database Manual" untuk konteksnya.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AUTHOR', 'ADMIN');
CREATE TYPE "BookCategory" AS ENUM ('MONOGRAF', 'REFERENSI', 'TEKNOLOGI_TEPAT_GUNA', 'HANDBOOK');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'NASKAH_DALAM_PROSES', 'NASKAH_SELESAI', 'DITERBITKAN', 'DIJUAL');
CREATE TYPE "ManuscriptStatus" AS ENUM ('BELUM_DIMULAI', 'DIPROSES', 'SELESAI', 'GAGAL');
CREATE TYPE "OrderStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'LUNAS', 'DIBATALKAN', 'REFUND');
CREATE TYPE "PublishingRequestStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'DIBAYAR', 'DALAM_PROSES', 'ISBN_TERBIT', 'DITOLAK');
CREATE TYPE "WithdrawalStatus" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "institution" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'AUTHOR',
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "npwp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CoverDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CoverDesign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookProject" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" "BookCategory" NOT NULL,
    "synopsis" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "coverDesignId" TEXT,
    "priceIdr" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "citation" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManuscriptDraft" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "status" "ManuscriptStatus" NOT NULL DEFAULT 'BELUM_DIMULAI',
    "content" TEXT,
    "pdfPath" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "ManuscriptDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "priceIdr" INTEGER NOT NULL,
    "commissionIdr" INTEGER NOT NULL,
    "taxIdr" INTEGER NOT NULL,
    "authorEarningIdr" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PublishingRequest" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "priceIdr" INTEGER NOT NULL,
    "isbnNumber" TEXT,
    "status" "PublishingRequestStatus" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedAt" TIMESTAMP(3),
    CONSTRAINT "PublishingRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "grossIdr" INTEGER NOT NULL,
    "commissionIdr" INTEGER NOT NULL,
    "taxIdr" INTEGER NOT NULL,
    "netIdr" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'MENUNGGU',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");
CREATE UNIQUE INDEX "CoverDesign_name_key" ON "CoverDesign"("name");
CREATE UNIQUE INDEX "ManuscriptDraft_bookProjectId_key" ON "ManuscriptDraft"("bookProjectId");
CREATE UNIQUE INDEX "PublishingRequest_bookProjectId_key" ON "PublishingRequest"("bookProjectId");

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_coverDesignId_fkey" FOREIGN KEY ("coverDesignId") REFERENCES "CoverDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ManuscriptDraft" ADD CONSTRAINT "ManuscriptDraft_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PublishingRequest" ADD CONSTRAINT "PublishingRequest_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tabel penanda migrasi Prisma, supaya `prisma migrate deploy` di masa
-- depan (kalau konektivitas sudah pulih) tidak mencoba membuat ulang
-- tabel-tabel di atas.
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
VALUES (gen_random_uuid()::text, 'manual-setup', now(), '20260915100000_init', 1);

-- Seed katalog Template & CoverDesign (isi awal, sama seperti prisma/seed.ts)
INSERT INTO "Template" ("id", "name", "description") VALUES
  (gen_random_uuid()::text, 'Akademik Klasik', 'Tata letak dua kolom kutipan, nomor halaman di footer, gaya sitasi APA — cocok untuk buku referensi dan monograf.'),
  (gen_random_uuid()::text, 'Monograf Modern', 'Satu kolom, margin lega, judul bab bergaya sans-serif besar — cocok untuk buku monograf hasil riset.'),
  (gen_random_uuid()::text, 'Handbook Praktis', 'Banyak kotak highlight, tabel, dan poin ringkasan per bab — cocok untuk handbook dan buku panduan.'),
  (gen_random_uuid()::text, 'Teknologi Tepat Guna', 'Menonjolkan diagram, langkah kerja bernomor, dan foto/ilustrasi — cocok untuk buku teknologi tepat guna.');

INSERT INTO "CoverDesign" ("id", "name", "description") VALUES
  (gen_random_uuid()::text, 'Minimalis Akademik', 'Warna solid, tipografi tebal, tanpa ilustrasi — kesan formal dan serius.'),
  (gen_random_uuid()::text, 'Ilustrasi Sains', 'Elemen grafis abstrak bertema riset/sains di latar belakang.'),
  (gen_random_uuid()::text, 'Foto Penuh', 'Foto pilihan penulis sebagai latar penuh dengan judul di atasnya.'),
  (gen_random_uuid()::text, 'Geometris Kontemporer', 'Bentuk geometris berwarna sebagai aksen, cocok untuk buku teknologi/inovasi.');
