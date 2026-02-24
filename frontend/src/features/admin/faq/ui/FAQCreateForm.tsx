import { FAQFormData } from '@/pages/AdminFAQPage/AdminFAQPage'
import { Button, Input } from '@/shared/ui'
import { Plus, Save, X } from 'lucide-react'

type FAQCreateFormProps = {
  showCreateForm: boolean
  setShowCreateForm: (v: boolean) => void
  formData: FAQFormData
  onChange: <K extends keyof FAQFormData>(
    field: K,
    value: FAQFormData[K]
  ) => void
  onCreate: () => void
  onCancel: () => void
}

export const FAQCreateForm = ({
  showCreateForm,
  setShowCreateForm,
  formData,
  onChange,
  onCreate,
  onCancel,
}: FAQCreateFormProps) => {
  return (
    <>
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
              onChange={e => onChange('category', e.target.value)}
            />

            <Input
              label="Вопрос"
              value={formData.question}
              onChange={e => onChange('question', e.target.value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Ответ
              </label>
              <textarea
                value={formData.answer}
                onChange={e => onChange('answer', e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={onCreate}>
                <Save className="mr-2 h-4 w-4" />
                Создать
              </Button>

              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}