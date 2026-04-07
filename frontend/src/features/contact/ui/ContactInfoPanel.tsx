import { Mail, MapPin, Phone, Send } from "lucide-react"
import { useTranslation } from 'react-i18next'

export const ContactInfoPanel = () => {
  const { t } = useTranslation('support')
  return (
    <div className="space-y-6 lg:col-span-1">
      <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">Email</h3>
        <a
          href="mailto:gormachdv@gmail.com"
          className="text-sm text-primary hover:underline"
        >
          gormachdv@gmail.com
        </a>
        <p className="mt-2 text-xs text-muted-foreground">{t('contact.info.emailReply24h')}</p>
      </div>
      <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30">
          <Phone className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">
          Telegram
        </h3>
        <a
          href="https://t.me/iBa1aNCe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
                @iBa1aNCe
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('contact.info.telegramFast')}
        </p>
      </div>

      <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">{t('contact.info.office')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('contact.info.addressLine1')}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('contact.info.addressLine2')}
        </p>
      </div>

      <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
        <h3 className="mb-3 text-lg font-bold text-foreground">
          {t('contact.info.social')}
        </h3>
        <div className="flex space-x-4">
          <a
            href="https://github.com/1BalaN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://t.me/iBa1aNCe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white"
          >
            <Send className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}