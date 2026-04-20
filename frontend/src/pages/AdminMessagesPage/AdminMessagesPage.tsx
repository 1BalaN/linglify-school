import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { Button, ConfirmModal, AlertModal } from '@/shared/ui'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { ContactMessage } from '@/shared/types/contact'
import { MessageDetails, MessagesFilters, MessagesList, MessagesStats, useAdminMessages } from '@/features/admin/messages'

export const AdminMessagesPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'admin.messages' })
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)


  const {
    isLoading,
    filteredMessages,
    stats,
    filter,
    setFilter,
    selectedMessage,
    setSelectedMessage,
    noteText,
    setNoteText,
    markAsRead,
    markAsReplied,
    updateNote,
    deleteMessage,
  } = useAdminMessages()

  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<string | null>(null)

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center rounded-2xl glass-card p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('forbidden')}</h1>
          <p className="text-muted-foreground mb-6">{t('forbiddenBody')}</p>
          <Button onClick={() => navigate('/')}>{t('home')}</Button>
        </div>
      </div>
    )
  }

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setNoteText(message.adminNote || '')

    if (!message.isRead) {
      markAsRead(message.id).unwrap().catch(console.error)
    }
  }

  const handleSaveNote = () => {
    if (!selectedMessage) return

    updateNote({
      id: selectedMessage.id,
      adminNote: noteText,
    })
      .unwrap()
      .then(() => setSuccessModal(t('noteSaved')))
      .catch(() => setErrorModal(t('noteError')))
  }

  const handleMarkReplied = () => {
    if (!selectedMessage) return

    markAsReplied({
      id: selectedMessage.id,
      adminNote: noteText,
    })
      .unwrap()
      .then(() => {
        setSelectedMessage(null)
        setSuccessModal(t('answered'))
      })
      .catch(() => setErrorModal(t('answerError')))
  }

  const handleDelete = () => {
    if (!deleteModal) return

    deleteMessage(deleteModal)
      .unwrap()
      .then(() => {
        if (selectedMessage?.id === deleteModal) {
          setSelectedMessage(null)
        }
        setSuccessModal(t('deleted'))
      })
      .catch(() => setErrorModal(t('deleteError')))
      .finally(() => setDeleteModal(null))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <MessagesStats {...stats} />

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl glass-card p-4 backdrop-blur-xl">
              <MessagesFilters value={filter} onChange={setFilter} />

              <MessagesList
                messages={filteredMessages}
                selectedId={selectedMessage?.id}
                isLoading={isLoading}
                onSelect={handleSelectMessage}
              />
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <MessageDetails
                message={selectedMessage}
                noteText={noteText}
                onNoteChange={setNoteText}
                onSaveNote={handleSaveNote}
                onMarkReplied={handleMarkReplied}
                onDelete={() => setDeleteModal(selectedMessage.id)}
                onClose={() => setSelectedMessage(null)}
              />
            ) : (
              <div className="rounded-2xl glass-card p-12 backdrop-blur-xl text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('pick')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
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
