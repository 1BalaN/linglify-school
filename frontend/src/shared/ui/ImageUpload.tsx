import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { Button } from './Button'

const API_URL = import.meta.env.VITE_API_URL as string

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const { t } = useTranslation('platform')
  const u = (k: string) => t(`sharedUi.upload.image.${k}`)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const effectiveLabel = label ?? u('defaultLabel')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error?.message || t('sharedUi.upload.image.errorStatus', { status: res.status }))
      }

      const data = await res.json()
      onChange(data.data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : u('errorGeneric'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const clear = () => {
    onChange('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-foreground">
        {effectiveLabel}
      </label>
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">{u('uploading')}</p>
          </>
        ) : value ? (
          <>
            <ImageIcon className="h-6 w-6 text-emerald-500" />
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {u('uploaded')}
            </p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={e => {
                e.stopPropagation()
                clear()
              }}
              className="text-[11px]"
            >
              <X className="mr-1 h-3 w-3" />
              {u('remove')}
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">{u('clickUpload')}</p>
            <p className="text-[10px] text-muted-foreground">{u('formats')}</p>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadError && (
        <p className="text-[11px] text-red-600">
          {uploadError}
        </p>
      )}
    </div>
  )
}

