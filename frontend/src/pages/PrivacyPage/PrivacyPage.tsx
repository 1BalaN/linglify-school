import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PrivacyContent {
  title: string
  updatedAt: string
  introTitle: string
  introText: string
  collectTitle: string
  collectPersonalTitle: string
  collectPersonalItems: string[]
  collectLearningTitle: string
  collectLearningItems: string[]
  collectTechnicalTitle: string
  collectTechnicalItems: string[]
  useTitle: string
  useItems: string[]
  protectTitle: string
  protectIntro: string
  protectItems: string[]
  rightsTitle: string
  rightsIntro: string
  rightsItems: string[]
  rightsContact: string
  cookiesTitle: string
  cookiesIntro: string
  cookiesItems: string[]
  cookiesNote: string
  thirdPartyTitle: string
  thirdPartyIntro: string
  thirdPartyItems: string[]
  thirdPartyNote: string
  retentionTitle: string
  retentionText: string
  changesTitle: string
  changesText: string
  contactsTitle: string
  contactsIntro: string
  emailLabel: string
  telegramLabel: string
}

function privacyBundle(i18n: { getResourceBundle: (lng: string, ns: string) => unknown; language: string; resolvedLanguage?: string }): PrivacyContent {
  const tryLng = (lng: string) => i18n.getResourceBundle(lng, 'privacy') as PrivacyContent | undefined
  const base = (i18n.resolvedLanguage ?? i18n.language).replace(/-.+$/, '')
  return tryLng(base) ?? tryLng('ru') ?? tryLng('en')!
}

export const PrivacyPage = () => {
  const { i18n } = useTranslation()
  const content = privacyBundle(i18n)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            {content.title}
          </h1>
          <p className="text-muted-foreground">
            {content.updatedAt}
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{content.introTitle}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {content.introText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.collectTitle}
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectPersonalTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectPersonalItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectLearningTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectLearningItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {content.collectTechnicalTitle}
                </h3>
                <ul className="ml-6 list-disc space-y-1">
                  {content.collectTechnicalItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.useTitle}
              </h2>
            </div>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              {content.useItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.protectTitle}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.protectIntro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.protectItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {content.rightsTitle}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>{content.rightsIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {content.rightsItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.rightsContact}{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.cookiesTitle}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {content.cookiesIntro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {content.cookiesItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.cookiesNote}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.thirdPartyTitle}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{content.thirdPartyIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {content.thirdPartyItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {content.thirdPartyNote}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.retentionTitle}
            </h2>
            <p className="text-muted-foreground">
              {content.retentionText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.changesTitle}
            </h2>
            <p className="text-muted-foreground">
              {content.changesText}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {content.contactsTitle}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {content.contactsIntro}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">{content.emailLabel}</strong>{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">{content.telegramLabel}</strong>{' '}
                <a href="https://t.me/iBa1aNCe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @iBa1aNCe
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
