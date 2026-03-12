import { useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import {
  useStartPlacementMutation,
  useSubmitPlacementAnswerMutation,
  useGetPlacementRecommendedCoursesQuery,
  useGetPlacementResultQuery,
} from '@/entities/placement'
import type {
  PlacementQuestion,
  SubmitPlacementResponse,
  PlacementRecommendedCourse,
  PlacementResultResponse,
} from '@/shared/types/placement'
import { AlertCircle } from 'lucide-react'
import {
  PlacementLanguageStep,
  PlacementInProgressStep,
  PlacementResultStep,
} from '@/features/placement/test'


type Step = 'language' | 'inProgress' | 'finished'

export const PlacementTestPage = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [searchParams, setSearchParams] = useSearchParams()

  const [step, setStep] = useState<Step>('language')
  const [language, setLanguage] = useState<string>(() => searchParams.get('language') || 'Английский')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<PlacementQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [maxQuestions, setMaxQuestions] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitPlacementResponse | null>(null)

  const [startPlacement, { isLoading: isStarting }] = useStartPlacementMutation()
  const [submitAnswer] = useSubmitPlacementAnswerMutation()

  const shouldLoadRecommendations = Boolean(sessionId && step === 'finished')
  const shouldLoadDetails = Boolean(sessionId && step === 'finished')

  const {
    data: recommendedCoursesData,
    isLoading: isLoadingRecommendations,
  } = useGetPlacementRecommendedCoursesQuery(
    shouldLoadRecommendations && sessionId ? { sessionId } : skipToken
  )

  const {
    data: resultDetailsData,
    isLoading: isLoadingDetails,
  } = useGetPlacementResultQuery(
    shouldLoadDetails && sessionId ? { sessionId } : skipToken
  )

  // Автовыбор языка по профилю пользователя (если в URL язык не задан).
  // Если пользователь указал несколько языков через запятую, берём первый.
  useEffect(() => {
    const languageFromUrl = searchParams.get('language')
    if (languageFromUrl) return
    if (!user?.preferredLanguage) return

    const preferredRaw = user.preferredLanguage
    const preferred =
      preferredRaw.split(',')[0]?.trim() || preferredRaw.trim() || 'Английский'
    setLanguage(preferred)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('language', preferred)
      return next
    })
  }, [user?.preferredLanguage, searchParams, setSearchParams])

  useEffect(() => {
    const stepFromUrl = searchParams.get('step')
    const sessionIdFromUrl = searchParams.get('sessionId')

    if (sessionIdFromUrl && !sessionId) {
      setSessionId(sessionIdFromUrl)
    }

    if (stepFromUrl === 'in') setStep('inProgress')
    if (stepFromUrl === 'done') setStep('finished')
  }, [searchParams, sessionId])

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await startPlacement({ language: language.trim() || 'Английский' }).unwrap()
      const data = res.data
      setSessionId(data.session.id)
      setCurrentQuestion(data.question)
      setQuestionIndex(data.questionIndex)
      setMaxQuestions(data.maxQuestions)
      setStep('inProgress')

      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('language', language)
        next.set('step', 'in')
        return next
      })
    } catch (err) {
      const e = err as { data?: { error?: { message?: string } } }
      setError(
        e?.data?.error?.message ||
          'Не удалось начать placement-тест. Попробуйте позже.'
      )
    }
  }

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion || selectedOption === null) return
    setError(null)
    setSubmitting(true)

    try {
      const res = await submitAnswer({
        sessionId,
        questionId: currentQuestion.id,
        optionIndex: selectedOption,
      }).unwrap()

      const data = res.data
      setResult(data)

      if (data.finished) {
        setStep('finished')
        setSearchParams(prev => {
          const next = new URLSearchParams(prev)
          next.set('step', 'done')
          next.set('sessionId', sessionId)
          return next
        })
      } else {
        setCurrentQuestion(data.question)
        setQuestionIndex(data.questionIndex)
        setMaxQuestions(data.maxQuestions)
        setSelectedOption(null)
      }
    } catch (err) {
      const e = err as { data?: { error?: { message?: string } } }
      setError(
        e?.data?.error?.message ||
          'Не удалось отправить ответ. Попробуйте ещё раз.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetake = () => {
    setSessionId(null)
    setCurrentQuestion(null)
    setQuestionIndex(0)
    setMaxQuestions(0)
    setSelectedOption(null)
    setResult(null)
    setStep('language')
    setSearchParams(params => {
      const next = new URLSearchParams(params)
      next.delete('sessionId')
      next.set('step', 'start')
      return next
    })
  }

  const recommendedCourses: PlacementRecommendedCourse[] =
    recommendedCoursesData?.data ?? []

  const detailedResult: PlacementResultResponse | undefined =
    resultDetailsData?.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Определение уровня
          </div>
          <h1 className="text-3xl font-bold text-gradient">
            Placement-тест
          </h1>
          <p className="text-muted-foreground text-sm">
            Ответьте на 25 вопросов (примерно 15–25 минут), чтобы мы определили ваш уровень и подобрали подходящие курсы.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'language' && (
          <PlacementLanguageStep
            language={language}
            isStarting={isStarting}
            onLanguageChange={value => setLanguage(value)}
            onStart={handleStart}
            onBackToCourses={() => navigate('/courses')}
          />
        )}

        {step === 'inProgress' && currentQuestion && (
          <PlacementInProgressStep
            question={currentQuestion}
            questionIndex={questionIndex}
            maxQuestions={maxQuestions}
            selectedOption={selectedOption}
            submitting={submitting}
            onSelectOption={index => setSelectedOption(index)}
            onSubmit={handleSubmitAnswer}
          />
        )}

        {step === 'finished' && (
          <PlacementResultStep
            result={result}
            detailedResult={detailedResult}
            isLoadingDetails={isLoadingDetails}
            recommendedCourses={recommendedCourses}
            isLoadingRecommendations={isLoadingRecommendations}
            hasUser={Boolean(user)}
            onGoToCourses={() => navigate('/courses')}
            onGoToCourse={courseId => navigate(`/courses/${courseId}`)}
            onGoToMyCourses={() => navigate('/my-courses')}
            onRetake={handleRetake}
          />
        )}
      </div>
    </div>
  )
}
