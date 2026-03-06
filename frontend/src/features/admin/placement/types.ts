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
  language: 'Английский',
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

export const typeOptions: { value: PlacementQuestionType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все типы' },
  { value: 'GRAMMAR', label: 'Грамматика' },
  { value: 'VOCAB', label: 'Лексика' },
  { value: 'READING', label: 'Чтение' },
  { value: 'LISTENING', label: 'Аудирование' },
]

