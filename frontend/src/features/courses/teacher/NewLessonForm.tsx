import { useState } from 'react'
import { Clock, Video, ClipboardCheck, MessageSquare, Plus, Save, X, BookOpen } from 'lucide-react'
import { AttachmentRow } from '@/features/courses/teacher/components/AttachmentRow'
import {
  useCreateLessonMutation,
  useCreateQuestionMutation,
} from '@/entities/lesson'
import type { CreateLessonDto, LessonType, Attachment } from '@/shared/types/course'
import { Button, Input, VideoUpload } from '@/shared/ui'

type FormLessonType = 'VIDEO' | 'TEST' | 'INTERACTIVE' | 'LEXICAL'

interface TestQuestionForm {
  id: string
  text: string
  explanation: string
  isMultiple: boolean
  options: { id: string; text: string; isCorrect: boolean }[]
}

interface FillBlankForm {
  id: string
  sentence: string
  blanks: string[]
  hint: string
}

interface LexicalItemForm {
  id: string
  term: string
  translations: string
}

const lessonTypes: { value: FormLessonType; label: string; icon: typeof Video; description: string }[] = [
  { value: 'VIDEO', label: 'Видео-урок', icon: Video, description: 'Видео + дополнительные материалы' },
  { value: 'TEST', label: 'Тест', icon: ClipboardCheck, description: 'Вопросы с вариантами ответов' },
  { value: 'INTERACTIVE', label: 'Интерактив', icon: MessageSquare, description: 'Заполни пропуск / допиши предложение' },
  { value: 'LEXICAL', label: 'Лексический тренажёр', icon: BookOpen, description: 'Тренировка лексики и перевода' },
]

function uid() {
  return Math.random().toString(36).slice(2)
}

function makeEmptyQuestion(): TestQuestionForm {
  return {
    id: uid(),
    text: '',
    explanation: '',
    isMultiple: false,
    options: [
      { id: uid(), text: '', isCorrect: false },
      { id: uid(), text: '', isCorrect: false },
    ],
  }
}

function makeEmptyExercise(): FillBlankForm {
  return { id: uid(), sentence: '', blanks: [''], hint: '' }
}

function makeEmptyLexicalItem(): LexicalItemForm {
  return { id: uid(), term: '', translations: '' }
}

interface NewLessonFormProps {
  courseId: string
  lessonsCount: number
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export const NewLessonForm = ({
  courseId,
  onClose,
  onSuccess,
  onError,
}: NewLessonFormProps) => {
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation()
  const [createQuestion] = useCreateQuestionMutation()

  // ── New lesson form state ──
  const [lessonType, setLessonType] = useState<FormLessonType>('VIDEO')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  // VIDEO specific
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  // TEST specific
  const [passThreshold, setPassThreshold] = useState('70')
  const [testTimeLimit, setTestTimeLimit] = useState('')
  const [testShuffleQuestions, setTestShuffleQuestions] = useState(false)
  const [testShuffleOptions, setTestShuffleOptions] = useState(false)
  const [testQuestions, setTestQuestions] = useState<TestQuestionForm[]>([makeEmptyQuestion()])
  const [isFinalTest, setIsFinalTest] = useState(false)
  // INTERACTIVE specific
  const [exercises, setExercises] = useState<FillBlankForm[]>([makeEmptyExercise()])
  // LEXICAL specific
  const [lexicalItems, setLexicalItems] = useState<LexicalItemForm[]>([makeEmptyLexicalItem()])

  const resetLessonForm = () => {
    setTitle('')
    setDescription('')
    setDuration('')
    setVideoUrl('')
    setAdditionalInfo('')
    setAttachments([])
    setPassThreshold('70')
    setTestTimeLimit('')
    setTestShuffleQuestions(false)
    setTestShuffleOptions(false)
    setTestQuestions([makeEmptyQuestion()])
    setExercises([makeEmptyExercise()])
    setLexicalItems([makeEmptyLexicalItem()])
    setLessonType('VIDEO')
  }

  const addQuestion = () => setTestQuestions(q => [...q, makeEmptyQuestion()])
  const removeQuestion = (qId: string) => setTestQuestions(q => q.filter(x => x.id !== qId))
  const updateQuestion = (qId: string, patch: Partial<TestQuestionForm>) =>
    setTestQuestions(q => q.map(x => (x.id === qId ? { ...x, ...patch } : x)))
  const addOption = (qId: string) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId
          ? { ...x, options: [...x.options, { id: uid(), text: '', isCorrect: false }] }
          : x,
      ),
    )
  const removeOption = (qId: string, oId: string) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId ? { ...x, options: x.options.filter(o => o.id !== oId) } : x,
      ),
    )
  const updateOption = (
    qId: string,
    oId: string,
    patch: Partial<{ text: string; isCorrect: boolean }>,
  ) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId
          ? {
              ...x,
              options: x.options.map(o => (o.id === oId ? { ...o, ...patch } : o)),
            }
          : x,
      ),
    )

  const addExercise = () => setExercises(e => [...e, makeEmptyExercise()])
  const removeExercise = (eId: string) =>
    setExercises(e => e.filter(x => x.id !== eId))
  const updateExercise = (eId: string, patch: Partial<FillBlankForm>) =>
    setExercises(e => e.map(x => (x.id === eId ? { ...x, ...patch } : x)))

  const handleSubmit = async () => {
    // Валидация
    if (!title.trim()) {
      onError('Введите название урока')
      return
    }
    if (lessonType === 'VIDEO' && !videoUrl.trim()) {
      onError('Введите URL видео')
      return
    }
    if (lessonType === 'TEST') {
      const threshold = Number(passThreshold)
      if (!passThreshold || Number.isNaN(threshold) || threshold < 1 || threshold > 100) {
        onError('Укажите порог прохождения (1–100%)')
        return
      }
      if (testQuestions.length === 0) {
        onError('Добавьте хотя бы один вопрос')
        return
      }
      for (const q of testQuestions) {
        if (!q.text.trim()) {
          onError('Заполните текст всех вопросов')
          return
        }
        const hasOption = q.options.some(o => o.text.trim())
        if (!hasOption) {
          onError('Добавьте варианты ответов для всех вопросов')
          return
        }
        const hasCorrect = q.options.some(o => o.isCorrect)
        if (!hasCorrect) {
          onError('Отметьте хотя бы один правильный ответ в каждом вопросе')
          return
        }
      }
    }
    if (lessonType === 'INTERACTIVE') {
      if (exercises.length === 0) {
        onError('Добавьте хотя бы одно упражнение')
        return
      }
      for (const ex of exercises) {
        if (!ex.sentence.trim()) {
          onError('Заполните предложение для всех упражнений')
          return
        }
        if (!ex.sentence.includes('___')) {
          onError('Обозначьте пропуск символами ___ в предложении')
          return
        }
        const requiredBlanks = (ex.sentence.match(/___/g) || []).length
        for (let i = 0; i < requiredBlanks; i++) {
          const b = (ex.blanks || [])[i] ?? ''
          if (!b.split(',').some(s => s.trim())) {
            onError(`Укажите ответ для пропуска ${i + 1} в упражнении`)
            return
          }
        }
      }
    }
    if (lessonType === 'LEXICAL') {
      if (lexicalItems.length === 0) {
        onError('Добавьте хотя бы один лексический элемент')
        return
      }
      for (const item of lexicalItems) {
        if (!item.term.trim()) {
          onError('Заполните слово/фразу для всех элементов')
          return
        }
        const hasTranslation = item.translations
          .split(',')
          .some(t => t.trim().length > 0)
        if (!hasTranslation) {
          onError(`Укажите хотя бы один перевод для "${item.term}"`)
          return
        }
      }
    }

    let content: string | undefined
    if (lessonType === 'VIDEO' && additionalInfo.trim()) {
      content = additionalInfo.trim()
    } else if (lessonType === 'TEST') {
      content = JSON.stringify({
        passThreshold: Number(passThreshold),
        ...(testTimeLimit && !Number.isNaN(Number(testTimeLimit)) && Number(testTimeLimit) > 0
          ? { timeLimitMinutes: Number(testTimeLimit) }
          : {}),
        shuffleQuestions: testShuffleQuestions,
        shuffleOptions: testShuffleOptions,
      })
    } else if (lessonType === 'INTERACTIVE') {
      content = JSON.stringify({ exercises })
    } else if (lessonType === 'LEXICAL') {
      // Пока без сложных настроек: контент можно использовать позже для метаданных
      content = undefined
    }

    const dto: CreateLessonDto = {
      courseId,
      title: title.trim(),
      description: description.trim() || undefined,
      type: lessonType as LessonType,
      videoUrl: videoUrl.trim() || undefined,
      content,
      duration: duration ? Number(duration) * 60 : undefined,
      isFinalTest: lessonType === 'TEST' ? isFinalTest : false,
      ...(lessonType === 'VIDEO' && attachments.filter(a => a.name.trim() && a.url.trim()).length > 0
        ? { attachments: attachments.filter(a => a.name.trim() && a.url.trim()) }
        : {}),
    }

    try {
      const result = await createLesson(dto).unwrap()
      const lessonId = result.data.id

      // Create questions for TEST
      if (lessonType === 'TEST') {
        for (let i = 0; i < testQuestions.length; i++) {
          const q = testQuestions[i]
          const filledOptions = q.options.filter(o => o.text.trim())
          await createQuestion({
            lessonId,
            type: q.isMultiple ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE',
            order: i + 1,
            question: q.text.trim(),
            explanation: q.explanation?.trim() || undefined,
            options: filledOptions,
            points: 1,
          }).unwrap()
        }
      }

      // Create questions for INTERACTIVE (несколько пропусков, синонимы через запятую)
      if (lessonType === 'INTERACTIVE') {
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i]
          const requiredBlanks = (ex.sentence.match(/___/g) || []).length || 1
          const blanks = (ex.blanks || []).slice(0, requiredBlanks)
          while (blanks.length < requiredBlanks) blanks.push('')
          const options: { id: string; text: string; isCorrect: boolean; blankIndex?: number }[] = []
          blanks.forEach((b, bi) => {
            b.split(',').map(s => s.trim()).filter(Boolean).forEach((text, ti) => {
              options.push({ id: `${bi}-${ti}`, text, isCorrect: true, blankIndex: bi })
            })
          })
          if (options.length === 0) options.push({ id: '1', text: '', isCorrect: true, blankIndex: 0 })
          await createQuestion({
            lessonId,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: ex.sentence.trim(),
            options,
            explanation: ex.hint?.trim() || undefined,
            points: 1,
          }).unwrap()
        }
      }

      // Create questions for LEXICAL (слово/фраза + переводы через запятую)
      if (lessonType === 'LEXICAL') {
        for (let i = 0; i < lexicalItems.length; i++) {
          const item = lexicalItems[i]
          const translations = item.translations
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
          const options =
            translations.length > 0
              ? translations.map((text, ti) => ({
                  id: `${i}-${ti}`,
                  text,
                  isCorrect: true,
                }))
              : [{ id: '1', text: '', isCorrect: true }]

          await createQuestion({
            lessonId,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: item.term.trim(),
            options,
            points: 1,
          }).unwrap()
        }
      }

      onSuccess('Урок успешно создан!')
      resetLessonForm()
      onClose()
    } catch (error) {
      const err = error as { data?: { message?: string; code?: string } }
      if (err?.data?.code === 'FINAL_TEST_ALREADY_EXISTS') {
        onError(
          'Финальный тест для этого курса уже создан. Отредактируйте существующий финальный тест или снимите с него этот статус.'
        )
        return
      }
      onError(err?.data?.message || 'Не удалось создать урок')
    }
  }

  return (
    <div className="glass-card p-6 rounded-md">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Новый урок</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetLessonForm()
            onClose()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Common fields */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Название урока *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Урок 1. Тема урока"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Краткое описание урока"
              className="min-h-[72px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              <Clock className="mr-1 inline h-3 w-3" />
              Длительность (мин)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="15"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Тип урока</label>
            <div className="grid grid-cols-3 gap-2">
              {lessonTypes.map(lt => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setLessonType(lt.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-all ${
                    lessonType === lt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <lt.icon className="h-5 w-5" />
                  <span className="font-medium">{lt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIDEO fields */}
        {lessonType === 'VIDEO' && (
          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Video className="h-4 w-4" />
              <span>Настройки видео-урока</span>
            </div>
            <VideoUpload value={videoUrl} onChange={setVideoUrl} label="Видео урока" required />
            <div>
              <label className="mb-1 block text-sm font-medium">Дополнительные материалы</label>
              <textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                placeholder="Полезные ссылки, заметки, описание урока..."
                className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Методички и файлы</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAttachments(a => [...a, { name: '', url: '', size: 0 }])}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить файл
                </Button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                Загрузите файл с устройства или укажите ссылку. PDF, DOC, DOCX, TXT, ODT — до 25 МБ.
              </p>
              {attachments.map((att, idx) => (
                <div key={idx} className="mb-2">
                  <AttachmentRow
                    attachment={att}
                    onUpdate={upd =>
                      setAttachments(a => a.map((x, i) => (i === idx ? { ...x, ...upd } : x)))
                    }
                    onRemove={() => setAttachments(a => a.filter((_, i) => i !== idx))}
                    onUploadError={onError}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEST fields */}
        {lessonType === 'TEST' && (
          <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-center justify-between gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span>Настройки теста</span>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                <input
                  type="checkbox"
                  checked={isFinalTest}
                  onChange={e => setIsFinalTest(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span>Сделать финальным тестом курса</span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <VideoUpload
                value={videoUrl}
                onChange={setVideoUrl}
                label="Видео к тесту (по желанию)"
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Порог прохождения (%) *</label>
                <Input
                  type="number"
                  value={passThreshold}
                  onChange={e => setPassThreshold(e.target.value)}
                  placeholder="70"
                  min={1}
                  max={100}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Минимум {passThreshold || '?'}% для зачёта
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Таймер (минут)</label>
                <Input
                  type="number"
                  value={testTimeLimit}
                  onChange={e => setTestTimeLimit(e.target.value)}
                  min={1}
                  placeholder="Без таймера"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={testShuffleQuestions}
                  onChange={e => setTestShuffleQuestions(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600"
                />
                Перемешивать вопросы
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={testShuffleOptions}
                  onChange={e => setTestShuffleOptions(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600"
                />
                Перемешивать варианты ответов
              </label>
            </div>

            {/* Questions */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Вопросы ({testQuestions.length})</h4>
              </div>

              <div className="space-y-4">
                {testQuestions.map((q, qi) => (
                  <div key={q.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {qi + 1}
                      </span>
                      <div className="flex-1">
                        <textarea
                          value={q.text}
                          onChange={e => updateQuestion(q.id, { text: e.target.value })}
                          placeholder="Текст вопроса..."
                          className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        type="button"
                        className="mt-2 text-muted-foreground hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-2">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Объяснение (показывается после ответа)
                      </label>
                      <textarea
                        value={q.explanation}
                        onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                        placeholder="Почему этот ответ правильный..."
                        className="min-h-[50px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={q.isMultiple}
                          onChange={e =>
                            updateQuestion(q.id, { isMultiple: e.target.checked })
                          }
                          className="h-3.5 w-3.5 rounded"
                        />
                        Несколько правильных ответов
                      </label>
                    </div>

                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type={q.isMultiple ? 'checkbox' : 'radio'}
                            checked={opt.isCorrect}
                            onChange={e => {
                              if (!q.isMultiple) {
                                // For radio: uncheck all, check this one
                                q.options.forEach(o =>
                                  updateOption(q.id, o.id, { isCorrect: false }),
                                )
                              }
                              updateOption(q.id, opt.id, { isCorrect: e.target.checked })
                            }}
                            className="h-4 w-4 shrink-0 text-primary"
                            name={`q-${q.id}`}
                          />
                          <Input
                            value={opt.text}
                            onChange={e =>
                              updateOption(q.id, opt.id, { text: e.target.value })
                            }
                            placeholder={`Вариант ${q.options.indexOf(opt) + 1}`}
                            className="flex-1 text-sm"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOption(q.id, opt.id)}
                              type="button"
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(q.id)}
                        type="button"
                        className="text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Добавить вариант
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addQuestion} type="button" className="mt-3 w-full">
                <Plus className="mr-1 h-3 w-3" />
                Добавить вопрос
              </Button>
            </div>
          </div>
        )}

        {/* INTERACTIVE fields */}
        {lessonType === 'INTERACTIVE' && (
          <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
              <MessageSquare className="h-4 w-4" />
              <span>Интерактивные упражнения</span>
            </div>
            <VideoUpload
              value={videoUrl}
              onChange={setVideoUrl}
              label="Видео к интерактиву (по желанию)"
            />

            <div className="rounded-lg border border-purple-200/60 bg-purple-100/30 px-3 py-2 text-xs text-purple-700 dark:border-purple-800/30 dark:bg-purple-900/20 dark:text-purple-300">
              Обозначьте пропуск символами{' '}
              <code className="rounded bg-purple-200/50 px-1 dark:bg-purple-800/40">___</code> в
              предложении. Пример: <em>«I ___ (go) to school every day.»</em>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Упражнения ({exercises.length})</h4>
              </div>

              <div className="space-y-4">
                {exercises.map((ex, ei) => (
                  <div key={ex.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                        {ei + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Предложение с пропусками ___ *
                          </label>
                          <Input
                            value={ex.sentence}
                            onChange={e => {
                              const newSentence = e.target.value
                              const count = (newSentence.match(/___/g) || []).length || 1
                              const newBlanks = [...(ex.blanks || [''])]
                              while (newBlanks.length < count) newBlanks.push('')
                              updateExercise(ex.id, { sentence: newSentence, blanks: newBlanks.slice(0, count) })
                            }}
                            placeholder="I ___ to school ___ ."
                          />
                        </div>
                        {Array.from({ length: Math.max(1, (ex.sentence.match(/___/g) || []).length) }, (_, bi) => (
                          <div key={bi}>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Пропуск {bi + 1} * (синонимы через запятую)
                            </label>
                            <Input
                              value={(ex.blanks || [])[bi] ?? ''}
                              onChange={e => {
                                const newBlanks = [...(ex.blanks || [''])]
                                while (newBlanks.length <= bi) newBlanks.push('')
                                newBlanks[bi] = e.target.value
                                updateExercise(ex.id, { blanks: newBlanks })
                              }}
                              placeholder="go, goes"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Подсказка (по желанию)
                          </label>
                          <Input
                            value={ex.hint}
                            onChange={e => updateExercise(ex.id, { hint: e.target.value })}
                            placeholder="Глагол в форме Present Simple"
                          />
                        </div>
                      </div>
                      {exercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(ex.id)}
                          type="button"
                          className="mt-2 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addExercise} type="button" className="mt-3 w-full">
                <Plus className="mr-1 h-3 w-3" />
                Добавить упражнение
              </Button>
            </div>
          </div>
        )}

        {/* LEXICAL fields */}
        {lessonType === 'LEXICAL' && (
          <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
              <BookOpen className="h-4 w-4" />
              <span>Лексический тренажёр</span>
            </div>
            <VideoUpload
              value={videoUrl}
              onChange={setVideoUrl}
              label="Видео к тренажёру (по желанию)"
            />

            <div className="rounded-lg border border-sky-200/60 bg-sky-100/30 px-3 py-2 text-xs text-sky-700 dark:border-sky-800/30 dark:bg-sky-900/20 dark:text-sky-300">
              Добавьте слова или фразы и их переводы. Переводы можно указывать через запятую (синонимы).
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Слова ({lexicalItems.length})</h4>
              </div>

              <div className="space-y-4">
                {lexicalItems.map((item, idx) => (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600 dark:text-sky-300">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Слово / фраза *
                          </label>
                          <Input
                            value={item.term}
                            onChange={e =>
                              setLexicalItems(items =>
                                items.map(x =>
                                  x.id === item.id ? { ...x, term: e.target.value } : x,
                                ),
                              )
                            }
                            placeholder="to book, make up, etc."
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Переводы * (через запятую)
                          </label>
                          <Input
                            value={item.translations}
                            onChange={e =>
                              setLexicalItems(items =>
                                items.map(x =>
                                  x.id === item.id ? { ...x, translations: e.target.value } : x,
                                ),
                              )
                            }
                            placeholder="бронь, заказывать, резервировать"
                          />
                        </div>
                      </div>
                      {lexicalItems.length > 1 && (
                        <button
                          onClick={() =>
                            setLexicalItems(items => items.filter(x => x.id !== item.id))
                          }
                          type="button"
                          className="mt-2 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" type="button" onClick={() => setLexicalItems(items => [...items, makeEmptyLexicalItem()])} className="mt-3 w-full">
                <Plus className="mr-1 h-3 w-3" />
                Добавить слово
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={isCreating}>
            <Save className="mr-2 h-4 w-4" />
            {isCreating ? 'Создание...' : 'Создать урок'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetLessonForm()
              onClose()
            }}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  )
}

