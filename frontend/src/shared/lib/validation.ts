import i18n from '@/shared/i18n/config'

function vt(key: string, opts?: Record<string, unknown>): string {
  return String(i18n.t(key, { ns: 'validation', ...opts }))
}

function lessonTypeLabel(type: string): string {
  const key = `lessonBuilder.lessonTypes.${type}.label`
  if (i18n.exists(key, { ns: 'platform' })) {
    return String(i18n.t(key, { ns: 'platform' }))
  }
  return type
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const isValidUrl = (url: string): boolean => {
  if (!url) return true // Optional field
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Course validation
export const validateCourseTitle = (title: string): ValidationResult => {
  const trimmed = title.trim()
  if (!trimmed) {
    return { isValid: false, error: vt('courseTitleRequired') }
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: vt('courseTitleMin') }
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: vt('courseTitleMax') }
  }
  return { isValid: true }
}

export const validateCourseDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (!trimmed) {
    return { isValid: false, error: vt('courseDescRequired') }
  }
  if (trimmed.length < 50) {
    return { isValid: false, error: vt('courseDescMin') }
  }
  if (trimmed.length > 5000) {
    return { isValid: false, error: vt('courseDescMax') }
  }
  return { isValid: true }
}

export const validateShortDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (trimmed && trimmed.length > 500) {
    return { isValid: false, error: vt('shortDescMax') }
  }
  return { isValid: true }
}

export const validateUrl = (url: string, fieldName: string): ValidationResult => {
  const trimmed = url.trim()
  if (!trimmed) return { isValid: true } // Optional

  if (!isValidUrl(trimmed)) {
    return { isValid: false, error: vt('invalidUrl', { field: fieldName }) }
  }
  return { isValid: true }
}

export const validatePrice = (priceInput: string): ValidationResult => {
  if (!priceInput.trim()) {
    return { isValid: false, error: vt('priceRequired') }
  }

  const numeric = Number(priceInput.replace(',', '.'))
  if (Number.isNaN(numeric)) {
    return { isValid: false, error: vt('priceInvalid') }
  }
  if (numeric < 0) {
    return { isValid: false, error: vt('priceNegative') }
  }
  return { isValid: true }
}

export const validateTags = (tagsInput: string): ValidationResult => {
  const tags = tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  if (tags.length === 0) {
    return { isValid: false, error: vt('tagsMin') }
  }
  if (tags.length > 10) {
    return { isValid: false, error: vt('tagsMax') }
  }

  for (const tag of tags) {
    if (tag.length < 2) {
      return { isValid: false, error: vt('tagMinLen') }
    }
    if (tag.length > 30) {
      return { isValid: false, error: vt('tagMaxLen') }
    }
  }

  return { isValid: true }
}

export const validateLearningOutcomes = (outcomesInput: string): ValidationResult => {
  const outcomes = outcomesInput
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  if (outcomes.length === 0) {
    return { isValid: false, error: vt('outcomesMin') }
  }
  if (outcomes.length > 20) {
    return { isValid: false, error: vt('outcomesMax') }
  }

  for (const outcome of outcomes) {
    if (outcome.length < 10) {
      return { isValid: false, error: vt('outcomeMinLen') }
    }
    if (outcome.length > 200) {
      return { isValid: false, error: vt('outcomeMaxLen') }
    }
  }

  return { isValid: true }
}

// Lesson validation
export const validateLessonTitle = (title: string): ValidationResult => {
  const trimmed = title.trim()
  if (!trimmed) {
    return { isValid: false, error: vt('lessonTitleRequired') }
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: vt('lessonTitleMin') }
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: vt('lessonTitleMax') }
  }
  return { isValid: true }
}

export const validateLessonDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (trimmed && trimmed.length > 1000) {
    return { isValid: false, error: vt('lessonDescMax') }
  }
  return { isValid: true }
}

export const validateLessonDuration = (duration: string): ValidationResult => {
  if (!duration.trim()) return { isValid: true } // Optional

  const numeric = Number(duration)
  if (Number.isNaN(numeric)) {
    return { isValid: false, error: vt('durationNumber') }
  }
  if (numeric <= 0) {
    return { isValid: false, error: vt('durationPositive') }
  }
  if (numeric > 300) {
    return { isValid: false, error: vt('durationMax') }
  }
  return { isValid: true }
}

export const validateLessonContent = (content: string, type: string): ValidationResult => {
  const trimmed = content.trim()

  // For VIDEO and INTERACTIVE content is optional (video is enough)
  if (type === 'VIDEO' || type === 'INTERACTIVE') {
    return { isValid: true }
  }

  // For TEXT and TEST content is required
  if (type === 'TEXT' || type === 'TEST') {
    if (!trimmed) {
      return {
        isValid: false,
        error: vt('contentRequiredForType', { type: lessonTypeLabel(type) }),
      }
    }
    if (trimmed.length < 50) {
      return { isValid: false, error: vt('contentMin') }
    }
  }

  if (trimmed.length > 100000) {
    return { isValid: false, error: vt('contentMax') }
  }

  return { isValid: true }
}

export const validateVideoUrl = (url: string, type: string): ValidationResult => {
  const trimmed = url.trim()

  if (type === 'VIDEO' && !trimmed) {
    return { isValid: false, error: vt('videoUrlRequiredVideo') }
  }

  if (trimmed && !isValidUrl(trimmed)) {
    return { isValid: false, error: vt('videoUrlInvalid') }
  }

  return { isValid: true }
}

// Validate all course fields at once
export const validateCourse = (data: {
  title: string
  description: string
  shortDescription: string
  coverImage: string
  previewVideo: string
  priceInput: string
  tagsInput: string
  learningOutcomesInput: string
}): ValidationResult => {
  let result: ValidationResult

  result = validateCourseTitle(data.title)
  if (!result.isValid) return result

  result = validateCourseDescription(data.description)
  if (!result.isValid) return result

  result = validateShortDescription(data.shortDescription)
  if (!result.isValid) return result

  result = validateUrl(data.coverImage, vt('urlFieldImage'))
  if (!result.isValid) return result

  result = validateUrl(data.previewVideo, vt('urlFieldVideo'))
  if (!result.isValid) return result

  result = validatePrice(data.priceInput)
  if (!result.isValid) return result

  result = validateTags(data.tagsInput)
  if (!result.isValid) return result

  result = validateLearningOutcomes(data.learningOutcomesInput)
  if (!result.isValid) return result

  return { isValid: true }
}

// Validate all lesson fields at once
export const validateLesson = (data: {
  title: string
  description: string
  type: string
  duration: string
  videoUrl: string
  content: string
}): ValidationResult => {
  let result: ValidationResult

  result = validateLessonTitle(data.title)
  if (!result.isValid) return result

  result = validateLessonDescription(data.description)
  if (!result.isValid) return result

  result = validateLessonDuration(data.duration)
  if (!result.isValid) return result

  result = validateVideoUrl(data.videoUrl, data.type)
  if (!result.isValid) return result

  result = validateLessonContent(data.content, data.type)
  if (!result.isValid) return result

  return { isValid: true }
}
