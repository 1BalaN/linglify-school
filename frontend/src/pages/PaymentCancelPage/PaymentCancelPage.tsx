import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui'

export const PaymentCancelPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const courseId = searchParams.get('courseId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 dark:from-red-950/30 dark:via-slate-950 dark:to-amber-950/30 flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl bg-white shadow-xl shadow-red-500/10 ring-1 ring-red-100 dark:bg-slate-900 dark:ring-red-900/40 p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <AlertCircle className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Оплата не была завершена</h1>
        <p className="text-sm text-muted-foreground">
          Платёж был отменён или не прошёл. Курс пока недоступен. Вы можете вернуться к курсу и
          попробовать оплатить ещё раз.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          {courseId && (
            <Button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к курсу
            </Button>
          )}
          <Button onClick={() => navigate('/courses')} className="w-full" size="sm">
            Перейти к каталогу
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

