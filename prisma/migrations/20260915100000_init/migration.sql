-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AUTHOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookCategory" AS ENUM ('MONOGRAF', 'REFERENSI', 'TEKNOLOGI_TEPAT_GUNA', 'HANDBOOK');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'NASKAH_DALAM_PROSES', 'NASKAH_SELESAI', 'DITERBITKAN', 'DIJUAL');

-- CreateEnum
CREATE TYPE "ManuscriptStatus" AS ENUM ('BELUM_DIMULAI', 'DIPROSES', 'SELESAI', 'GAGAL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'LUNAS', 'DIBATALKAN', 'REFUND');

-- CreateEnum
CREATE TYPE "PublishingRequestStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'DIBAYAR', 'DALAM_PROSES', 'ISBN_TERBIT', 'DITOLAK');

-- CreateEnum
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

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverDesign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CoverDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CoverDesign_name_key" ON "CoverDesign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ManuscriptDraft_bookProjectId_key" ON "ManuscriptDraft"("bookProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingRequest_bookProjectId_key" ON "PublishingRequest"("bookProjectId");

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_coverDesignId_fkey" FOREIGN KEY ("coverDesignId") REFERENCES "CoverDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManuscriptDraft" ADD CONSTRAINT "ManuscriptDraft_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingRequest" ADD CONSTRAINT "PublishingRequest_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

