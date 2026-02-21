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
    return { isValid: false, error: 'Название курса обязательно' }
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Название должно содержать минимум 3 символа' }
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Название должно содержать максимум 200 символов' }
  }
  return { isValid: true }
}

export const validateCourseDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Описание курса обязательно' }
  }
  if (trimmed.length < 50) {
    return { isValid: false, error: 'Описание должно содержать минимум 50 символов' }
  }
  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Описание должно содержать максимум 5000 символов' }
  }
  return { isValid: true }
}

export const validateShortDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (trimmed && trimmed.length > 500) {
    return { isValid: false, error: 'Краткое описание должно содержать максимум 500 символов' }
  }
  return { isValid: true }
}

export const validateUrl = (url: string, fieldName: string): ValidationResult => {
  const trimmed = url.trim()
  if (!trimmed) return { isValid: true } // Optional
  
  if (!isValidUrl(trimmed)) {
    return { isValid: false, error: `${fieldName} должно быть валидным URL` }
  }
  return { isValid: true }
}

export const validatePrice = (priceInput: string): ValidationResult => {
  if (!priceInput.trim()) {
    return { isValid: false, error: 'Цена обязательна (укажите 0 для бесплатного курса)' }
  }
  
  const numeric = Number(priceInput.replace(',', '.'))
  if (Number.isNaN(numeric)) {
    return { isValid: false, error: 'Некорректная цена' }
  }
  if (numeric < 0) {
    return { isValid: false, error: 'Цена не может быть отрицательной' }
  }
  return { isValid: true }
}

export const validateTags = (tagsInput: string): ValidationResult => {
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  
  if (tags.length === 0) {
    return { isValid: false, error: 'Добавьте хотя бы один тег' }
  }
  if (tags.length > 10) {
    return { isValid: false, error: 'Максимум 10 тегов' }
  }
  
  for (const tag of tags) {
    if (tag.length < 2) {
      return { isValid: false, error: 'Каждый тег должен содержать минимум 2 символа' }
    }
    if (tag.length > 30) {
      return { isValid: false, error: 'Каждый тег должен содержать максимум 30 символов' }
    }
  }
  
  return { isValid: true }
}

export const validateLearningOutcomes = (outcomesInput: string): ValidationResult => {
  const outcomes = outcomesInput
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  
  if (outcomes.length === 0) {
    return { isValid: false, error: 'Добавьте хотя бы один результат обучения' }
  }
  if (outcomes.length > 20) {
    return { isValid: false, error: 'Максимум 20 результатов обучения' }
  }
  
  for (const outcome of outcomes) {
    if (outcome.length < 10) {
      return { isValid: false, error: 'Каждый результат должен содержать минимум 10 символов' }
    }
    if (outcome.length > 200) {
      return { isValid: false, error: 'Каждый результат должен содержать максимум 200 символов' }
    }
  }
  
  return { isValid: true }
}

// Lesson validation
export const validateLessonTitle = (title: string): ValidationResult => {
  const trimmed = title.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Название урока обязательно' }
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Название должно содержать минимум 3 символа' }
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Название должно содержать максимум 200 символов' }
  }
  return { isValid: true }
}

export const validateLessonDescription = (description: string): ValidationResult => {
  const trimmed = description.trim()
  if (trimmed && trimmed.length > 1000) {
    return { isValid: false, error: 'Описание должно содержать максимум 1000 символов' }
  }
  return { isValid: true }
}

export const validateLessonDuration = (duration: string): ValidationResult => {
  if (!duration.trim()) return { isValid: true } // Optional
  
  const numeric = Number(duration)
  if (Number.isNaN(numeric)) {
    return { isValid: false, error: 'Длительность должна быть числом' }
  }
  if (numeric <= 0) {
    return { isValid: false, error: 'Длительность должна быть больше 0' }
  }
  if (numeric > 300) {
    return { isValid: false, error: 'Длительность урока не может превышать 300 минут (5 часов)' }
  }
  return { isValid: true }
}

export const validateLessonContent = (content: string, type: string): ValidationResult => {
  const trimmed = content.trim()
  
  // Для VIDEO и INTERACTIVE контент опционален (достаточно видео)
  if (type === 'VIDEO' || type === 'INTERACTIVE') {
    return { isValid: true }
  }
  
  // Для TEXT и TEST контент обязателен
  if (type === 'TEXT' || type === 'TEST') {
    if (!trimmed) {
      return { isValid: false, error: `Контент обязателен для уроков типа ${type}` }
    }
    if (trimmed.length < 50) {
      return { isValid: false, error: 'Контент должен содержать минимум 50 символов' }
    }
  }
  
  if (trimmed.length > 100000) {
    return { isValid: false, error: 'Контент слишком большой (максимум 100000 символов)' }
  }
  
  return { isValid: true }
}

export const validateVideoUrl = (url: string, type: string): ValidationResult => {
  const trimmed = url.trim()
  
  // Для VIDEO урока URL обязателен
  if (type === 'VIDEO' && !trimmed) {
    return { isValid: false, error: 'URL видео обязателен для видео-уроков' }
  }
  
  // Проверка валидности URL
  if (trimmed && !isValidUrl(trimmed)) {
    return { isValid: false, error: 'Некорректный URL видео' }
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

  result = validateUrl(data.coverImage, 'Изображение')
  if (!result.isValid) return result

  result = validateUrl(data.previewVideo, 'Видео')
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
