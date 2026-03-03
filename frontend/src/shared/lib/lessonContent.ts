export interface LessonContentParsed {
  text?: string
  passThreshold?: number
  /** Таймер на весь тест (минуты). Опционально. */
  timeLimitMinutes?: number
  /** Перемешивать порядок вопросов */
  shuffleQuestions?: boolean
  /** Перемешивать варианты ответов в каждом вопросе */
  shuffleOptions?: boolean
  exercises?: Array<{
    id?: string
    sentence: string
    answer: string
    hint?: string
  }>
}

export function parseLessonContent(content: string | null): LessonContentParsed {
  if (!content) return {}
  const trimmed = content.trim()

  // Простой текст без JSON — используем как text
  if (!trimmed.startsWith('{')) {
    return { text: content }
  }

  try {
    return JSON.parse(trimmed) as LessonContentParsed
  } catch {
    return {}
  }
}

export function getPassThresholdFromContent(content: string | null, fallback = 70): number {
  const parsed = parseLessonContent(content)
  return typeof parsed.passThreshold === 'number' ? parsed.passThreshold : fallback
}

export function getAdditionalTextFromContent(content: string | null): string {
  const parsed = parseLessonContent(content)
  return typeof parsed.text === 'string' ? parsed.text : ''
}

export function getTestOptionsFromContent(content: string | null): {
  timeLimitMinutes: number | null
  shuffleQuestions: boolean
  shuffleOptions: boolean
} {
  const parsed = parseLessonContent(content)
  return {
    timeLimitMinutes:
      typeof parsed.timeLimitMinutes === 'number' && parsed.timeLimitMinutes > 0
        ? parsed.timeLimitMinutes
        : null,
    shuffleQuestions: !!parsed.shuffleQuestions,
    shuffleOptions: !!parsed.shuffleOptions,
  }
}

