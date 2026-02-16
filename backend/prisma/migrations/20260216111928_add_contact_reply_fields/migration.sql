-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "isReplied" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "contact_messages_isReplied_idx" ON "contact_messages"("isReplied");
