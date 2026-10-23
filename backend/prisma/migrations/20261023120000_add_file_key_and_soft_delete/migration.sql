-- AlterEnum
ALTER TYPE "NoteStatus" ADD VALUE 'REMOVED';

-- AlterTable
ALTER TABLE "Note" ADD COLUMN "fileKey" TEXT,
ADD COLUMN "mimeType" TEXT NOT NULL DEFAULT 'application/pdf';
