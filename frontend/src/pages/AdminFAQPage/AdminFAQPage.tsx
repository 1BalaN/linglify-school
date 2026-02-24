import { useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import {
  useGetAllFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from '@/entities/faq'
import { ConfirmModal, AlertModal } from '@/shared/ui'
import { useNavigate } from 'react-router-dom'
import { FAQCategorySection, FAQCreateForm } from '@/features/admin/faq'

export interface FAQFormData {
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

const initialState: FAQFormData = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  isActive: true,
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
  const [formData, setFormData] = useState<FAQFormData>(initialState)

  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const items = data?.data?.items ?? []
  
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {})
  }, [data?.data?.items])

  const resetForm = useCallback(() => {
    setFormData(initialState)
    setEditingId(null)
    setShowCreateForm(false)
  }, [])

  const handleFieldChange = useCallback(
    <K extends keyof FAQFormData>(field: K, value: FAQFormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    },
    []
  )

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
          <button
            className="btn"
            onClick={() => navigate('/faq')}
          >
            Перейти к FAQ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <FAQCreateForm
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          formData={formData}
          onChange={handleFieldChange}
          onCancel={resetForm}
          onCreate={async () => {
            if (!formData.question || !formData.answer || !formData.category) {
              setErrorModal('Заполните все обязательные поля')
              return
            }

            try {
              await createFAQ(formData).unwrap()
              resetForm()
              setSuccessModal('FAQ успешно создан')
            } catch {
              setErrorModal('Ошибка при создании FAQ')
            }
          }}
        />

        {isLoading ? (
          <div className="rounded-2xl glass-card p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Загрузка FAQ...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <FAQCategorySection
                key={category}
                category={category}
                items={items}
                editingId={editingId}
                formData={formData}
                setEditingId={setEditingId}
                setFormData={setFormData}
                onChange={handleFieldChange}
                onDelete={setDeleteModal}
                onUpdate={async (id: string) => {
                  try {
                    await updateFAQ({ id, data: formData }).unwrap()
                    resetForm()
                    setSuccessModal('FAQ успешно обновлён')
                  } catch {
                    setErrorModal('Ошибка при обновлении FAQ')
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={async () => {
          if (!deleteModal) return
          try {
            await deleteFAQ(deleteModal).unwrap()
            setSuccessModal('FAQ успешно удалён')
          } catch {
            setErrorModal('Ошибка при удалении FAQ')
          }
          setDeleteModal(null)
        }}
        title="Удалить FAQ?"
        message="Вы уверены, что хотите удалить эту запись FAQ?"
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
