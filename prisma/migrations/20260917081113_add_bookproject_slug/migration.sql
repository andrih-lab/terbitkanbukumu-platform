-- AlterTable
ALTER TABLE "BookProject" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BookProject_slug_key" ON "BookProject"("slug");
