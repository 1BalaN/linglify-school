export type CourseLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED'

export type LessonType = 'VIDEO' | 'TEST' | 'INTERACTIVE' | 'LEXICAL' | 'DIALOGUE'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'MATCHING'

export interface Teacher {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  avatar: string | null
  bio: string | null
}

export interface Course {
  id: string
  title: string
  description: string
  shortDescription: string | null
  level: CourseLevel
  language: string
  category: string | null
  
  teacherId: string
  teacher: Teacher
  
  coverImage: string | null
  previewVideo: string | null
  duration: number | null
  lessonsCount: number
  
  status: CourseStatus
  isPublished: boolean
  publishedAt: string | null
  
  price: number
  currency: string
  
  enrolledCount: number
  averageRating: number | null
  reviewsCount: number
  
  tags: string[]
  prerequisites: string[]
  learningOutcomes: string[]
  lastReviewComment?: string | null
  lastReviewedAt?: string | null
  
  createdAt: string
  updatedAt: string
  
  // Дополнительные поля (приходят с сервера при детализации)
  isEnrolled?: boolean
  enrollment?: Enrollment | null
  lessons?: Lesson[]
  reviews?: Review[]
  userProgress?: Record<string, LessonProgress>
  _count?: {
    lessons: number
    enrollments: number
    reviews: number
  }
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string | null
  order: number
  type: LessonType
  
  content: string | null
  videoUrl: string | null
  duration: number | null
  
  attachments: Attachment[] | null
  
  isPublished: boolean
  isFinalTest: boolean
  
  createdAt: string
  updatedAt: string
  
  // Дополнительные поля
  course?: Course
  questions?: Question[]
  hasAccess?: boolean
  userProgress?: LessonProgress | null
  progress?: LessonProgress | null
  /** Последние ответы пользователя по вопросам урока (questionId -> Answer) */
  userAnswers?: Record<string, Answer> | null
}

export interface Attachment {
  name: string
  url: string
  size: number
}

export interface Question {
  id: string
  lessonId: string
  type: QuestionType
  order: number
  
  question: string
  explanation: string | null
  
  options: QuestionOption[]
  
  points: number
  timeLimit: number | null
  
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
  /** Для FILL_IN_BLANK с несколькими пропусками: индекс пропуска (0, 1, …) */
  blankIndex?: number
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  
  enrolledAt: string
  startedAt: string | null
  completedAt: string | null
  
  progress: number
  
  expiresAt: string | null
  
  createdAt: string
  updatedAt: string
  
  // Дополнительные поля
  course?: Course
}

export interface LessonProgress {
  id: string
  userId: string
  courseId: string
  lessonId: string
  
  isCompleted: boolean
  completedAt: string | null
  
  timeSpent: number
  attempts: number
  score: number | null
  
  lastPosition: number
  
  createdAt: string
  updatedAt: string
  
  // Дополнительные поля
  lesson?: Lesson
}

export interface Answer {
  id: string
  userId: string
  questionId: string
  
  answer: string | string[] | { from: string; to: string }[]
  isCorrect: boolean
  
  timeSpent: number | null
  attempts: number
  
  createdAt: string
  
  // Дополнительные поля (при проверке ответа)
  explanation?: string
  correctAnswer?: QuestionOption[]
}

export interface Review {
  id: string
  userId: string
  courseId: string
  
  rating: number
  comment: string | null
  
  isVisible: boolean
  
  createdAt: string
  updatedAt: string
  
  // Дополнительные поля
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
    role?: string
  }
  course?: Course
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  
  certificateCode: string
  issuedAt: string
  
  pdfUrl: string | null
  
  finalScore: number | null
  completionTime: number | null
  
  // Дополнительные поля
  course?: Course
  user?: {
    firstName: string | null
    lastName: string | null
  }
}

// DTO types
export interface CreateCourseDto {
  title: string
  description: string
  shortDescription?: string
  level: CourseLevel
  language?: string
  category?: string
  coverImage?: string
  previewVideo?: string
  duration?: number
  price?: number
  currency?: string
  tags?: string[]
  prerequisites?: string[]
  learningOutcomes?: string[]
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface CreateLessonDto {
  courseId: string
  title: string
  description?: string
  type: LessonType
  content?: string
  videoUrl?: string
  duration?: number
  attachments?: Attachment[]
  isPublished?: boolean
  isFinalTest?: boolean
}

export interface UpdateLessonDto extends Partial<Omit<CreateLessonDto, 'courseId'>> {}

export interface CreateQuestionDto {
  lessonId: string
  type: QuestionType
  order: number
  question: string
  explanation?: string
  options: QuestionOption[]
  points?: number
  timeLimit?: number
}

export interface UpdateQuestionDto extends Partial<Omit<CreateQuestionDto, 'lessonId'>> {}

export interface SubmitAnswerDto {
  questionId: string
  answer: string | string[] | { from: string; to: string }[]
}

export interface UpdateProgressDto {
  lessonId: string
  isCompleted?: boolean
  timeSpent?: number
  lastPosition?: number
  score?: number
}

export interface CreateReviewDto {
  courseId: string
  rating: number
  comment?: string
}

export interface UpdateReviewDto {
  rating?: number
  comment?: string
}

// Query types
export interface GetCoursesQuery {
  level?: CourseLevel
  category?: string
  status?: CourseStatus
  teacherId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  tags?: string
  isPublished?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'price' | 'enrolledCount' | 'averageRating'
  order?: 'asc' | 'desc'
}

// Response types
export interface CoursesResponse {
  data: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CourseProgressResponse {
  enrollment: Enrollment
  progresses: LessonProgress[]
  statistics: {
    totalLessons: number
    completedLessons: number
    progress: number
    totalTimeSpent: number
    averageScore: number | null
  }
}
