-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "commitment" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "skillArea" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
