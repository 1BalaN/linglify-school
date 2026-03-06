import { useRef, useState } from 'react'
import { Upload, X, Music2, Loader2 } from 'lucide-react'
import { Button } from './Button'

const API_URL = import.meta.env.VITE_API_URL as string

interface AudioUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export const AudioUpload = ({ value, onChange, label = 'Аудио' }: AudioUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/upload/audio`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error?.message || `Ошибка ${res.status}`)
      }

      const data = await res.json()
      onChange(data.data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки аудио')
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
        {label}
      </label>
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Загрузка аудио...</p>
          </>
        ) : value ? (
          <>
            <Music2 className="h-6 w-6 text-emerald-500" />
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Аудио загружено
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
              Удалить
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">Нажмите для загрузки аудио</p>
            <p className="text-[10px] text-muted-foreground">MP3, OGG, WAV, M4A — до 50 МБ</p>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
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

