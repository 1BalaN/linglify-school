import { useState, useEffect } from 'react'
import {
  useGetLessonByIdQuery,
  useUpdateLessonMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '@/entities/lesson'
import type {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionType,
} from '@/shared/types/course'
import { VideoUpload, Button, Input } from '@/shared/ui'
import {
  Save, X, Plus, Trash2, Video, ClipboardCheck, MessageSquare, Loader2,
  AlertCircle,
} from 'lucide-react'

interface EditQuestionForm {
  /** If starts with "new_" → not yet saved */
  id: string
  text: string
  isMultiple: boolean
  options: { id: string; text: string; isCorrect: boolean }[]
}

interface EditExerciseForm {
  id: string
  sentence: string
  answer: string
}


function uid() { return 'new_' + Math.random().toString(36).slice(2) }
function isNew(id: string) { return id.startsWith('new_') }

function questionsToForm(questions: Question[]): EditQuestionForm[] {
  return questions
    .filter(q => q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE')
    .map(q => ({
      id: q.id,
      text: q.question,
      isMultiple: q.type === 'MULTIPLE_CHOICE',
      options: (q.options as { id: string; text: string; isCorrect: boolean }[]).map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    }))
}

function exercisesToForm(questions: Question[]): EditExerciseForm[] {
  return questions
    .filter(q => q.type === 'FILL_IN_BLANK')
    .map(q => ({
      id: q.id,
      sentence: q.question,
      answer: (q.options as { text: string }[])[0]?.text || '',
    }))
}

function parseContent(content: string | null): Record<string, unknown> {
  if (!content) return {}
  try { return JSON.parse(content) } catch { return {} }
}

interface LessonEditPanelProps {
  lessonId: string
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

export const LessonEditPanel = ({
  lessonId,
  onClose,
  onSuccess,
  onError,
}: LessonEditPanelProps) => {
  const { data, isLoading } = useGetLessonByIdQuery(lessonId)
  const lesson = data?.data

  const [updateLesson, { isLoading: isSaving }] = useUpdateLessonMutation()
  const [createQuestion] = useCreateQuestionMutation()
  const [updateQuestion] = useUpdateQuestionMutation()
  const [deleteQuestion] = useDeleteQuestionMutation()

  // ── Common fields ──
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  // ── VIDEO specific ──
  const [additionalInfo, setAdditionalInfo] = useState('')

  // ── TEST specific ──
  const [passThreshold, setPassThreshold] = useState('70')
  const [testQuestions, setTestQuestions] = useState<EditQuestionForm[]>([])
  const [originalTestQIds, setOriginalTestQIds] = useState<string[]>([])

  // ── INTERACTIVE specific ──
  const [exercises, setExercises] = useState<EditExerciseForm[]>([])
  const [originalExQIds, setOriginalExQIds] = useState<string[]>([])
  const [isFinalTest, setIsFinalTest] = useState<boolean>(false)

  // ── Init from fetched lesson ──
  useEffect(() => {
    if (!lesson) return
    setTitle(lesson.title)
    setDescription(lesson.description || '')
    setDuration(lesson.duration ? String(Math.floor(lesson.duration / 60)) : '')
    setVideoUrl(lesson.videoUrl || '')

    const parsed = parseContent(lesson.content)

    if (lesson.type === 'VIDEO') {
      setAdditionalInfo(
        typeof parsed.text === 'string'
          ? parsed.text
          : typeof lesson.content === 'string' && !lesson.content.startsWith('{')
            ? lesson.content
            : '',
      )
    }

    if (lesson.type === 'TEST') {
      setPassThreshold(
        typeof parsed.passThreshold === 'number' ? String(parsed.passThreshold) : '70',
      )
      const qs = lesson.questions ? questionsToForm(lesson.questions) : []
      setTestQuestions(qs.length > 0 ? qs : [makeEmptyQuestion()])
      setOriginalTestQIds(
        (lesson.questions || [])
          .filter(q => q.type !== 'FILL_IN_BLANK')
          .map(q => q.id),
      )
      setIsFinalTest(lesson.isFinalTest ?? false)
    }

    if (lesson.type === 'INTERACTIVE') {
      const exs = lesson.questions ? exercisesToForm(lesson.questions) : []
      setExercises(exs.length > 0 ? exs : [makeEmptyExercise()])
      setOriginalExQIds(
        (lesson.questions || [])
          .filter(q => q.type === 'FILL_IN_BLANK')
          .map(q => q.id),
      )
    }
  }, [lesson])

  // ── Test question helpers ──
  function makeEmptyQuestion(): EditQuestionForm {
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
  const addQ = () => setTestQuestions(q => [...q, makeEmptyQuestion()])
  const removeQ = (qId: string) => setTestQuestions(q => q.filter(x => x.id !== qId))
  const patchQ = (qId: string, patch: Partial<EditQuestionForm>) =>
    setTestQuestions(q => q.map(x => (x.id === qId ? { ...x, ...patch } : x)))
  const addOpt = (qId: string) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId
          ? {
              ...x,
              options: [...x.options, { id: uid(), text: '', isCorrect: false }],
            }
          : x,
      ),
    )
  const removeOpt = (qId: string, oId: string) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId
          ? { ...x, options: x.options.filter(o => o.id !== oId) }
          : x,
      ),
    )
  const patchOpt = (
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

  // ── Exercise helpers ──
  function makeEmptyExercise(): EditExerciseForm {
    return { id: uid(), sentence: '', answer: '' }
  }
  const addEx = () => setExercises(e => [...e, makeEmptyExercise()])
  const removeEx = (id: string) => setExercises(e => e.filter(x => x.id !== id))
  const patchEx = (id: string, patch: Partial<EditExerciseForm>) =>
    setExercises(e => e.map(x => (x.id === id ? { ...x, ...patch } : x)))

  // ── Save ──
  const handleSave = async () => {
    if (!lesson) return
    if (!title.trim()) {
      onError('Введите название урока')
      return
    }

    let content: string | undefined
    if (lesson.type === 'VIDEO') {
      content = additionalInfo.trim()
        ? JSON.stringify({ text: additionalInfo.trim() })
        : undefined
    } else if (lesson.type === 'TEST') {
      if (!passThreshold || Number.isNaN(Number(passThreshold))) {
        onError('Укажите порог прохождения')
        return
      }
      for (const q of testQuestions) {
        if (!q.text.trim()) {
          onError('Заполните текст всех вопросов')
          return
        }
        if (q.options.some(o => !o.text.trim())) {
          onError('Заполните все варианты ответов')
          return
        }
        if (!q.options.some(o => o.isCorrect)) {
          onError('Отметьте хотя бы один правильный ответ в каждом вопросе')
          return
        }
      }
      content = JSON.stringify({ passThreshold: Number(passThreshold) })
    } else if (lesson.type === 'INTERACTIVE') {
      for (const ex of exercises) {
        if (!ex.sentence.trim()) {
          onError('Заполните текст всех упражнений')
          return
        }
        if (!ex.answer.trim()) {
          onError('Укажите правильный ответ для каждого упражнения')
          return
        }
        if (!ex.sentence.includes('___')) {
          onError(`Упражнение "${ex.sentence.slice(0, 20)}..." не содержит пропуск ___`)
          return
        }
      }
    }

    try {
      await updateLesson({
        id: lesson.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          duration: duration ? Number(duration) * 60 : undefined,
          videoUrl: videoUrl.trim() || undefined,
          content,
          ...(lesson.type === 'TEST' ? { isFinalTest } : { isFinalTest: false }),
        },
      }).unwrap()

      // ── Sync questions (TEST) ──
      if (lesson.type === 'TEST') {
        const currentIds = testQuestions.filter(q => !isNew(q.id)).map(q => q.id)
        // Delete removed
        const toDelete = originalTestQIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
          await deleteQuestion(id).unwrap()
        }
        // Upsert existing & new
        for (let i = 0; i < testQuestions.length; i++) {
          const q = testQuestions[i]
          const payload: CreateQuestionDto = {
            lessonId: lesson.id,
            type: (q.isMultiple ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE') as QuestionType,
            order: i + 1,
            question: q.text.trim(),
            options: q.options.map(o => ({
              id: o.id || '',
              text: o.text.trim(),
              isCorrect: o.isCorrect,
            })),
            points: 1,
          }
          if (isNew(q.id)) {
            await createQuestion(payload).unwrap()
          } else {
            const updatePayload: UpdateQuestionDto = {
              type: payload.type,
              order: payload.order,
              question: payload.question,
              options: payload.options,
              points: payload.points,
            }
            await updateQuestion({ id: q.id, data: updatePayload }).unwrap()
          }
        }
      }

      // ── Sync exercises (INTERACTIVE) ──
      if (lesson.type === 'INTERACTIVE') {
        const currentIds = exercises.filter(ex => !isNew(ex.id)).map(ex => ex.id)
        const toDelete = originalExQIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
          await deleteQuestion(id).unwrap()
        }
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i]
          const payload: CreateQuestionDto = {
            lessonId: lesson.id,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: ex.sentence.trim(),
            options: [{ id: '1', text: ex.answer.trim(), isCorrect: true }],
            explanation: undefined,
            points: 1,
          }
          if (isNew(ex.id)) {
            await createQuestion(payload).unwrap()
          } else {
            const updatePayload: UpdateQuestionDto = {
              type: payload.type,
              order: payload.order,
              question: payload.question,
              options: payload.options,
              explanation: payload.explanation,
              points: payload.points,
            }
            await updateQuestion({ id: ex.id, data: updatePayload }).unwrap()
          }
        }
      }

      onSuccess('Урок обновлён!')
    } catch (e) {
      const err = e as { data?: { message?: string; code?: string } }
      if (err?.data?.code === 'FINAL_TEST_ALREADY_EXISTS') {
        onError(
          'Финальный тест для этого курса уже создан. Отредактируйте существующий финальный тест или снимите с него этот статус.'
        )
        return
      }
      onError(err?.data?.message || 'Не удалось сохранить урок')
    }
  }

  if (isLoading || !lesson) {
    return (
      <div className="glass-card flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Редактирование урока</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Название урока *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название урока"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[72px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Длительность (мин)</label>
            <Input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="15"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Видео</label>
            <VideoUpload value={videoUrl} onChange={setVideoUrl} label="Видео урока" />
          </div>
        </div>

        {lesson.type === 'VIDEO' && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Video className="h-4 w-4" />
              <span>Дополнительные материалы</span>
            </div>
            <textarea
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              placeholder="Полезные ссылки, заметки, описание урока..."
              className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {lesson.type === 'TEST' && (
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
                <span>Финальный тест курса</span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Порог прохождения (%) *</label>
                <Input
                  type="number"
                  value={passThreshold}
                  onChange={e => setPassThreshold(e.target.value)}
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Вопросы ({testQuestions.length})</h4>
                <Button variant="outline" size="sm" onClick={addQ} type="button">
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
                          onChange={e => patchQ(q.id, { text: e.target.value })}
                          className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeQ(q.id)}
                        type="button"
                        className="mt-2 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={q.isMultiple}
                          onChange={e => patchQ(q.id, { isMultiple: e.target.checked })}
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
                                q.options.forEach(o =>
                                  patchOpt(q.id, o.id, { isCorrect: false }),
                                )
                              }
                              patchOpt(q.id, opt.id, { isCorrect: e.target.checked })
                            }}
                            className="h-4 w-4 shrink-0 text-primary"
                            name={`q-${q.id}`}
                          />
                          <Input
                            value={opt.text}
                            onChange={e =>
                              patchOpt(q.id, opt.id, { text: e.target.value })
                            }
                            className="flex-1 text-sm"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOpt(q.id, opt.id)}
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
                        onClick={() => addOpt(q.id)}
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

        {lesson.type === 'INTERACTIVE' && (
          <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                <MessageSquare className="h-4 w-4" />
                <span>Интерактивные упражнения ({exercises.length})</span>
              </div>
              <Button variant="outline" size="sm" type="button" onClick={addEx}>
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
                          onChange={e => patchEx(ex.id, { sentence: e.target.value })}
                          placeholder="I ___ to school every day."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Правильный ответ *
                        </label>
                        <Input
                          value={ex.answer}
                          onChange={e => patchEx(ex.id, { answer: e.target.value })}
                          placeholder="go"
                        />
                      </div>
                    </div>
                    {exercises.length > 1 && (
                      <button
                        onClick={() => removeEx(ex.id)}
                        type="button"
                        className="mt-2 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Изменения сразу сохраняются для всех студентов курса.</span>
        </div>
      </div>
    </div>
  )
}

