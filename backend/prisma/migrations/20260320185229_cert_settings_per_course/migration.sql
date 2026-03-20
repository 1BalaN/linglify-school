-- Add certificate policy fields to courses (per-course settings)
ALTER TABLE "courses"
  ADD COLUMN "requireFinalTestForCertificate" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "minProgressForCertificate"      INTEGER NOT NULL DEFAULT 100;

-- Add new global platform settings
ALTER TABLE "platform_settings"
  ADD COLUMN "trialSubscriptionDays"          INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "maxCoursesPerStudent"            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "autoArchiveDaysAfterInactivity"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reviewModerationEnabled"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "certificateValidityMonths"       INTEGER NOT NULL DEFAULT 0;

-- Drop old certificate columns from platform_settings (moved to courses)
ALTER TABLE "platform_settings"
  DROP COLUMN IF EXISTS "requireFinalTestForCertificate",
  DROP COLUMN IF EXISTS "minProgressForCertificate";
