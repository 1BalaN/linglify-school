import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { isDirectVideo, toEmbedUrl } from '@/shared/lib/video'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  const { t } = useTranslation('platform')
  const direct = isDirectVideo(videoUrl)
  const src = direct ? videoUrl : toEmbedUrl(videoUrl)

  if (direct) {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl bg-black shadow-2xl">
        <video
          controls
          className="w-full max-h-[60vh]"
          src={src}
        >
          {t('sharedUi.videoPlayer.noVideo')}
        </video>
      </div>
    )
  }

  return (
    <div className="mb-6 aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

