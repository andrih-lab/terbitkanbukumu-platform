-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "institution" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AUTHOR',
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "npwp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CoverDesign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "BookProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "synopsis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "coverDesignId" TEXT,
    "priceIdr" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookProject_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookProject_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BookProject_coverDesignId_fkey" FOREIGN KEY ("coverDesignId") REFERENCES "CoverDesign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookProjectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "citation" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reference_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManuscriptDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookProjectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_DIMULAI',
    "content" TEXT,
    "pdfPath" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ManuscriptDraft_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookProjectId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "priceIdr" INTEGER NOT NULL,
    "commissionIdr" INTEGER NOT NULL,
    "taxIdr" INTEGER NOT NULL,
    "authorEarningIdr" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "Order_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishingRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookProjectId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "priceIdr" INTEGER NOT NULL,
    "isbnNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedAt" DATETIME,
    CONSTRAINT "PublishingRequest_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "grossIdr" INTEGER NOT NULL,
    "commissionIdr" INTEGER NOT NULL,
    "taxIdr" INTEGER NOT NULL,
    "netIdr" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "WithdrawalRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
