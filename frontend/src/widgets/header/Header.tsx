import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { RootState } from '@/app/store'
import { logout, useLogoutMutation } from '@/entities/user'
import { Button } from '@/shared/ui'
import { useTheme } from '@/shared/lib/theme'
import { BookOpen, User, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

export const Header = () => {
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [logoutMutation] = useLogoutMutation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
    } catch (error) {
      console.error('Logout error:', error)
      dispatch(logout())
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center space-x-3 transition-transform hover:scale-105">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 transition-all group-hover:shadow-xl group-hover:shadow-violet-500/40">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Linglify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 md:flex">
          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Курсы
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            О платформе
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Тарифы
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-primary" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 rounded-xl px-3 py-2 transition-all hover:bg-primary/5 hover:scale-105"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName || 'User'}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shadow-md"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/30">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-sm font-semibold text-foreground">
                  {user.firstName || user.email}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto space-y-2 px-4 py-4">
            <Link
              to="/courses"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Курсы
            </Link>
            <Link
              to="/about"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              О платформе
            </Link>
            <Link
              to="/pricing"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Тарифы
            </Link>
            <div className="border-t border-border pt-4">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName || 'User'}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {user.firstName || user.email}
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="mt-2 w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Регистрация
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
