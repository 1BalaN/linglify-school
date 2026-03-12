-- CreateEnum
CREATE TYPE "PlacementQuestionType" AS ENUM ('GRAMMAR', 'VOCAB', 'READING', 'LISTENING');

-- CreateEnum
CREATE TYPE "PlacementSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "placement_questions" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "type" "PlacementQuestionType" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "mediaUrl" TEXT,
    "options" TEXT[],
    "correctOptionIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "language" TEXT NOT NULL,
    "status" "PlacementSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "estimatedLevel" "CourseLevel",
    "rawScore" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "currentDifficulty" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "givenOptionIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "placement_questions_language_idx" ON "placement_questions"("language");

-- CreateIndex
CREATE INDEX "placement_questions_type_idx" ON "placement_questions"("type");

-- CreateIndex
CREATE INDEX "placement_questions_difficulty_idx" ON "placement_questions"("difficulty");

-- CreateIndex
CREATE INDEX "placement_sessions_userId_idx" ON "placement_sessions"("userId");

-- CreateIndex
CREATE INDEX "placement_sessions_language_idx" ON "placement_sessions"("language");

-- CreateIndex
CREATE INDEX "placement_sessions_status_idx" ON "placement_sessions"("status");

-- CreateIndex
CREATE INDEX "placement_answers_sessionId_idx" ON "placement_answers"("sessionId");

-- CreateIndex
CREATE INDEX "placement_answers_questionId_idx" ON "placement_answers"("questionId");

-- AddForeignKey
ALTER TABLE "placement_sessions" ADD CONSTRAINT "placement_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "placement_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "placement_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
