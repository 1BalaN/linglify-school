import type { Course, CourseLevel } from './course'

export type PlacementQuestionType = 'GRAMMAR' | 'VOCAB' | 'READING' | 'LISTENING'

export interface PlacementQuestion {
  id: string
  language: string
  type: PlacementQuestionType
  difficulty: number
  prompt: string
  context?: string | null
  mediaUrl?: string | null
  options: string[]
}

export interface PlacementSessionSummary {
  id: string
  language: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  startedAt: string
  finishedAt: string | null
  estimatedLevel: CourseLevel | null
  rawScore: number
  totalQuestions: number
}

export interface PlacementAnswerDetails {
  id: string
  questionId: string
  isCorrect: boolean
  givenOptionIndex: number
  timeMs?: number | null
  question: {
    type: PlacementQuestionType
    difficulty: number
    prompt: string
    context?: string | null
    mediaUrl?: string | null
    options: string[]
    correctOptionIndex: number
    explanation?: string | null
  }
}

export interface StartPlacementResponse {
  session: PlacementSessionSummary
  question: PlacementQuestion
  questionIndex: number
  maxQuestions: number
}

export interface SubmitPlacementInProgressResponse {
  finished: false
  session: PlacementSessionSummary
  question: PlacementQuestion
  questionIndex: number
  maxQuestions: number
}

export interface SubmitPlacementFinishedResponse {
  finished: true
  session: PlacementSessionSummary
  result: {
    estimatedLevel: CourseLevel
    rawScore: number
    totalQuestions: number
  }
}

export type SubmitPlacementResponse =
  | SubmitPlacementInProgressResponse
  | SubmitPlacementFinishedResponse

export interface PlacementResultResponse {
  session: PlacementSessionSummary
  answers: PlacementAnswerDetails[]
}

export interface PlacementRecommendedCourse
  extends Pick<
    Course,
    'id' | 'title' | 'shortDescription' | 'level' | 'language' | 'coverImage' | 'enrolledCount' | 'averageRating'
  > {}

