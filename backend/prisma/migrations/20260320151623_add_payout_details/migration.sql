-- AlterTable
ALTER TABLE "payout_requests" ADD COLUMN     "payoutDetails" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'byn';
