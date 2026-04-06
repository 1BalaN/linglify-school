import { useTranslation } from 'react-i18next'
import { Video, Plus } from 'lucide-react'
import { Button, VideoUpload } from '@/shared/ui'
import { AttachmentRow } from './AttachmentRow'
import type { Attachment } from '@/shared/types/course'

interface NewVideoSectionProps {
  videoUrl: string
  additionalInfo: string
  attachments: Attachment[]
  onVideoChange: (url: string) => void
  onInfoChange: (val: string) => void
  onAddAttachment: () => void
  onUpdateAttachment: (idx: number, upd: Partial<Attachment>) => void
  onRemoveAttachment: (idx: number) => void
  onUploadError: (msg: string) => void
}

export const NewVideoSection = ({
  videoUrl,
  additionalInfo,
  attachments,
  onVideoChange,
  onInfoChange,
  onAddAttachment,
  onUpdateAttachment,
  onRemoveAttachment,
  onUploadError,
}: NewVideoSectionProps) => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonBuilder.videoSection' })
  return (
    <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Video className="h-4 w-4" />
        <span>{t('settings')}</span>
      </div>

      <VideoUpload value={videoUrl} onChange={onVideoChange} label={t('videoLabel')} required />

      <div>
        <label className="mb-1 block text-sm font-medium">{t('additional')}</label>
        <textarea
          value={additionalInfo}
          onChange={e => onInfoChange(e.target.value)}
          placeholder={t('additionalPh')}
          className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">{t('attachments')}</label>
          <Button type="button" variant="outline" size="sm" onClick={onAddAttachment}>
            <Plus className="mr-1 h-3 w-3" />
            {t('addFile')}
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">{t('hint')}</p>
        {attachments.map((att, idx) => (
          <div key={idx} className="mb-2">
            <AttachmentRow
              attachment={att}
              onUpdate={upd => onUpdateAttachment(idx, upd)}
              onRemove={() => onRemoveAttachment(idx)}
              onUploadError={onUploadError}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
