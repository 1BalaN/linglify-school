import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/shared/ui'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import { FAQItem } from '@/shared/types/faq'
import { FAQFormData } from '@/pages/AdminFAQPage/AdminFAQPage'

type FAQItemSectionProps = {
  item: FAQItem
  editingId: string | null
  formData: FAQFormData
  setEditingId: (id: string | null) => void
  setFormData: (data: FAQFormData) => void
  onChange: <K extends keyof FAQFormData>(field: K, value: FAQFormData[K]) => void
  onDelete: (id: string) => void
  onUpdate: (id: string) => void
}

export const FAQItemSection = memo(
  ({
    item,
    editingId,
    formData,
    setEditingId,
    setFormData,
    onChange,
    onDelete,
    onUpdate,
  }: FAQItemSectionProps) => {
    const { t: tUi } = useTranslation('platform', { keyPrefix: 'admin.faqUi' })
    const { t: c } = useTranslation('platform', { keyPrefix: 'commonLabels' })
    const isEditing = editingId === item.id

    return (
      <div
        className={`rounded-xl border-2 p-4 transition-all ${
          isEditing ? 'border-primary bg-primary/5' : 'border-border bg-background/50'
        } ${!item.isActive ? 'opacity-50' : ''}`}
      >
        {isEditing ? (
          <>
            <div className="space-y-4">
              <Input value={formData.question} onChange={e => onChange('question', e.target.value)} />

              <textarea
                value={formData.answer}
                onChange={e => onChange('answer', e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-foreground transition-all duration-300"
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={() => onUpdate(item.id)}>
                  <Save className="mr-2 h-4 w-4" />
                  {c('save')}
                </Button>

                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  <X className="mr-2 h-4 w-4" />
                  {c('cancel')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{item.question}</h4>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(item.id)
                    setFormData(item)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{tUi('order', { n: item.order })}</span>
              <span>
                {tUi('status', {
                  state: item.isActive ? tUi('statusActive') : tUi('statusInactive'),
                })}
              </span>
            </div>
          </>
        )}
      </div>
    )
  },
)
