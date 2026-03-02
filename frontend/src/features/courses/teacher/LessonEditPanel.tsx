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
  Attachment,
} from '@/shared/types/course'
import { VideoUpload, Button, Input } from '@/shared/ui'
import { AttachmentRow } from '@/features/courses/teacher/components/AttachmentRow'
import {
  Save, X, Plus, Trash2, Video, ClipboardCheck, MessageSquare, Loader2,
  AlertCircle,
} from 'lucide-react'

interface EditQuestionForm {
  id: string
  text: string
  explanation: string
  isMultiple: boolean
  options: { id: string; text: string; isCorrect: boolean }[]
}

interface EditExerciseForm {
  id: string
  sentence: string
  /** Ответы по пропускам: blanks[0] — для первого ___, blanks[1] — для второго и т.д. (в каждом — синонимы через запятую) */
  blanks: string[]
  hint: string
}

interface EditLexicalItemForm {
  id: string
  term: string
  translations: string
}


function uid() { return 'new_' + Math.random().toString(36).slice(2) }
function isNew(id: string) { return id.startsWith('new_') }

function questionsToForm(questions: Question[]): EditQuestionForm[] {
  return questions
    .filter(q => q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE')
    .map(q => ({
      id: q.id,
      text: q.question,
      explanation: q.explanation || '',
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
    .map(q => {
      const options = q.options as { text: string; isCorrect: boolean; blankIndex?: number }[]
      const correct = options.filter(o => o.isCorrect).map(o => ({ text: o.text.trim(), blankIndex: o.blankIndex ?? 0 })).filter(o => o.text)
      const blankCount = Math.max(1, ...correct.map(o => o.blankIndex + 1))
      const blanks: string[] = []
      for (let i = 0; i < blankCount; i++) {
        const texts = correct.filter(o => o.blankIndex === i).map(o => o.text)
        blanks.push(texts.length > 0 ? texts.join(', ') : '')
      }
      if (blanks.length === 0) blanks.push(correct.map(o => o.text).join(', ') || '')
      return {
        id: q.id,
        sentence: q.question,
        blanks,
        hint: q.explanation || '',
      }
    })
}

function lexicalToForm(questions: Question[]): EditLexicalItemForm[] {
  return questions.map(q => {
    const options = (q.options || []) as { text: string; isCorrect: boolean }[]
    const translations = options
      .filter(o => o.isCorrect && o.text?.trim())
      .map(o => o.text.trim())
      .join(', ')
    return {
      id: q.id,
      term: q.question,
      translations,
    }
  })
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
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // ── TEST specific ──
  const [passThreshold, setPassThreshold] = useState('70')
  const [testTimeLimit, setTestTimeLimit] = useState('')
  const [testShuffleQuestions, setTestShuffleQuestions] = useState(false)
  const [testShuffleOptions, setTestShuffleOptions] = useState(false)
  const [testQuestions, setTestQuestions] = useState<EditQuestionForm[]>([])
  const [originalTestQIds, setOriginalTestQIds] = useState<string[]>([])

  // ── INTERACTIVE specific ──
  const [exercises, setExercises] = useState<EditExerciseForm[]>([])
  const [originalExQIds, setOriginalExQIds] = useState<string[]>([])
  const [isFinalTest, setIsFinalTest] = useState<boolean>(false)
  // ── LEXICAL specific ──
  const [lexicalItems, setLexicalItems] = useState<EditLexicalItemForm[]>([])
  const [originalLexicalQIds, setOriginalLexicalQIds] = useState<string[]>([])

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
      setAttachments(
        Array.isArray(lesson.attachments) && lesson.attachments.length > 0
          ? lesson.attachments.map(a => ({ name: a.name || '', url: a.url || '', size: a.size ?? 0 }))
          : [],
      )
    }

    if (lesson.type === 'TEST') {
      setPassThreshold(
        typeof parsed.passThreshold === 'number' ? String(parsed.passThreshold) : '70',
      )
      setTestTimeLimit(
        typeof parsed.timeLimitMinutes === 'number' && parsed.timeLimitMinutes > 0
          ? String(parsed.timeLimitMinutes)
          : '',
      )
      setTestShuffleQuestions(!!parsed.shuffleQuestions)
      setTestShuffleOptions(!!parsed.shuffleOptions)
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

    if (lesson.type === 'LEXICAL') {
      const items = lesson.questions ? lexicalToForm(lesson.questions) : []
      setLexicalItems(items.length > 0 ? items : [makeEmptyLexicalItem()])
      setOriginalLexicalQIds((lesson.questions || []).map(q => q.id))
    }
  }, [lesson])

  // ── Test question helpers ──
  function makeEmptyQuestion(): EditQuestionForm {
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
    return { id: uid(), sentence: '', blanks: [''], hint: '' }
  }
  const addEx = () => setExercises(e => [...e, makeEmptyExercise()])
  const removeEx = (id: string) => setExercises(e => e.filter(x => x.id !== id))
  const patchEx = (id: string, patch: Partial<EditExerciseForm>) =>
    setExercises(e => e.map(x => (x.id === id ? { ...x, ...patch } : x)))

  // ── Lexical helpers ──
  function makeEmptyLexicalItem(): EditLexicalItemForm {
    return { id: uid(), term: '', translations: '' }
  }
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
      content = JSON.stringify({
        passThreshold: Number(passThreshold),
        ...(testTimeLimit && !Number.isNaN(Number(testTimeLimit)) && Number(testTimeLimit) > 0
          ? { timeLimitMinutes: Number(testTimeLimit) }
          : {}),
        shuffleQuestions: testShuffleQuestions,
        shuffleOptions: testShuffleOptions,
      })
    } else if (lesson.type === 'INTERACTIVE') {
      for (const ex of exercises) {
        if (!ex.sentence.trim()) {
          onError('Заполните текст всех упражнений')
          return
        }
        if (!ex.sentence.includes('___')) {
          onError(`Упражнение "${ex.sentence.slice(0, 20)}..." не содержит пропуск ___`)
          return
        }
        const requiredBlanks = (ex.sentence.match(/___/g) || []).length
        const blanks = ex.blanks.slice(0, requiredBlanks)
        for (let i = 0; i < requiredBlanks; i++) {
          const hasAnswer = (blanks[i] || '').split(',').some(s => s.trim())
          if (!hasAnswer) {
            onError(`Укажите ответ для пропуска ${i + 1} в упражнении "${ex.sentence.slice(0, 20)}..."`)
            return
          }
        }
      }
    } else if (lesson.type === 'LEXICAL') {
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

    try {
      await updateLesson({
        id: lesson.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          duration: duration ? Number(duration) * 60 : undefined,
          videoUrl: videoUrl.trim() || undefined,
          content,
          ...(lesson.type === 'VIDEO' ? { attachments: attachments.filter(a => a.name.trim() && a.url.trim()) } : {}),
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
            explanation: q.explanation?.trim() || undefined,
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
              explanation: payload.explanation,
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
          const requiredBlanks = (ex.sentence.match(/___/g) || []).length || 1
          const blanks = ex.blanks.slice(0, requiredBlanks)
          if (blanks.length < requiredBlanks) {
            while (blanks.length < requiredBlanks) blanks.push('')
          }
          const options: { id: string; text: string; isCorrect: boolean; blankIndex?: number }[] = []
          blanks.forEach((b, bi) => {
            const texts = b.split(',').map(s => s.trim()).filter(Boolean)
            texts.forEach((text, ti) => {
              options.push({ id: `${bi}-${ti}`, text, isCorrect: true, blankIndex: bi })
            })
          })
          if (options.length === 0) {
            options.push({ id: '1', text: '', isCorrect: true, blankIndex: 0 })
          }
          const payload: CreateQuestionDto = {
            lessonId: lesson.id,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: ex.sentence.trim(),
            options: options.map(o => ({ id: o.id, text: o.text, isCorrect: o.isCorrect, blankIndex: o.blankIndex })),
            explanation: ex.hint?.trim() || undefined,
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

      // ── Sync lexical items (LEXICAL) ──
      if (lesson.type === 'LEXICAL') {
        const currentIds = lexicalItems.filter(item => !isNew(item.id)).map(item => item.id)
        const toDelete = originalLexicalQIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
          await deleteQuestion(id).unwrap()
        }

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

          const payload: CreateQuestionDto = {
            lessonId: lesson.id,
            type: 'FILL_IN_BLANK',
            order: i + 1,
            question: item.term.trim(),
            options,
            points: 1,
          }

          if (isNew(item.id)) {
            await createQuestion(payload).unwrap()
          } else {
            const updatePayload: UpdateQuestionDto = {
              type: payload.type as QuestionType,
              order: payload.order,
              question: payload.question,
              options: payload.options,
              points: payload.points,
            }
            await updateQuestion({ id: item.id, data: updatePayload }).unwrap()
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
          <>
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
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Методички и файлы</span>
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
              <p className="text-xs text-muted-foreground">
                Загрузите файл с устройства или укажите ссылку. PDF, DOC, DOCX, TXT, ODT — до 25 МБ.
              </p>
              {attachments.map((att, idx) => (
                <AttachmentRow
                  key={idx}
                  attachment={att}
                  onUpdate={upd =>
                    setAttachments(a => a.map((x, i) => (i === idx ? { ...x, ...upd } : x)))
                  }
                  onRemove={() => setAttachments(a => a.filter((_, i) => i !== idx))}
                  onUploadError={onError}
                />
              ))}
            </div>
          </>
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

                    <div className="mb-2">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Объяснение (показывается после ответа)
                      </label>
                      <textarea
                        value={q.explanation}
                        onChange={e => patchQ(q.id, { explanation: e.target.value })}
                        placeholder="Почему этот ответ правильный..."
                        className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
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
              <Button variant="outline" size="sm" type="button" onClick={addQ} className="mt-3 w-full">
                <Plus className="mr-1 h-3 w-3" />
                Добавить вопрос
              </Button>
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
                          Предложение с пропусками ___ *
                        </label>
                        <Input
                          value={ex.sentence}
                          onChange={e => {
                            const newSentence = e.target.value
                            const count = (newSentence.match(/___/g) || []).length || 1
                            const newBlanks = [...ex.blanks]
                            while (newBlanks.length < count) newBlanks.push('')
                            patchEx(ex.id, { sentence: newSentence, blanks: newBlanks.slice(0, count) })
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
                            value={ex.blanks[bi] ?? ''}
                            onChange={e => {
                              const newBlanks = [...(ex.blanks || [])]
                              while (newBlanks.length <= bi) newBlanks.push('')
                              newBlanks[bi] = e.target.value
                              patchEx(ex.id, { blanks: newBlanks })
                            }}
                            placeholder="go, goes"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Подсказка (опционально)
                        </label>
                        <Input
                          value={ex.hint}
                          onChange={e => patchEx(ex.id, { hint: e.target.value })}
                          placeholder="Глагол в форме 1-го лица..."
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
            <Button variant="outline" size="sm" type="button" onClick={addEx} className="mt-3 w-full">
              <Plus className="mr-1 h-3 w-3" />
              Добавить упражнение
            </Button>
          </div>
        )}

        {lesson.type === 'LEXICAL' && (
          <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
                <MessageSquare className="h-4 w-4" />
                <span>Лексический тренажёр ({lexicalItems.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setLexicalItems(items => [...items, makeEmptyLexicalItem()])}
              >
                <Plus className="mr-1 h-3 w-3" />
                Добавить слово
              </Button>
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
                                x.id === item.id
                                  ? { ...x, translations: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="бронь, заказывать, резервировать"
                        />
                      </div>
                      <div>
                        {/* Подсказка убрана по требованиям UX для лексических тренажёров */}
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

