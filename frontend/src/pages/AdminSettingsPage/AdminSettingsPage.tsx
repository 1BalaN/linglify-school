import { useState, useEffect } from 'react'
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
      setSuccessModal('Настройки платформы успешно сохранены')
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        (error as { data?: { error?: { message?: string } } }).data?.error?.message
          ? (error as { data?: { error?: { message?: string } } }).data!.error!.message!
          : 'Не удалось сохранить настройки. Попробуйте позже.'
      setErrorModal(message)
    }
  }

  if (isLoading || !form) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Настройки платформы</h1>
        <p className="text-muted-foreground">Загрузка настроек…</p>
      </div>
    )
  }

  const languagesValue = (form.placementAllowedLanguages ?? []).join(', ')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Настройки платформы</h1>
        <p className="text-sm text-muted-foreground">
          Управление ключевыми правилами автоматизации: аналитика, placement‑тест, подписки и студенты.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ──── АНАЛИТИКА ──── */}
        <SectionCard
          icon={TrendingDown}
          title="Аналитика проблемных курсов"
          description="Пороговые значения для блока «Курсы с низким рейтингом» в аналитике."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Порог низкого рейтинга</label>
              <Input
                type="number" step="0.1" min={0} max={5}
                value={form.lowRatingThreshold ?? 2.5}
                onChange={e => set('lowRatingThreshold')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Курсы с рейтингом ниже или равным этому значению считаются проблемными.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Мин. зачислений для учёта рейтинга</label>
              <Input
                type="number" min={0}
                value={form.minEnrollmentsForRating ?? 5}
                onChange={e => set('minEnrollmentsForRating')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Курсы с меньшим числом студентов не попадают в список проблемных.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ──── PLACEMENT ──── */}
        <SectionCard
          icon={BookOpen}
          title="Placement‑тест"
          description="Базовые параметры адаптивного теста и доступных языков."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Количество вопросов по умолчанию</label>
              <Input
                type="number" min={1} max={100}
                value={form.placementDefaultQuestions ?? 25}
                onChange={e => set('placementDefaultQuestions')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Сколько вопросов проходит студент в одной сессии.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Разрешённые языки (через запятую)</label>
              <Input
                type="text"
                placeholder="Английский, Немецкий, Испанский"
                value={languagesValue}
                onChange={e => {
                  const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  set('placementAllowedLanguages')(list)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Если список пустой, тест доступен для всех языков.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ──── ПОДПИСКИ ──── */}
        <SectionCard
          icon={Crown}
          title="Подписки преподавателей"
          description="Параметры пробного периода при регистрации нового преподавателя."
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">Длительность пробного периода (дней)</label>
            <Input
              type="number" min={1} max={365}
              value={form.trialSubscriptionDays ?? 30}
              onChange={e => set('trialSubscriptionDays')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Новые преподаватели получают этот период бесплатно. После — требуется платная подписка.
            </p>
          </div>
        </SectionCard>

        {/* ──── СТУДЕНТЫ ──── */}
        <SectionCard
          icon={Users}
          title="Ограничения для студентов"
          description="Правила зачисления и активности студентов."
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">Макс. курсов на студента</label>
            <Input
              type="number" min={0}
              value={form.maxCoursesPerStudent ?? 0}
              onChange={e => set('maxCoursesPerStudent')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              0 — без ограничений. При достижении лимита студент не сможет записаться на новый курс.
            </p>
          </div>
        </SectionCard>

        {/* ──── АВТОМАТИЗАЦИЯ ──── */}
        <SectionCard
          icon={Archive}
          title="Автоматизация курсов"
          description="Правила для автоматических действий по курсам."
        >
          <div className="space-y-4">
            <div className="md:w-1/2 space-y-1">
              <label className="text-sm font-medium">
                Авто-архивация после N дней неактивности
              </label>
              <Input
                type="number" min={0}
                value={form.autoArchiveDaysAfterInactivity ?? 0}
                onChange={e => set('autoArchiveDaysAfterInactivity')(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                0 — отключено. Если у курса нет прогресса студентов дольше N дней — он уходит в архив.
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
                <div className="font-medium text-sm">Ручная модерация отзывов</div>
                <p className="text-sm text-muted-foreground">
                  Если включено, новые отзывы студентов видны публично только после одобрения администратором.
                </p>
              </div>
            </label>
          </div>
        </SectionCard>

        {/* ──── СЕРТИФИКАТЫ (глобально) ──── */}
        <SectionCard
          icon={Award}
          title="Сертификаты"
          description="Глобальные параметры выданных сертификатов. Политика требований (финальный тест, прогресс) задаётся индивидуально в настройках каждого курса."
        >
          <div className="md:w-1/2 space-y-1">
            <label className="text-sm font-medium">Срок действия сертификата (месяцев)</label>
            <Input
              type="number" min={0}
              value={form.certificateValidityMonths ?? 0}
              onChange={e => set('certificateValidityMonths')(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              0 — бессрочно. Используется для отображения даты истечения в PDF и профиле студента.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Требовать финальный тест и минимальный прогресс для выдачи сертификата —
                теперь настраивается <strong>отдельно для каждого курса</strong> в форме создания/редактирования.
                В PDF-сертификате всегда отображается результат финального теста (если он был пройден).
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ──── МОДЕРАЦИЯ ОТЗЫВОВ (INFO) ──── */}
        <SectionCard
          icon={MessageSquareWarning}
          title="Информация о разделении ответственности"
          description=""
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <strong className="text-foreground">Сертификаты курса</strong> —
                «Требовать финальный тест» и «Минимальный прогресс» задаются при создании или редактировании
                курса (вкладка «Сертификат»).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <strong className="text-foreground">Срок действия сертификата</strong> —
                глобальный параметр выше. PDF всегда содержит результат финального теста студента.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <strong className="text-foreground">Пробный период</strong> —
                выдаётся автоматически при регистрации нового преподавателя; длительность выше.
              </span>
            </li>
          </ul>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="min-w-[180px]">
            {isSaving ? 'Сохранение…' : 'Сохранить настройки'}
          </Button>
        </div>
      </form>

      <AlertModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="Ошибка"
        message={errorModal || ''}
        variant="error"
      />
      <AlertModal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="Успешно"
        message={successModal || ''}
        variant="success"
      />
    </div>
  )
}

export default AdminSettingsPage
