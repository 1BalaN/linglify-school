import { memo } from 'react'
import { FAQItemSection } from '@/features/admin/faq'
import { FAQItem } from '@/shared/types/faq'
import { FAQFormData } from '@/pages/AdminFAQPage/AdminFAQPage'

type FAQCategorySectionProps = {
  category: string
  items: FAQItem[]
  editingId: string | null
  formData: FAQFormData
  setEditingId: (id: string | null) => void
  setFormData: (data: FAQFormData) => void
  onChange: <K extends keyof FAQFormData>(field: K, value: FAQFormData[K]) => void
  onDelete: (id: string) => void
  onUpdate: (id: string) => void
}

export const FAQCategorySection = memo(
  ({
    category,
    items,
    editingId,
    formData,
    setEditingId,
    setFormData,
    onChange,
    onDelete,
    onUpdate,
  }: FAQCategorySectionProps) => {
    return (
      <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          {category}
        </h2>

        <div className="space-y-3">
          {items.map(item => (
            <FAQItemSection
              key={item.id}
              item={item}
              editingId={editingId}
              formData={formData}
              setEditingId={setEditingId}
              setFormData={setFormData}
              onChange={onChange}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    )
  }
)