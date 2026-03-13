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
import { TestEditor } from '@/features/courses/teacher/components/TestEditor'
import { InteractiveEditor } from '@/features/courses/teacher/components/InteractiveEditor'
import { LexicalEditor } from '@/features/courses/teacher/components/LexicalEditor'
import { DialogueEditor } from '@/features/courses/teacher/components/DialogueEditor'
import type { EditQuestionForm } from '@/features/courses/teacher/components/TestEditor'
import type { EditExerciseForm } from '@/features/courses/teacher/components/InteractiveEditor'
import type { EditLexicalItemForm } from '@/features/courses/teacher/components/LexicalEditor'
import type { EditDialogueStepForm } from '@/features/courses/teacher/components/DialogueEditor'
import {
  Save, X, Video, Loader2, AlertCircle, Plus,
} from 'lucide-react'


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

function dialogueToForm(questions: Question[]): EditDialogueStepForm[] {
  return questions
    .filter(q => q.type === 'SINGLE_CHOICE')
    .sort((a, b) => a.order - b.order)
    .map(q => {
      const options = (q.options || []) as { id: string; text: string; isCorrect: boolean }[]
      return {
        id: q.id,
        prompt: q.question,
        options: options.map(o => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
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
  // ── DIALOGUE specific ──
  const [dialogueSteps, setDialogueSteps] = useState<EditDialogueStepForm[]>([])
  const [originalDialogueQIds, setOriginalDialogueQIds] = useState<string[]>([])

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

    if (lesson.type === 'DIALOGUE') {
      const steps = lesson.questions ? dialogueToForm(lesson.questions) : []
      setDialogueSteps(steps.length > 0 ? steps : [makeEmptyDialogueStep()])
      setOriginalDialogueQIds((lesson.questions || []).map(q => q.id))
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
  // ── Dialogue helpers ──
  function makeEmptyDialogueStep(): EditDialogueStepForm {
    return {
      id: uid(),
      prompt: '',
      options: [
        { id: uid(), text: '', isCorrect: true },
        { id: uid(), text: '', isCorrect: false },
      ],
    }
  }
  const addDialogueStep = () => setDialogueSteps(s => [...s, makeEmptyDialogueStep()])
  const removeDialogueStep = (id: string) =>
    setDialogueSteps(s => s.filter(x => x.id !== id))
  const patchDialogueStep = (id: string, patch: Partial<EditDialogueStepForm>) =>
    setDialogueSteps(s => s.map(x => (x.id === id ? { ...x, ...patch } : x)))
  const addDialogueOption = (stepId: string) =>
    setDialogueSteps(s =>
      s.map(x =>
        x.id === stepId
          ? { ...x, options: [...x.options, { id: uid(), text: '', isCorrect: false }] }
          : x,
      ),
    )
  const removeDialogueOption = (stepId: string, optId: string) =>
    setDialogueSteps(s =>
      s.map(x =>
        x.id === stepId ? { ...x, options: x.options.filter(o => o.id !== optId) } : x,
      ),
    )
  const patchDialogueOption = (
    stepId: string,
    optId: string,
    patch: Partial<{ text: string; isCorrect: boolean }>,
  ) =>
    setDialogueSteps(s =>
      s.map(x =>
        x.id === stepId
          ? {
              ...x,
              options: x.options.map(o => (o.id === optId ? { ...o, ...patch } : o)),
            }
          : x,
      ),
    )
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
    } else if (lesson.type === 'DIALOGUE') {
      if (dialogueSteps.length === 0) {
        onError('Добавьте хотя бы один шаг диалога')
        return
      }
      for (const step of dialogueSteps) {
        if (!step.prompt.trim()) {
          onError('Заполните текст реплики собеседника для всех шагов')
          return
        }
        if (step.options.length < 2) {
          onError('В каждом шаге диалога должно быть минимум два варианта ответа')
          return
        }
        const hasText = step.options.some(o => o.text.trim())
        const hasCorrect = step.options.some(o => o.isCorrect && o.text.trim())
        if (!hasText || !hasCorrect) {
          onError('В каждом шаге диалога должен быть хотя бы один непустой правильный вариант')
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

      // ── Sync dialogue steps (DIALOGUE) ──
      if (lesson.type === 'DIALOGUE') {
        const currentIds = dialogueSteps.filter(step => !isNew(step.id)).map(step => step.id)
        const toDelete = originalDialogueQIds.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
          await deleteQuestion(id).unwrap()
        }

        for (let i = 0; i < dialogueSteps.length; i++) {
          const step = dialogueSteps[i]
          const options = step.options
            .filter(o => o.text.trim())
            .map(o => ({ ...o, text: o.text.trim() }))

          const payload: CreateQuestionDto = {
            lessonId: lesson.id,
            type: 'SINGLE_CHOICE',
            order: i + 1,
            question: step.prompt.trim(),
            options,
            points: 1,
          }

          if (isNew(step.id)) {
            await createQuestion(payload).unwrap()
          } else {
            const updatePayload: UpdateQuestionDto = {
              type: payload.type as QuestionType,
              order: payload.order,
              question: payload.question,
              options: payload.options,
              points: payload.points,
            }
            await updateQuestion({ id: step.id, data: updatePayload }).unwrap()
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
            <label className="mb-3.5 block text-sm font-medium">Длительность (мин)</label>
            <Input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="15"
            />
          </div>
          <div>
            {/* <label className="mb-1 block text-sm font-medium">Видео</label> */}
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
          <TestEditor
            isFinalTest={isFinalTest}
            onIsFinalTestChange={setIsFinalTest}
            passThreshold={passThreshold}
            onPassThresholdChange={setPassThreshold}
            testTimeLimit={testTimeLimit}
            onTestTimeLimitChange={setTestTimeLimit}
            testShuffleQuestions={testShuffleQuestions}
            onShuffleQuestionsChange={setTestShuffleQuestions}
            testShuffleOptions={testShuffleOptions}
            onShuffleOptionsChange={setTestShuffleOptions}
            questions={testQuestions}
            onAddQuestion={addQ}
            onRemoveQuestion={removeQ}
            onPatchQuestion={patchQ}
            onAddOption={addOpt}
            onRemoveOption={removeOpt}
            onPatchOption={patchOpt}
          />
        )}

        {lesson.type === 'INTERACTIVE' && (
          <InteractiveEditor
            exercises={exercises}
            onAddExercise={addEx}
            onRemoveExercise={removeEx}
            onPatchExercise={patchEx}
          />
        )}

        {lesson.type === 'LEXICAL' && (
          <LexicalEditor
            items={lexicalItems}
            onAddItem={() => setLexicalItems(items => [...items, makeEmptyLexicalItem()])}
            onUpdateItem={(id, patch) =>
              setLexicalItems(items => items.map(x => (x.id === id ? { ...x, ...patch } : x)))
            }
            onRemoveItem={id => setLexicalItems(items => items.filter(x => x.id !== id))}
          />
        )}

        {lesson.type === 'DIALOGUE' && (
          <DialogueEditor
            steps={dialogueSteps}
            onAddStep={addDialogueStep}
            onRemoveStep={removeDialogueStep}
            onPatchStep={patchDialogueStep}
            onAddOption={addDialogueOption}
            onRemoveOption={removeDialogueOption}
            onPatchOption={patchDialogueOption}
          />
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

