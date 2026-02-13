import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/shared/lib/utils'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onImageSelect: (base64: string) => void
  className?: string
}

export const AvatarUpload = ({
  currentAvatar,
  onImageSelect,
  className,
}: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Максимальный размер 800x800
          let width = img.width
          let height = img.height
          const maxSize = 800
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Конвертируем в JPEG с качеством 0.8
          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressed)
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера файла (макс 10МБ до сжатия)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10 МБ')
      return
    }

    setIsLoading(true)

    try {
      const compressed = await compressImage(file)
      setPreview(compressed)
      onImageSelect(compressed)
      setIsLoading(false)
    } catch (error) {
      alert('Ошибка при обработке изображения')
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-border bg-accent">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {preview && (
          <button
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full border-2 border-background bg-destructive p-1.5 text-destructive-foreground shadow-md transition-transform hover:scale-110"
            aria-label="Удалить аватар"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="avatar-upload"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        isLoading={isLoading}
        className="w-full max-w-xs"
      >
        <Upload className="mr-2 h-4 w-4" />
        {preview ? 'Изменить фото' : 'Загрузить фото'}
      </Button>

      <p className="text-xs text-muted-foreground">
        JPG, PNG или GIF. Максимум 10 МБ. Изображение будет автоматически сжато.
      </p>
    </div>
  )
}
