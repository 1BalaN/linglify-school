export const COURSE_CATEGORIES = [
  'Общий курс',
  'Бизнес',
  'Разговорный',
  'Грамматика',
  'Подготовка к экзаменам',
  'Для путешествий',
  'Академический',
  'Технический',
] as const

export type CourseCategory = typeof COURSE_CATEGORIES[number]
