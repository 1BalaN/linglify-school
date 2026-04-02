import { Link } from 'react-router-dom'
import { BookOpen, Mail, Github, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Footer = () => {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Linglify</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>  
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t('footer.columns.platform')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/courses"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.courses')}
                </Link>
              </li>
              <li>
                <Link
                  to="/become-teacher"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.becomeTeacher')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t('footer.columns.support')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.help')}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.faq')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.contacts')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t('footer.columns.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.links.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className="flex space-x-6">
              <a
                href="mailto:gormachdv@gmail.com"
                className="text-muted-foreground transition-all hover:text-primary hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/1BalaN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-all hover:text-primary hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/iBa1aNCe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-all hover:text-primary hover:scale-110"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
