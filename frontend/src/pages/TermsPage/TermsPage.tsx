import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TermsSections {
  s1Title: string
  s1Text: string
  s2Title: string
  s2ReqTitle: string
  s2ReqItems: string[]
  s2OauthTitle: string
  s2OauthText: string
  s3Title: string
  s3LicenseTitle: string
  s3LicenseText: string
  s3ForbiddenTitle: string
  s3ForbiddenIntro: string
  s3ForbiddenItems: string[]
  s4Title: string
  s4TariffTitle: string
  s4TariffText: string
  s4RenewTitle: string
  s4RenewText: string
  s4RefundTitle: string
  s4RefundText: string
  s4PriceTitle: string
  s4PriceText: string
  s5Title: string
  s5Text: string
  s5UserTitle: string
  s5UserText: string
  s6Title: string
  s6Intro: string
  s6Items: string[]
  s6Note: string
  s7Title: string
  s7Text: string
  s8Title: string
  s8Intro: string
  s8Items: string[]
  s8Note: string
  s9Title: string
  s9Text: string
  s10Title: string
  s10Text: string
  s10Note: string
  s11Title: string
  s11Intro: string
  emailLabel: string
  telegramLabel: string
  final: string
}

export const TermsPage = () => {
  const { t } = useTranslation('terms')
  const sections = t('sections', { returnObjects: true }) as TermsSections

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('updatedAt')}
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s1Title}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {sections.s1Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s2Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{sections.s2ReqTitle}</strong></p>
              <ul className="ml-6 list-disc space-y-1">
                {sections.s2ReqItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4"><strong className="text-foreground">{sections.s2OauthTitle}</strong></p>
              <p>
                {sections.s2OauthText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s3Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{sections.s3LicenseTitle}</strong></p>
              <p>
                {sections.s3LicenseText}
              </p>
              <p className="mt-4"><strong className="text-foreground">{sections.s3ForbiddenTitle}</strong></p>
              <p>{sections.s3ForbiddenIntro}</p>
              <ul className="ml-6 list-disc space-y-1">
                {sections.s3ForbiddenItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s4Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">{sections.s4TariffTitle}</strong></p>
              <p>{sections.s4TariffText}</p>
              <p className="mt-4"><strong className="text-foreground">{sections.s4RenewTitle}</strong></p>
              <p>{sections.s4RenewText}</p>
              <p className="mt-4"><strong className="text-foreground">{sections.s4RefundTitle}</strong></p>
              <p>{sections.s4RefundText}</p>
              <p className="mt-4"><strong className="text-foreground">{sections.s4PriceTitle}</strong></p>
              <p>{sections.s4PriceText}</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s5Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {sections.s5Text}
              </p>
              <p className="mt-4"><strong className="text-foreground">{sections.s5UserTitle}</strong></p>
              <p>
                {sections.s5UserText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s6Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {sections.s6Intro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {sections.s6Items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {sections.s6Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s7Title}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {sections.s7Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <XCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {sections.s8Title}
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {sections.s8Intro}
              </p>
              <ul className="ml-6 list-disc space-y-1">
                {sections.s8Items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {sections.s8Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {sections.s9Title}
            </h2>
            <p className="text-muted-foreground">
              {sections.s9Text}
            </p>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {sections.s10Title}
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                {sections.s10Text}
              </p>
              <p className="mt-4">
                {sections.s10Note}
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {sections.s11Title}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {sections.s11Intro}
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">{sections.emailLabel}</strong>{' '}
                <a href="mailto:gormachdv@gmail.com" className="text-primary hover:underline">
                  gormachdv@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">{sections.telegramLabel}</strong>{' '}
                <a href="https://t.me/iBa1aNCe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @iBa1aNCe
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-xl glass p-6 border-2 border-primary/20">
            <p className="text-center text-sm text-muted-foreground">
              {sections.final}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
