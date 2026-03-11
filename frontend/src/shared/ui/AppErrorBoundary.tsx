import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/shared/ui'

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('Unexpected UI error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
          <div className="max-w-md rounded-3xl border border-destructive/30 bg-card/95 p-8 text-center shadow-xl backdrop-blur">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
              Что-то пошло не так
            </h1>
            <p className="mb-4 text-sm text-muted-foreground">
              Произошла непредвиденная ошибка при отображении интерфейса. Мы уже записали её в
              журналы. Попробуйте обновить страницу или вернитесь на главную.
            </p>
            <p className="mb-6 text-[11px] text-muted-foreground/80">
              Ваш прогресс и данные курсов хранятся на сервере и не теряются из‑за этой ошибки.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Обновить
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

