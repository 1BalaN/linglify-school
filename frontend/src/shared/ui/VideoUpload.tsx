import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, X, Video, Loader2 } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { isDirectVideo, toEmbedUrl } from '@/shared/lib/video'

const API_URL = import.meta.env.VITE_API_URL as string

interface VideoUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
}

export const VideoUpload = ({ value, onChange, label = 'Видео', required = false }: VideoUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState(value || '')

  const handleUrlChange = (raw: string) => {
    setUrlInput(raw)
    const embedded = toEmbedUrl(raw.trim())
    onChange(embedded)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('video', file)

    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/upload/video`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `Ошибка ${res.status}`)
      }
      const data = await res.json()
      onChange(data.data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const clear = () => {
    onChange('')
    setUrlInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          {label}{required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="flex rounded-lg border border-border text-xs overflow-hidden">
          <button type="button" onClick={() => setMode('url')}
            className={`px-3 py-1 transition-colors ${mode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
            <LinkIcon className="inline mr-1 h-3 w-3" />Ссылка
          </button>
          <button type="button" onClick={() => setMode('upload')}
            className={`px-3 py-1 transition-colors ${mode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
            <Upload className="inline mr-1 h-3 w-3" />Файл
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={urlInput}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=... или https://vimeo.com/..."
                className="pl-9"
              />
            </div>
            {value && (
              <Button variant="ghost" size="sm" onClick={clear} type="button">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Загрузка видео...</p>
              </>
            ) : value && isDirectVideo(value) ? (
              <>
                <Video className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Видео загружено</p>
                <Button variant="outline" size="sm" type="button" onClick={e => { e.stopPropagation(); clear() }}>
                  <X className="mr-1 h-3 w-3" />Удалить
                </Button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Нажмите для загрузки</p>
                <p className="text-xs text-muted-foreground">MP4, WebM, MOV — до 500 МБ</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime"
            className="hidden" onChange={handleFileChange} />
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {value && (
        <div className="rounded-lg border border-border bg-card/50 p-2 text-xs text-muted-foreground truncate">
          <Video className="inline mr-1 h-3 w-3" />
          {value}
        </div>
      )}
    </div>
  )
}
