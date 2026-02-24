export interface LessonContentParsed {
  text?: string
  passThreshold?: number
  // exercises shape is loosely typed, используется только в интерактивах
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

