import { useState } from 'react'
import { Clock, Video, ClipboardCheck, MessageSquare, Plus, Save, X } from 'lucide-react'
import {
  useCreateLessonMutation,
  useCreateQuestionMutation,
} from '@/entities/lesson'
import type { CreateLessonDto, LessonType } from '@/shared/types/course'
import { Button, Input, VideoUpload } from '@/shared/ui'

type FormLessonType = 'VIDEO' | 'TEST' | 'INTERACTIVE'

interface TestQuestionForm {
  id: string
  text: string
  isMultiple: boolean
  options: { id: string; text: string; isCorrect: boolean }[]
}

interface FillBlankForm {
  id: string
  sentence: string
  answer: string
  hint: string
}

const lessonTypes: { value: FormLessonType; label: string; icon: typeof Video; description: string }[] = [
  { value: 'VIDEO', label: 'Видео-урок', icon: Video, description: 'Видео + дополнительные материалы' },
  { value: 'TEST', label: 'Тест', icon: ClipboardCheck, description: 'Вопросы с вариантами ответов' },
  { value: 'INTERACTIVE', label: 'Интерактив', icon: MessageSquare, description: 'Заполни пропуск / допиши предложение' },
]

function uid() {
  return Math.random().toString(36).slice(2)
}

function makeEmptyQuestion(): TestQuestionForm {
  return {
    id: uid(),
    text: '',
    isMultiple: false,
    options: [
      { id: uid(), text: '', isCorrect: false },
      { id: uid(), text: '', isCorrect: false },
    ],
  }
}

function makeEmptyExercise(): FillBlankForm {
  return { id: uid(), sentence: '', answer: '', hint: '' }
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
  // TEST specific
  const [passThreshold, setPassThreshold] = useState('70')
  const [testQuestions, setTestQuestions] = useState<TestQuestionForm[]>([makeEmptyQuestion()])
  const [isFinalTest, setIsFinalTest] = useState(false)
  // INTERACTIVE specific
  const [exercises, setExercises] = useState<FillBlankForm[]>([makeEmptyExercise()])

  const resetLessonForm = () => {
    setTitle('')
    setDescription('')
    setDuration('')
    setVideoUrl('')
    setAdditionalInfo('')
    setPassThreshold('70')
    setTestQuestions([makeEmptyQuestion()])
    setExercises([makeEmptyExercise()])
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
        if (!ex.answer.trim()) {
          onError('Укажите правильный ответ для всех упражнений')
          return
        }
        if (!ex.sentence.includes('___')) {
          onError('Обозначьте пропуск символами ___ в предложении')
          return
        }
      }
    }

    let content: string | undefined
    if (lessonType === 'VIDEO' && additionalInfo.trim()) {
      content = additionalInfo.trim()
    } else if (lessonType === 'TEST') {
      content = JSON.stringify({ passThreshold: Number(passThreshold) })
    } else if (lessonType === 'INTERACTIVE') {
      content = JSON.stringify({ exercises })
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
            options: filledOptions,
            points: 1,
          }).unwrap()
        }
      }

      // Create questions for INTERACTIVE
      if (lessonType === 'INTERACTIVE') {
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i]
          await createQuestion({
            lessonId,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: ex.sentence.trim(),
            options: [{ id: '1', text: ex.answer.trim(), isCorrect: true }],
            explanation: ex.hint.trim() || undefined,
            points: 1,
          }).unwrap()
        }
      }

      onSuccess('Урок успешно создан!')
      resetLessonForm()
      onClose()
    } catch (error) {
      const err = error as { data?: { message?: string } }
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
            </div>

            {/* Questions */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Вопросы ({testQuestions.length})</h4>
                <Button variant="outline" size="sm" onClick={addQuestion} type="button">
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить вопрос
                </Button>
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
                <Button variant="outline" size="sm" onClick={addExercise} type="button">
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить упражнение
                </Button>
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
                            Предложение с пропуском *
                          </label>
                          <Input
                            value={ex.sentence}
                            onChange={e => updateExercise(ex.id, { sentence: e.target.value })}
                            placeholder="I ___ to school every day."
                          />
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Правильный ответ *
                            </label>
                            <Input
                              value={ex.answer}
                              onChange={e => updateExercise(ex.id, { answer: e.target.value })}
                              placeholder="go"
                            />
                          </div>
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

