import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('platform', { keyPrefix: 'admin.faq' })
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
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('forbidden')}</h1>
          <p className="text-muted-foreground mb-6">{t('forbiddenBody')}</p>
          <button type="button" className="btn" onClick={() => navigate('/faq')}>
            {t('toFaq')}
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
              setErrorModal(t('fillRequired'))
              return
            }

            try {
              await createFAQ(formData).unwrap()
              resetForm()
              setSuccessModal(t('created'))
            } catch {
              setErrorModal(t('createError'))
            }
          }}
        />

        {isLoading ? (
          <div className="rounded-2xl glass-card p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">{t('loading')}</p>
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
                    setSuccessModal(t('updated'))
                  } catch {
                    setErrorModal(t('updateError'))
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
            setSuccessModal(t('deleted'))
          } catch {
            setErrorModal(t('deleteError'))
          }
          setDeleteModal(null)
        }}
        title={t('deleteTitle')}
        message={t('deleteMsg')}
        confirmText={t('deleteConfirm')}
        cancelText={t('cancel')}
        variant="danger"
      />

      <AlertModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={t('modalError')}
        message={errorModal || ''}
        variant="error"
      />

      <AlertModal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title={t('modalOk')}
        message={successModal || ''}
        variant="success"
      />
    </div>
  )
}
