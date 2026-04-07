import type { PlacementQuestionType, PlacementQuestion } from '@/shared/types/placement'

export interface QuestionFormState {
  id?: string
  language: string
  type: PlacementQuestionType
  difficulty: number
  prompt: string
  context: string
  mediaUrl: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

export interface ErrorFormState {
  language?: string
  difficulty?: string
  prompt?: string
  options?: string
}

export const emptyQuestionForm: QuestionFormState = {
  language: 'English',
  type: 'GRAMMAR',
  difficulty: 3,
  prompt: '',
  context: '',
  mediaUrl: '',
  options: ['', '', ''],
  correctOptionIndex: 0,
  explanation: '',
}

export type AdminPlacementQuestion = PlacementQuestion & {
  correctOptionIndex: number
  explanation?: string | null
}

/** Filter / form option values; labels come from i18n in UI (placement.inProgress + admin.placementBank). */
export const typeOptions: { value: PlacementQuestionType | 'ALL' }[] = [
  { value: 'ALL' },
  { value: 'GRAMMAR' },
  { value: 'VOCAB' },
  { value: 'READING' },
  { value: 'LISTENING' },
]

