-- CreateTable
CREATE TABLE "platform_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "requireFinalTestForCertificate" BOOLEAN NOT NULL DEFAULT true,
    "minProgressForCertificate" INTEGER NOT NULL DEFAULT 100,
    "lowRatingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "minEnrollmentsForRating" INTEGER NOT NULL DEFAULT 5,
    "placementDefaultQuestions" INTEGER NOT NULL DEFAULT 25,
    "placementAllowedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "placementRecommendationMap" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
