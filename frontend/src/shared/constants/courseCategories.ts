export const COURSE_CATEGORY_DEFS = [
  { value: 'Общий курс', labelKey: 'categoryLabels.general' as const },
  { value: 'Бизнес', labelKey: 'categoryLabels.business' as const },
  { value: 'Разговорный', labelKey: 'categoryLabels.conversational' as const },
  { value: 'Грамматика', labelKey: 'categoryLabels.grammar' as const },
  { value: 'Подготовка к экзаменам', labelKey: 'categoryLabels.examPrep' as const },
  { value: 'Для путешествий', labelKey: 'categoryLabels.travel' as const },
  { value: 'Академический', labelKey: 'categoryLabels.academic' as const },
  { value: 'Технический', labelKey: 'categoryLabels.technical' as const },
] as const

export type CourseCategory = (typeof COURSE_CATEGORY_DEFS)[number]['value']

/** Values sent to the API and used in filters (unchanged for backend compatibility). */
export const COURSE_CATEGORIES: readonly CourseCategory[] = COURSE_CATEGORY_DEFS.map(d => d.value)
