-- =============================================================================
-- Linglify — PostgreSQL DDL, соответствует prisma/schema.prisma (текущая версия).
-- Назначение: развёртывание с нуля на пустой БД. Не применять поверх данных,
-- если уже используете prisma migrate — там своя история миграций.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE "CourseLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'GITHUB');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'REJECTED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'INTERACTIVE', 'LEXICAL', 'DIALOGUE', 'TEST');
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'MATCHING');
CREATE TYPE "PlacementQuestionType" AS ENUM ('GRAMMAR', 'VOCAB', 'READING', 'LISTENING');
CREATE TYPE "PlacementSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');
CREATE TYPE "ChatThreadType" AS ENUM ('COURSE_DM', 'SUPPORT');
CREATE TYPE "ChatMessageType" AS ENUM ('USER', 'SYSTEM');
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- -----------------------------------------------------------------------------
-- Tables (без внешних ключей)
-- -----------------------------------------------------------------------------
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "preferredLanguage" TEXT,
    "targetLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "oauthProvider" "OAuthProvider",
    "oauthId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "level" "CourseLevel" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'Английский',
    "category" TEXT,
    "teacherId" TEXT NOT NULL,
    "coverImage" TEXT,
    "previewVideo" TEXT,
    "duration" INTEGER,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BYN',
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requireFinalTestForCertificate" BOOLEAN NOT NULL DEFAULT true,
    "minProgressForCertificate" INTEGER NOT NULL DEFAULT 100,
    "lastReviewComment" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "type" "LessonType" NOT NULL DEFAULT 'VIDEO',
    "isFinalTest" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "attachments" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "options" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "finalScore" DOUBLE PRECISION,
    "completionTime" INTEGER,
    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "platform_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lowRatingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "minEnrollmentsForRating" INTEGER NOT NULL DEFAULT 5,
    "placementDefaultQuestions" INTEGER NOT NULL DEFAULT 25,
    "placementAllowedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "placementRecommendationMap" JSONB,
    "trialSubscriptionDays" INTEGER NOT NULL DEFAULT 30,
    "maxCoursesPerStudent" INTEGER NOT NULL DEFAULT 0,
    "autoArchiveDaysAfterInactivity" INTEGER NOT NULL DEFAULT 0,
    "reviewModerationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "certificateValidityMonths" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" "ChatMessageType" NOT NULL DEFAULT 'USER',
    "text" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teacher_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "plan" "SubscriptionPlan",
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teacher_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_revenues" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "teacherEarning" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_revenues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'byn',
    "payoutDetails" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- Unique indexes (в т.ч. @@unique)
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_oauthProvider_oauthId_key" ON "users"("oauthProvider", "oauthId");

CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

CREATE UNIQUE INDEX "enrollments_userId_courseId_key" ON "enrollments"("userId", "courseId");
CREATE UNIQUE INDEX "progress_userId_lessonId_key" ON "progress"("userId", "lessonId");
CREATE UNIQUE INDEX "reviews_userId_courseId_key" ON "reviews"("userId", "courseId");
CREATE UNIQUE INDEX "certificates_certificateCode_key" ON "certificates"("certificateCode");
CREATE UNIQUE INDEX "certificates_userId_courseId_key" ON "certificates"("userId", "courseId");

CREATE UNIQUE INDEX "teacher_subscriptions_userId_key" ON "teacher_subscriptions"("userId");
CREATE UNIQUE INDEX "teacher_subscriptions_stripeSubscriptionId_key" ON "teacher_subscriptions"("stripeSubscriptionId");

-- -----------------------------------------------------------------------------
-- Indexes (@@index)
-- -----------------------------------------------------------------------------
CREATE INDEX "verification_tokens_userId_idx" ON "verification_tokens"("userId");
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");

CREATE INDEX "password_resets_userId_idx" ON "password_resets"("userId");
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

CREATE INDEX "faq_items_category_idx" ON "faq_items"("category");
CREATE INDEX "faq_items_isActive_idx" ON "faq_items"("isActive");
CREATE INDEX "faq_items_order_idx" ON "faq_items"("order");

CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages"("isRead");
CREATE INDEX "contact_messages_isReplied_idx" ON "contact_messages"("isReplied");
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

CREATE INDEX "courses_teacherId_idx" ON "courses"("teacherId");
CREATE INDEX "courses_level_idx" ON "courses"("level");
CREATE INDEX "courses_status_idx" ON "courses"("status");
CREATE INDEX "courses_isPublished_idx" ON "courses"("isPublished");
CREATE INDEX "courses_category_idx" ON "courses"("category");

CREATE INDEX "lessons_courseId_idx" ON "lessons"("courseId");
CREATE INDEX "lessons_order_idx" ON "lessons"("order");

CREATE INDEX "questions_lessonId_idx" ON "questions"("lessonId");
CREATE INDEX "questions_order_idx" ON "questions"("order");

CREATE INDEX "enrollments_userId_idx" ON "enrollments"("userId");
CREATE INDEX "enrollments_courseId_idx" ON "enrollments"("courseId");
CREATE INDEX "enrollments_completedAt_idx" ON "enrollments"("completedAt");

CREATE INDEX "progress_userId_idx" ON "progress"("userId");
CREATE INDEX "progress_courseId_idx" ON "progress"("courseId");
CREATE INDEX "progress_lessonId_idx" ON "progress"("lessonId");
CREATE INDEX "progress_isCompleted_idx" ON "progress"("isCompleted");

CREATE INDEX "answers_userId_idx" ON "answers"("userId");
CREATE INDEX "answers_questionId_idx" ON "answers"("questionId");

CREATE INDEX "reviews_courseId_idx" ON "reviews"("courseId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_isVisible_idx" ON "reviews"("isVisible");

CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");
CREATE INDEX "certificates_courseId_idx" ON "certificates"("courseId");
CREATE INDEX "certificates_certificateCode_idx" ON "certificates"("certificateCode");

CREATE INDEX "placement_questions_language_idx" ON "placement_questions"("language");
CREATE INDEX "placement_questions_type_idx" ON "placement_questions"("type");
CREATE INDEX "placement_questions_difficulty_idx" ON "placement_questions"("difficulty");

CREATE INDEX "placement_sessions_userId_idx" ON "placement_sessions"("userId");
CREATE INDEX "placement_sessions_language_idx" ON "placement_sessions"("language");
CREATE INDEX "placement_sessions_status_idx" ON "placement_sessions"("status");

CREATE INDEX "placement_answers_sessionId_idx" ON "placement_answers"("sessionId");
CREATE INDEX "placement_answers_questionId_idx" ON "placement_answers"("questionId");

CREATE INDEX "chat_threads_type_idx" ON "chat_threads"("type");
CREATE INDEX "chat_threads_courseId_idx" ON "chat_threads"("courseId");
CREATE INDEX "chat_threads_studentId_idx" ON "chat_threads"("studentId");
CREATE INDEX "chat_threads_teacherId_idx" ON "chat_threads"("teacherId");
CREATE INDEX "chat_threads_userId_idx" ON "chat_threads"("userId");
CREATE INDEX "chat_threads_lastMessageAt_idx" ON "chat_threads"("lastMessageAt");

CREATE INDEX "chat_messages_threadId_idx" ON "chat_messages"("threadId");
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

CREATE INDEX "teacher_subscriptions_userId_idx" ON "teacher_subscriptions"("userId");
CREATE INDEX "teacher_subscriptions_status_idx" ON "teacher_subscriptions"("status");

CREATE INDEX "course_revenues_teacherId_idx" ON "course_revenues"("teacherId");
CREATE INDEX "course_revenues_courseId_idx" ON "course_revenues"("courseId");

CREATE INDEX "payout_requests_teacherId_idx" ON "payout_requests"("teacherId");
CREATE INDEX "payout_requests_status_idx" ON "payout_requests"("status");

-- -----------------------------------------------------------------------------
-- Foreign keys (onDelete как в schema.prisma)
-- -----------------------------------------------------------------------------
ALTER TABLE "verification_tokens"
    ADD CONSTRAINT "verification_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_resets"
    ADD CONSTRAINT "password_resets_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courses"
    ADD CONSTRAINT "courses_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD CONSTRAINT "lessons_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "questions"
    ADD CONSTRAINT "questions_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "progress"
    ADD CONSTRAINT "progress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "progress"
    ADD CONSTRAINT "progress_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "progress"
    ADD CONSTRAINT "progress_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answers"
    ADD CONSTRAINT "answers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answers"
    ADD CONSTRAINT "answers_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificates"
    ADD CONSTRAINT "certificates_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificates"
    ADD CONSTRAINT "certificates_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "placement_sessions"
    ADD CONSTRAINT "placement_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "placement_answers"
    ADD CONSTRAINT "placement_answers_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "placement_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "placement_answers"
    ADD CONSTRAINT "placement_answers_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "placement_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_threads"
    ADD CONSTRAINT "chat_threads_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_threads"
    ADD CONSTRAINT "chat_threads_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_threads"
    ADD CONSTRAINT "chat_threads_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_threads"
    ADD CONSTRAINT "chat_threads_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
    ADD CONSTRAINT "chat_messages_threadId_fkey"
    FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
    ADD CONSTRAINT "chat_messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "teacher_subscriptions"
    ADD CONSTRAINT "teacher_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_revenues"
    ADD CONSTRAINT "course_revenues_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_revenues"
    ADD CONSTRAINT "course_revenues_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_revenues"
    ADD CONSTRAINT "course_revenues_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payout_requests"
    ADD CONSTRAINT "payout_requests_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payout_requests"
    ADD CONSTRAINT "payout_requests_processedById_fkey"
    FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
