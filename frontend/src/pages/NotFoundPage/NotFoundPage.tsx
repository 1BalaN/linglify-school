import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui'

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50/50 via-background to-indigo-50/50 dark:from-violet-950/20 dark:via-background dark:to-indigo-950/20">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="max-w-2xl text-center">
          {/* 404 Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 animate-pulse rounded-full bg-primary/5" />
            </div>
            <div className="relative">
              <h1 className="mb-4 text-9xl font-black text-gradient animate-in fade-in zoom-in duration-1000">
                404
              </h1>
              <div className="absolute inset-0 -z-10 blur-3xl">
                <h1 className="text-9xl font-black text-primary/20">404</h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <h2 className="text-3xl font-bold text-foreground">
              Страница не найдена
            </h2>
            <p className="text-lg text-muted-foreground">
              К сожалению, страница, которую вы ищете, не существует или была перемещена.
            </p>
          </div>

          {/* Search Illustration */}
          <div className="mb-12 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="glass-card rounded-full p-6 backdrop-blur-xl">
              <Search className="h-16 w-16 text-primary animate-float" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Link to="/">
              <Button variant="primary" className="group w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                На главную
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="group w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Назад
            </Button>
          </div>

          {/* Popular Links */}
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <p className="mb-4 text-sm text-muted-foreground">
              Возможно, вас заинтересует:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="text-sm">
                  Курсы
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="sm" className="text-sm">
                  О платформе
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="text-sm">
                  Тарифы
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-sm">
                  Профиль
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
