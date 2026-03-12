-- CreateEnum
CREATE TYPE "ChatThreadType" AS ENUM ('COURSE_DM', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "type" "ChatThreadType" NOT NULL,
    "courseId" TEXT,
    "studentId" TEXT,
    "teacherId" TEXT,
    "userId" TEXT,
    "hasUnreadForStudent" BOOLEAN NOT NULL DEFAULT false,
    "hasUnreadForTeacher" BOOLEAN NOT NULL DEFAULT false,
    "hasUnreadForAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" "ChatMessageType" NOT NULL DEFAULT 'USER',
    "text" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_threads_type_idx" ON "chat_threads"("type");

-- CreateIndex
CREATE INDEX "chat_threads_courseId_idx" ON "chat_threads"("courseId");

-- CreateIndex
CREATE INDEX "chat_threads_studentId_idx" ON "chat_threads"("studentId");

-- CreateIndex
CREATE INDEX "chat_threads_teacherId_idx" ON "chat_threads"("teacherId");

-- CreateIndex
CREATE INDEX "chat_threads_userId_idx" ON "chat_threads"("userId");

-- CreateIndex
CREATE INDEX "chat_threads_lastMessageAt_idx" ON "chat_threads"("lastMessageAt");

-- CreateIndex
CREATE INDEX "chat_messages_threadId_idx" ON "chat_messages"("threadId");

-- CreateIndex
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
