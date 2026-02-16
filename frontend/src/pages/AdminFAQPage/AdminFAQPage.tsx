import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import {
  useGetAllFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from '@/entities/faq'
import { Button, Input } from '@/shared/ui'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface FAQFormData {
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

export const AdminFAQPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data, isLoading } = useGetAllFAQsQuery({ includeInactive: true })
  const [createFAQ] = useCreateFAQMutation()
  const [updateFAQ] = useUpdateFAQMutation()
  const [deleteFAQ] = useDeleteFAQMutation()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
    category: '',
    order: 0,
    isActive: true,
  })

  // Проверка прав доступа
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center rounded-2xl glass-card p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Доступ запрещён
          </h1>
          <p className="text-muted-foreground mb-6">
            Только администраторы могут управлять FAQ
          </p>
          <Button onClick={() => navigate('/faq')}>Перейти к FAQ</Button>
        </div>
      </div>
    )
  }

  const handleCreate = async () => {
    if (!formData.question || !formData.answer || !formData.category) {
      alert('Заполните все обязательные поля')
      return
    }

    try {
      await createFAQ(formData).unwrap()
      setShowCreateForm(false)
      setFormData({
        question: '',
        answer: '',
        category: '',
        order: 0,
        isActive: true,
      })
    } catch (error) {
      console.error('Failed to create FAQ:', error)
      alert('Ошибка при создании FAQ')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      await updateFAQ({ id, data: formData }).unwrap()
      setEditingId(null)
      setFormData({
        question: '',
        answer: '',
        category: '',
        order: 0,
        isActive: true,
      })
    } catch (error) {
      console.error('Failed to update FAQ:', error)
      alert('Ошибка при обновлении FAQ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись FAQ?')) {
      return
    }

    try {
      await deleteFAQ(id).unwrap()
    } catch (error) {
      console.error('Failed to delete FAQ:', error)
      alert('Ошибка при удалении FAQ')
    }
  }

  const startEditing = (item: {
    id: string
    question: string
    answer: string
    category: string
    order: number
    isActive: boolean
  }) => {
    setEditingId(item.id)
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
      isActive: item.isActive,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setShowCreateForm(false)
    setFormData({
      question: '',
      answer: '',
      category: '',
      order: 0,
      isActive: true,
    })
  }

  const faqItems = data?.data?.items || []
  const categories = Array.from(new Set(faqItems.map(item => item.category)))

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">
              Управление FAQ
            </h1>
            <p className="text-muted-foreground mt-2">
              Администрирование вопросов и ответов
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить FAQ
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8 rounded-2xl glass-card p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              Новый FAQ
            </h3>
            <div className="space-y-4">
              <Input
                label="Категория"
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Общие вопросы"
              />
              <Input
                label="Вопрос"
                value={formData.question}
                onChange={e =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Как...?"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Ответ
                </label>
                <textarea
                  value={formData.answer}
                  onChange={e =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ответ на вопрос..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Порядок"
                  type="number"
                  value={formData.order}
                  onChange={e =>
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                />
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="isActive" className="text-sm text-foreground">
                    Активен
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate}>
                  <Save className="mr-2 h-4 w-4" />
                  Создать
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="mr-2 h-4 w-4" />
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl glass-card p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Загрузка FAQ...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category} className="rounded-2xl glass-card p-6 backdrop-blur-xl">
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  {category}
                </h2>
                <div className="space-y-3">
                  {faqItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <div
                        key={item.id}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          editingId === item.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background/50'
                        } ${!item.isActive ? 'opacity-50' : ''}`}
                      >
                        {editingId === item.id ? (
                          <div className="space-y-4">
                            <Input
                              label="Вопрос"
                              value={formData.question}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  question: e.target.value,
                                })
                              }
                            />
                            <div>
                              <label className="mb-2 block text-sm font-medium text-foreground">
                                Ответ
                              </label>
                              <textarea
                                value={formData.answer}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    answer: e.target.value,
                                  })
                                }
                                rows={4}
                                className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Порядок"
                                type="number"
                                value={formData.order}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    order: Number(e.target.value),
                                  })
                                }
                              />
                              <div className="flex items-center gap-2 pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.isActive}
                                  onChange={e =>
                                    setFormData({
                                      ...formData,
                                      isActive: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-input"
                                />
                                <label className="text-sm text-foreground">
                                  Активен
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(item.id)}
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-2 flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {item.question}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.answer}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(item)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(item.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Порядок: {item.order}</span>
                              <span>
                                Статус:{' '}
                                {item.isActive ? 'Активен' : 'Неактивен'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
