import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import {
  useGetPlacementQuestionsQuery,
  useCreatePlacementQuestionMutation,
  useUpdatePlacementQuestionMutation,
  useDeletePlacementQuestionMutation,
} from '@/entities/placement'
import type { PlacementQuestionType } from '@/shared/types/placement'
import { Button, ConfirmModal, AlertModal } from '@/shared/ui'
import { AlertCircle, BookOpen } from 'lucide-react'
import {
  PlacementQuestionForm,
  PlacementQuestionsList,
  emptyQuestionForm,
  type QuestionFormState,
  type ErrorFormState,
  type AdminPlacementQuestion,
} from '@/features/admin/placement'

export const AdminPlacementPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const PAGE_SIZE = 6

  const [page, setPage] = useState(1)
  const [languageFilter, setLanguageFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<PlacementQuestionType | 'ALL'>('ALL')

  const { data, isLoading } = useGetPlacementQuestionsQuery({
    page,
    limit: PAGE_SIZE,
    language: languageFilter || undefined,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
  })

  const [createQuestion] = useCreatePlacementQuestionMutation()
  const [updateQuestion] = useUpdatePlacementQuestionMutation()
  const [deleteQuestion] = useDeletePlacementQuestionMutation()

  const [form, setForm] = useState<QuestionFormState>(emptyQuestionForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ErrorFormState>({})

  const items: AdminPlacementQuestion[] =
    (data?.data.items as AdminPlacementQuestion[] | undefined) ?? []
  const pagination = data?.data.pagination

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center rounded-2xl glass-card p-8 backdrop-blur-xl">
        <div className="glass-card p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Доступ запрещён</h2>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    )
  }

  const handleChangeOption = (index: number, value: string) => {
    setForm(prev => {
      const next = [...prev.options]
      next[index] = value
      return { ...prev, options: next }
    })
  }

  const handleAddOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }))
  }

  const handleRemoveOption = (index: number) => {
    setForm(prev => {
      const next = prev.options.filter((_, i) => i !== index)
      const nextCorrect =
        prev.correctOptionIndex >= next.length ? Math.max(0, next.length - 1) : prev.correctOptionIndex
      return {
        ...prev,
        options: next,
        correctOptionIndex: nextCorrect,
      }
    })
  }

  const resetForm = () => {
    setForm(emptyQuestionForm)
    setEditingId(null)
    setFieldErrors({})
  }

  const handleEdit = (id: string) => {
    const q = items.find(item => item.id === id)
    if (!q) return
    setEditingId(id)
    setFieldErrors({})
    setForm({
      id: q.id,
      language: q.language,
      type: q.type,
      difficulty: q.difficulty,
      prompt: q.prompt,
      context: q.context || '',
      mediaUrl: q.mediaUrl || '',
      options: [...q.options],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      explanation: q.explanation || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const errors: typeof fieldErrors = {}

    if (!form.language.trim()) {
      errors.language = 'Укажите язык для этого вопроса'
    }

    if (!form.prompt.trim() || form.prompt.trim().length < 10) {
      errors.prompt = 'Текст вопроса должен быть не короче 10 символов'
    }

    if (!Number.isFinite(form.difficulty) || form.difficulty < 1 || form.difficulty > 6) {
      errors.difficulty = 'Сложность должна быть числом от 1 до 6'
    }

    const filledOptions = form.options.filter(o => o.trim())
    if (filledOptions.length < 2) {
      errors.options = 'Добавьте как минимум два непустых варианта ответа'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      if (editingId && form.id) {
        await updateQuestion({
          id: form.id,
          language: form.language.trim(),
          type: form.type,
          difficulty: form.difficulty,
          prompt: form.prompt.trim(),
          context: form.context.trim() || undefined,
          mediaUrl: form.mediaUrl.trim() || undefined,
          options: form.options.map(o => o.trim()),
          correctOptionIndex: form.correctOptionIndex,
          explanation: form.explanation.trim() || undefined,
        }).unwrap()
        setSuccessModal('Вопрос обновлён')
      } else {
        await createQuestion({
          language: form.language.trim(),
          type: form.type,
          difficulty: form.difficulty,
          prompt: form.prompt.trim(),
          context: form.context.trim() || undefined,
          mediaUrl: form.mediaUrl.trim() || undefined,
          options: form.options.map(o => o.trim()),
          correctOptionIndex: form.correctOptionIndex,
          explanation: form.explanation.trim() || undefined,
        }).unwrap()
        setSuccessModal('Вопрос создан')
      }
      resetForm()
    } catch (err) {
      const e = err as { data?: { error?: { message?: string } } }
      setErrorModal(e?.data?.error?.message || 'Ошибка при сохранении вопроса')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      await deleteQuestion(deleteId).unwrap()
      setSuccessModal('Вопрос удалён')
    } catch {
      setErrorModal('Ошибка при удалении вопроса')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                Placement-тест: вопросы
              </h1>
              <p className="text-sm text-muted-foreground">
                Управление банком вопросов для определения уровня студентов
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            Назад в админку
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
          <PlacementQuestionForm
            form={form}
            errors={fieldErrors}
            editingId={editingId}
            onChangeLanguage={value => setForm(prev => ({ ...prev, language: value }))}
            onChangeType={value => setForm(prev => ({ ...prev, type: value }))}
            onChangeDifficulty={value =>
              setForm(prev => ({
                ...prev,
                difficulty: value,
              }))
            }
            onChangePrompt={value => setForm(prev => ({ ...prev, prompt: value }))}
            onChangeContext={value => setForm(prev => ({ ...prev, context: value }))}
            onChangeMediaUrl={url => setForm(prev => ({ ...prev, mediaUrl: url }))}
            onChangeExplanation={value =>
              setForm(prev => ({ ...prev, explanation: value }))
            }
            onChangeOption={handleChangeOption}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onChangeCorrectIndex={index =>
              setForm(prev => ({ ...prev, correctOptionIndex: index }))
            }
            onSubmit={handleSubmit}
            onReset={resetForm}
          />

          <PlacementQuestionsList
            items={items}
            isLoading={isLoading}
            page={page}
            languageFilter={languageFilter}
            typeFilter={typeFilter}
            pagination={pagination}
            onLanguageFilterChange={value => setLanguageFilter(value)}
            onTypeFilterChange={value => setTypeFilter(value)}
            onPageChange={value => setPage(value)}
            onEdit={handleEdit}
            onDelete={id => setDeleteId(id)}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить вопрос?"
        message="Это действие необратимо. Вопрос будет удалён из банка placement-теста."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />

      <AlertModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="Ошибка"
        message={errorModal || ''}
        variant="error"
      />

      <AlertModal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="Успешно"
        message={successModal || ''}
        variant="success"
      />
    </div>
  )
}

