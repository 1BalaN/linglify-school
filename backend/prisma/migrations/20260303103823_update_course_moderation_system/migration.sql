-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "lastReviewComment" TEXT,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "lastReviewedById" TEXT;
