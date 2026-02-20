/*
  Warnings:

  - The values [REVIEW] on the enum `CourseStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isFree` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourseStatus_new" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'REJECTED', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "courses" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "courses" ALTER COLUMN "status" TYPE "CourseStatus_new" USING ("status"::text::"CourseStatus_new");
ALTER TYPE "CourseStatus" RENAME TO "CourseStatus_old";
ALTER TYPE "CourseStatus_new" RENAME TO "CourseStatus";
DROP TYPE "CourseStatus_old";
ALTER TABLE "courses" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "lessons_isFree_idx";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "isFree";
