import { useRef, useState } from 'react'
import { Button, Input } from '@/shared/ui'
import { uploadDocument } from '@/shared/lib/uploadDocument'
import { Trash2, Upload, Loader2 } from 'lucide-react'

interface AttachmentRowProps {
  attachment: { name: string; url: string; size: number }
  onUpdate: (upd: Partial<{ name: string; url: string; size: number }>) => void
  onRemove: () => void
  onUploadError: (msg: string) => void
}

export function AttachmentRow({ attachment, onUpdate, onRemove, onUploadError }: AttachmentRowProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadDocument(file)
      onUpdate({ url: result.url, name: result.name, size: result.size })
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2">
      <Input
        placeholder="Название (например: Методичка PDF)"
        value={attachment.name}
        onChange={e => onUpdate({ name: e.target.value })}
        className="min-w-[140px] flex-1 text-sm"
      />
      <Input
        placeholder="URL или загрузите файл"
        value={attachment.url}
        onChange={e => onUpdate({ url: e.target.value })}
        className="min-w-[180px] flex-1 text-sm"
      />
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      </Button>
      <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-red-500">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
