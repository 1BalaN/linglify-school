import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { useGetLessonByIdQuery, useGetCourseLessonsQuery, useUpdateProgressMutation } from '@/entities/lesson'
import {
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ClipboardCheck,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { Button, VideoPlayer } from '@/shared/ui'
import { getAdditionalTextFromContent } from '@/shared/lib/lessonContent'
import { LessonHeader, LessonInteractiveView, LessonTestView, LessonLexicalView, LessonDialogueView } from '@/features/lesson/view'
import type { Answer } from '@/shared/types/course'

function buildAttachmentUrl(url: string, name?: string | null): string {
  if (!url) return '#'
  try {
    const u = new URL(url)
    if (u.hostname.includes('res.cloudinary.com') && u.pathname.includes('/raw/upload/')) {
      return url
    }
    const [prefix, rest] = u.pathname.split('/upload/')
    if (!rest) return url
    const safeName = (name || 'file')
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 80) || 'file'
    u.pathname = `${prefix}/upload/fl_attachment:${safeName}/${rest}`
    return u.toString()
  } catch {
    return url
  }
}

export const LessonPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'lessonFlow' })
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { data, isLoading, error } = useGetLessonByIdQuery(lessonId!)
  const [updateProgress] = useUpdateProgressMutation()
  const [isCompleting, setIsCompleting] = useState(false)
  const lesson = data?.data
  const { data: lessonsData } = useGetCourseLessonsQuery(
    lesson?.courseId ?? '', { skip: !lesson?.courseId })
  const courseLessons = lessonsData?.data ?? []
  const currentIndex = courseLessons.findIndex(l => l.id === lesson?.id)
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null

  useEffect(() => {
    const startTime = Date.now()
    return () => {
      if (user && lessonId) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)
        if (timeSpent > 5) {
          updateProgress({ lessonId, timeSpent })
        }
      }
    }
  }, [lessonId, user, updateProgress])

  if (!user) {
    navigate('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">{t('notFound')}</h2>
          <Button onClick={() => navigate(-1)}>{t('back')}</Button>
        </div>
      </div>
    )
  }

  if (!lesson?.hasAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-card max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-xl font-bold">{t('noAccess')}</h2>
          <p className="mb-6 text-muted-foreground">{t('noAccessBody')}</p>
          <Button onClick={() => navigate(`/courses/${lesson?.courseId}`)}>{t('toCourse')}</Button>
        </div>
      </div>
    )
  }

  const handleComplete = async (score?: number) => {
    if (!lessonId || isCompleting) return
    setIsCompleting(true)
    try {
      await updateProgress({ lessonId, isCompleted: true, score }).unwrap()
    } catch (e) {
      console.error(e)
    } finally {
      setIsCompleting(false)
    }
  }

  const isCompleted = lesson.userProgress?.isCompleted
  const userAnswers = lesson.userAnswers || null
  const additionalText = getAdditionalTextFromContent(lesson.content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          type={lesson.type}
          durationSeconds={lesson.duration ?? undefined}
          isCompleted={isCompleted}
          onBackToCourse={() => navigate(`/courses/${lesson.courseId}/learn`)}
        />
        {/* VIDEO */}
        {lesson.type === 'VIDEO' && (
          <>
            {lesson.videoUrl && <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />}
            {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                  <FileText className="h-4 w-4" />
                  {t('attachments')}
                </h3>
                <ul className="space-y-2">
                  {lesson.attachments.map((att, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      {(() => {
                        const isCloudinaryRaw =
                          att.url?.includes('res.cloudinary.com') && att.url?.includes('/raw/upload/')
                        const href = isCloudinaryRaw
                          ? `/api/upload/document/download?url=${encodeURIComponent(att.url)}${
                              att.name ? `&name=${encodeURIComponent(att.name)}` : ''
                            }`
                          : buildAttachmentUrl(att.url, att.name)
                        return (
                          <a
                            href={href}
                            rel="noopener noreferrer"
                            className="break-all text-primary underline hover:no-underline"
                          >
                            {att.name || t('fileFallback')}
                          </a>
                        )
                      })()}
                      {att.size ? (
                        <span className="text-xs text-muted-foreground">
                          {t('mb', { n: (att.size / (1024 * 1024)).toFixed(1) })}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {additionalText && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-base font-semibold text-foreground">{t('extraMaterials')}</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {additionalText}
                </p>
              </div>
            )}
            {!isCompleted && (
              <div className="mt-8 flex justify-center">
                <Button size="lg" onClick={() => handleComplete()} disabled={isCompleting}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isCompleting ? t('saving') : t('markComplete')}
                </Button>
              </div>
            )}
          </>
        )}
        {/* TEST */}
        {lesson.type === 'TEST' && (
          <>
            {lesson.videoUrl && (
              <div className="mb-6">
                <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
              </div>
            )}
            {lesson.questions && lesson.questions.length > 0 ? (
              <LessonTestView
                questions={lesson.questions}
                content={lesson.content}
                onComplete={handleComplete}
                initialCompleted={!!lesson.userProgress?.isCompleted}
                initialScore={lesson.userProgress?.score ?? null}
                initialAnswers={userAnswers as Record<string, Answer> | null}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <ClipboardCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>{t('testEmpty')}</p>
              </div>
            )}
          </>
        )}
        {/* INTERACTIVE */}
        {lesson.type === 'INTERACTIVE' && (
          <>
            {lesson.videoUrl && (
              <div className="mb-6">
                <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
              </div>
            )}
            {lesson.questions && lesson.questions.length > 0 ? (
              <LessonInteractiveView
                questions={lesson.questions}
                onComplete={handleComplete}
                initialCompleted={!!lesson.userProgress?.isCompleted}
                initialScore={lesson.userProgress?.score ?? null}
                initialAnswers={userAnswers as Record<string, Answer> | null}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>{t('interactiveEmpty')}</p>
              </div>
            )}
          </>
        )}
        {/* LEXICAL */}
        {lesson.type === 'LEXICAL' && (
          <>
            {lesson.videoUrl && (
              <div className="mb-6">
                <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
              </div>
            )}
            {lesson.questions && lesson.questions.length > 0 ? (
              <LessonLexicalView
                questions={lesson.questions}
                onComplete={handleComplete}
                initialCompleted={!!lesson.userProgress?.isCompleted}
                initialScore={lesson.userProgress?.score ?? null}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>{t('lexicalEmpty')}</p>
              </div>
            )}
          </>
        )}
        {/* DIALOGUE */}
        {lesson.type === 'DIALOGUE' && (
          <>
            {lesson.videoUrl && (
              <div className="mb-6">
                <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
              </div>
            )}
            {lesson.questions && lesson.questions.length > 0 ? (
              <LessonDialogueView
                questions={lesson.questions}
                onComplete={handleComplete}
                initialCompleted={!!lesson.userProgress?.isCompleted}
                initialScore={lesson.userProgress?.score ?? null}
                initialAnswers={userAnswers as Record<string, Answer> | null}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p>{t('dialogueEmpty')}</p>
              </div>
            )}
          </>
        )}
        {/* Prev / next lesson navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            {prevLesson && prevLesson.hasAccess ? (
              <Link
                to={`/lessons/${prevLesson.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-primary/20 bg-background px-4 font-semibold transition-all hover:scale-105 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t('prevLesson')}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {nextLesson && nextLesson.hasAccess ? (
              <Link
                to={`/lessons/${nextLesson.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-primary/20 bg-background px-4 font-semibold transition-all hover:scale-105 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('nextLesson')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <Button variant="outline" onClick={() => navigate(`/courses/${lesson.courseId}/learn`)}>
                {t('toLessonList')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
