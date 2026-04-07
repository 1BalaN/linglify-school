import { useState, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Shield, TrendingDown, BookOpen, Crown, Users, Archive, MessageSquareWarning, Award } from 'lucide-react'
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from '@/entities/settings/api/settingsApi'
import type { PlatformSettings } from '@/shared/types/settings'
import { Button, Input, AlertModal } from '@/shared/ui'

const SectionCard = ({ icon: Icon, title, description, children }: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) => (
  <section className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm w-full">
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
)

export const AdminSettingsPage = () => {
  const { t } = useTranslation('platform')
  const { data, isLoading } = useGetPlatformSettingsQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdatePlatformSettingsMutation()

  const [form, setForm] = useState<Partial<PlatformSettings>>({})
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<string | null>(null)

  useEffect(() => {
    if (data?.data) {
      setForm(data.data)
    }
  }, [data])

  const set = (field: keyof PlatformSettings) => (value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return

    const payload: Partial<PlatformSettings> = {
      lowRatingThreshold:             form.lowRatingThreshold,
      minEnrollmentsForRating:        form.minEnrollmentsForRating,
      placementDefaultQuestions:      form.placementDefaultQuestions,
      placementAllowedLanguages:      form.placementAllowedLanguages,
      trialSubscriptionDays:          form.trialSubscriptionDays,
      maxCoursesPerStudent:           form.maxCoursesPerStudent,
      autoArchiveDaysAfterInactivity: form.autoArchiveDaysAfterInactivity,
      reviewModerationEnabled:        form.reviewModerationEnabled,
      certificateValidityMonths:      form.certificateValidityMonths,
    }

    try {
      await updateSettings(payload).unwrap()
      setSuccessModal(t('admin.settings.saveSuccess'))
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        (error as { data?: { error?: { message?: string } } }).data?.error?.message
          ? (error as { data?: { error?: { message?: string } } }).data!.error!.message!
          : t('admin.settings.saveError')
      setErrorModal(message)
    }
  }

  if (isLoading || !form) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">{t('admin.settings.title')}</h1>
        <p className="text-muted-foreground">{t('admin.settings.loading')}</p>
      </div>
    )
  }

  const languagesValue = (form.placementAllowedLanguages ?? []).join(', ')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t('admin.settings.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.settings.intro')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Analytics */}
        <SectionCard
          icon={TrendingDown}
          title={t('admin.settings.analyticsTitle')}
          description={t('admin.settings.analyticsDesc')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('admin.settings.lowRatingLabel')}</label>
              <Input
                type="number" step="0.1" min={0} max={5}
                value={form.lowRatingThreshold ?? 2.5}
                onChange={e => set('lowRatingThreshold')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.settings.lowRatingHelp')}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('admin.settings.minEnrollLabel')}</label>
              <Input
                type="number" min={0}
                value={form.minEnrollmentsForRating ?? 5}
                onChange={e => set('minEnrollmentsForRating')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.settings.minEnrollHelp')}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ──── PLACEMENT ──── */}
        <SectionCard
          icon={BookOpen}
          title={t('admin.settings.placementTitle')}
          description={t('admin.settings.placementDesc')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('admin.settings.placementQuestionsLabel')}</label>
              <Input
                type="number" min={1} max={100}
                value={form.placementDefaultQuestions ?? 25}
                onChange={e => set('placementDefaultQuestions')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.settings.placementQuestionsHelp')}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('admin.settings.placementLangLabel')}</label>
              <Input
                type="text"
                placeholder={t('admin.settings.placementLangPlaceholder')}
                value={languagesValue}
                onChange={e => {
                  const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  set('placementAllowedLanguages')(list)
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.settings.placementLangHelp')}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Subscriptions */}
        <SectionCard
          icon={Crown}
          title={t('admin.settings.subsTitle')}
          description={t('admin.settings.subsDesc')}
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">{t('admin.settings.trialDaysLabel')}</label>
            <Input
              type="number" min={1} max={365}
              value={form.trialSubscriptionDays ?? 30}
              onChange={e => set('trialSubscriptionDays')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.settings.trialDaysHelp')}
            </p>
          </div>
        </SectionCard>

        {/* Students */}
        <SectionCard
          icon={Users}
          title={t('admin.settings.studentsTitle')}
          description={t('admin.settings.studentsDesc')}
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">{t('admin.settings.maxCoursesLabel')}</label>
            <Input
              type="number" min={0}
              value={form.maxCoursesPerStudent ?? 0}
              onChange={e => set('maxCoursesPerStudent')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.settings.maxCoursesHelp')}
            </p>
          </div>
        </SectionCard>

        {/* Automation */}
        <SectionCard
          icon={Archive}
          title={t('admin.settings.autoTitle')}
          description={t('admin.settings.autoDesc')}
        >
          <div className="space-y-4">
            <div className="md:w-1/2 space-y-1">
              <label className="text-sm font-medium">
                {t('admin.settings.archiveLabel')}
              </label>
              <Input
                type="number" min={0}
                value={form.autoArchiveDaysAfterInactivity ?? 0}
                onChange={e => set('autoArchiveDaysAfterInactivity')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('admin.settings.archiveHelp')}
              </p>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-muted-foreground/40"
                checked={!!form.reviewModerationEnabled}
                onChange={e => set('reviewModerationEnabled')(e.target.checked)}
              />
              <div>
                <div className="font-medium text-sm">{t('admin.settings.reviewModTitle')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('admin.settings.reviewModHelp')}
                </p>
              </div>
            </label>
          </div>
        </SectionCard>

        {/* Certificates (global) */}
        <SectionCard
          icon={Award}
          title={t('admin.settings.certsTitle')}
          description={t('admin.settings.certsDesc')}
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">{t('admin.settings.certMonthsLabel')}</label>
            <Input
              type="number" min={0}
              value={form.certificateValidityMonths ?? 0}
              onChange={e => set('certificateValidityMonths')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.settings.certMonthsHelp')}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <Trans
                  i18nKey="admin.settings.certNotice"
                  ns="platform"
                  components={{ 1: <strong className="text-foreground" /> }}
                />
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Review moderation (info) */}
        <SectionCard
          icon={MessageSquareWarning}
          title={t('admin.settings.responsibilityTitle')}
          description=""
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <Trans
                  i18nKey="admin.settings.responsibilityCertCourse"
                  ns="platform"
                  components={{ 0: <strong className="text-foreground" /> }}
                />
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <Trans
                  i18nKey="admin.settings.responsibilityCertExpiry"
                  ns="platform"
                  components={{ 0: <strong className="text-foreground" /> }}
                />
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <Trans
                  i18nKey="admin.settings.responsibilityTrial"
                  ns="platform"
                  components={{ 0: <strong className="text-foreground" /> }}
                />
              </span>
            </li>
          </ul>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="min-w-[180px]">
            {isSaving ? t('admin.settings.saving') : t('admin.settings.save')}
          </Button>
        </div>
      </form>

      <AlertModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={t('admin.settings.modalError')}
        message={errorModal || ''}
        variant="error"
      />
      <AlertModal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title={t('admin.settings.modalSuccess')}
        message={successModal || ''}
        variant="success"
      />
    </div>
  )
}

export default AdminSettingsPage
