-- CreateEnum
CREATE TYPE "ManuscriptSourceFormat" AS ENUM ('DOCX', 'MARKDOWN');

-- AlterTable
ALTER TABLE "CoverDesign" ADD COLUMN     "configJson" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "ManuscriptDraft" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "sourceFileName" TEXT,
ADD COLUMN     "sourceFormat" "ManuscriptSourceFormat",
ADD COLUMN     "sourceStoredPath" TEXT;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "configJson" JSONB NOT NULL DEFAULT '{}';
