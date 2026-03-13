import { useState } from 'react'
import { Clock, Video, ClipboardCheck, MessageSquare, Save, X, BookOpen, MessageCircle } from 'lucide-react'
import {
  useCreateLessonMutation,
  useCreateQuestionMutation,
} from '@/entities/lesson'
import type { CreateLessonDto, LessonType, Attachment } from '@/shared/types/course'
import { Button, Input } from '@/shared/ui'
import { NewVideoSection } from './components/NewVideoSection'
import { NewTestSection } from './components/NewTestSection'
import { NewInteractiveSection } from './components/NewInteractiveSection'
import { NewLexicalSection } from './components/NewLexicalSection'
import { NewDialogueSection } from './components/NewDialogueSection'

type FormLessonType = 'VIDEO' | 'TEST' | 'INTERACTIVE' | 'LEXICAL' | 'DIALOGUE'

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

interface DialogueStepForm {
  id: string
  prompt: string
  options: { id: string; text: string; isCorrect: boolean }[]
}

const lessonTypes: { value: FormLessonType; label: string; icon: typeof Video; description: string }[] = [
  { value: 'VIDEO', label: 'Видео-урок', icon: Video, description: 'Видео + дополнительные материалы' },
  { value: 'TEST', label: 'Тест', icon: ClipboardCheck, description: 'Вопросы с вариантами ответов' },
  { value: 'INTERACTIVE', label: 'Интерактив', icon: MessageSquare, description: 'Заполни пропуск / допиши предложение' },
  { value: 'LEXICAL', label: 'Лексический тренажёр', icon: BookOpen, description: 'Тренировка лексики и перевода' },
  { value: 'DIALOGUE', label: 'Диалоговый урок', icon: MessageCircle, description: 'Диалог с выбором реплик' },
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

function makeEmptyDialogueStep(): DialogueStepForm {
  return {
    id: uid(),
    prompt: '',
    options: [
      { id: uid(), text: '', isCorrect: true },
      { id: uid(), text: '', isCorrect: false },
    ],
  }
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

  const [lessonType, setLessonType] = useState<FormLessonType>('VIDEO')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [passThreshold, setPassThreshold] = useState('70')
  const [testTimeLimit, setTestTimeLimit] = useState('')
  const [testShuffleQuestions, setTestShuffleQuestions] = useState(false)
  const [testShuffleOptions, setTestShuffleOptions] = useState(false)
  const [testQuestions, setTestQuestions] = useState<TestQuestionForm[]>([makeEmptyQuestion()])
  const [isFinalTest, setIsFinalTest] = useState(false)
  const [exercises, setExercises] = useState<FillBlankForm[]>([makeEmptyExercise()])
  const [lexicalItems, setLexicalItems] = useState<LexicalItemForm[]>([makeEmptyLexicalItem()])
  const [dialogueSteps, setDialogueSteps] = useState<DialogueStepForm[]>([makeEmptyDialogueStep()])

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
    setDialogueSteps([makeEmptyDialogueStep()])
    setLessonType('VIDEO')
  }

  // ── Test handlers ──
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
      q.map(x => (x.id === qId ? { ...x, options: x.options.filter(o => o.id !== oId) } : x)),
    )
  const updateOption = (qId: string, oId: string, patch: Partial<{ text: string; isCorrect: boolean }>) =>
    setTestQuestions(q =>
      q.map(x =>
        x.id === qId
          ? { ...x, options: x.options.map(o => (o.id === oId ? { ...o, ...patch } : o)) }
          : x,
      ),
    )

  // ── Interactive handlers ──
  const addExercise = () => setExercises(e => [...e, makeEmptyExercise()])
  const removeExercise = (eId: string) => setExercises(e => e.filter(x => x.id !== eId))
  const updateExercise = (eId: string, patch: Partial<FillBlankForm>) =>
    setExercises(e => e.map(x => (x.id === eId ? { ...x, ...patch } : x)))

  // ── Dialogue handlers ──
  const addDialogueStep = () => setDialogueSteps(s => [...s, makeEmptyDialogueStep()])
  const removeDialogueStep = (id: string) => setDialogueSteps(s => s.filter(x => x.id !== id))
  const patchDialogueStep = (id: string, patch: Partial<DialogueStepForm>) =>
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
  const patchDialogueOption = (stepId: string, optId: string, patch: Partial<{ text: string; isCorrect: boolean }>) =>
    setDialogueSteps(s =>
      s.map(x =>
        x.id === stepId
          ? { ...x, options: x.options.map(o => (o.id === optId ? { ...o, ...patch } : o)) }
          : x,
      ),
    )

  const handleSubmit = async () => {
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
        if (!q.options.some(o => o.text.trim())) {
          onError('Добавьте варианты ответов для всех вопросов')
          return
        }
        if (!q.options.some(o => o.isCorrect)) {
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
        if (!item.translations.split(',').some(t => t.trim().length > 0)) {
          onError(`Укажите хотя бы один перевод для "${item.term}"`)
          return
        }
      }
    }
    if (lessonType === 'DIALOGUE') {
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
        if (!step.options.some(o => o.text.trim()) || !step.options.some(o => o.isCorrect && o.text.trim())) {
          onError('В каждом шаге диалога должен быть хотя бы один непустой правильный вариант')
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

      if (lessonType === 'LEXICAL') {
        for (let i = 0; i < lexicalItems.length; i++) {
          const item = lexicalItems[i]
          const translations = item.translations.split(',').map(s => s.trim()).filter(Boolean)
          const options =
            translations.length > 0
              ? translations.map((text, ti) => ({ id: `${i}-${ti}`, text, isCorrect: true }))
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

      if (lessonType === 'DIALOGUE') {
        for (let i = 0; i < dialogueSteps.length; i++) {
          const step = dialogueSteps[i]
          const filledOptions = step.options
            .filter(o => o.text.trim())
            .map(o => ({ ...o, text: o.text.trim() }))
          await createQuestion({
            lessonId,
            type: 'SINGLE_CHOICE',
            order: i + 1,
            question: step.prompt.trim(),
            options: filledOptions,
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
          'Финальный тест для этого курса уже создан. Отредактируйте существующий финальный тест или снимите с него этот статус.',
        )
        return
      }
      onError(err?.data?.message || 'Не удалось создать урок')
    }
  }

  return (
    <div className="glass-card rounded-md p-6">
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

      <div className="space-y-4">
        {/* Common fields */}
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
              className="min-h-[72px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
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

        {/* Type-specific sections */}
        {lessonType === 'VIDEO' && (
          <NewVideoSection
            videoUrl={videoUrl}
            additionalInfo={additionalInfo}
            attachments={attachments}
            onVideoChange={setVideoUrl}
            onInfoChange={setAdditionalInfo}
            onAddAttachment={() => setAttachments(a => [...a, { name: '', url: '', size: 0 }])}
            onUpdateAttachment={(idx, upd) =>
              setAttachments(a => a.map((x, i) => (i === idx ? { ...x, ...upd } : x)))
            }
            onRemoveAttachment={idx => setAttachments(a => a.filter((_, i) => i !== idx))}
            onUploadError={onError}
          />
        )}

        {lessonType === 'TEST' && (
          <NewTestSection
            videoUrl={videoUrl}
            passThreshold={passThreshold}
            testTimeLimit={testTimeLimit}
            testShuffleQuestions={testShuffleQuestions}
            testShuffleOptions={testShuffleOptions}
            isFinalTest={isFinalTest}
            questions={testQuestions}
            onVideoChange={setVideoUrl}
            onThresholdChange={setPassThreshold}
            onTimeLimitChange={setTestTimeLimit}
            onShuffleQuestionsChange={setTestShuffleQuestions}
            onShuffleOptionsChange={setTestShuffleOptions}
            onFinalTestChange={setIsFinalTest}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
            onUpdateQuestion={updateQuestion}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onUpdateOption={updateOption}
          />
        )}

        {lessonType === 'INTERACTIVE' && (
          <NewInteractiveSection
            videoUrl={videoUrl}
            exercises={exercises}
            onVideoChange={setVideoUrl}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onUpdateExercise={updateExercise}
          />
        )}

        {lessonType === 'LEXICAL' && (
          <NewLexicalSection
            videoUrl={videoUrl}
            items={lexicalItems}
            onVideoChange={setVideoUrl}
            onAddItem={() => setLexicalItems(items => [...items, makeEmptyLexicalItem()])}
            onUpdateItem={(id, patch) =>
              setLexicalItems(items => items.map(x => (x.id === id ? { ...x, ...patch } : x)))
            }
            onRemoveItem={id => setLexicalItems(items => items.filter(x => x.id !== id))}
          />
        )}

        {lessonType === 'DIALOGUE' && (
          <NewDialogueSection
            videoUrl={videoUrl}
            steps={dialogueSteps}
            onVideoChange={setVideoUrl}
            onAddStep={addDialogueStep}
            onRemoveStep={removeDialogueStep}
            onPatchStep={patchDialogueStep}
            onAddOption={addDialogueOption}
            onRemoveOption={removeDialogueOption}
            onPatchOption={patchDialogueOption}
          />
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
