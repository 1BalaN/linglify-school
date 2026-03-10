import { useState, useEffect } from 'react'
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from '@/entities/settings/api/settingsApi'
import type { PlatformSettings } from '@/shared/types/settings'
import { Button, Input, AlertModal } from '@/shared/ui'

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

  const handleChange =
    (field: keyof PlatformSettings) =>
    (value: unknown) => {
      setForm(prev => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return

    const payload: Partial<PlatformSettings> = {
      requireFinalTestForCertificate: form.requireFinalTestForCertificate,
      minProgressForCertificate: form.minProgressForCertificate,
      lowRatingThreshold: form.lowRatingThreshold,
      minEnrollmentsForRating: form.minEnrollmentsForRating,
      placementDefaultQuestions: form.placementDefaultQuestions,
      placementAllowedLanguages: form.placementAllowedLanguages,
      // placementRecommendationMap оставляем как есть, редактирование можно добавить позже
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
          : 'Не удалось сохранить настройки платформы. Попробуйте позже.'
      setErrorModal(message)
    }
  }

  if (isLoading || !form) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Настройки платформы</h1>
        <p className="text-muted-foreground">Загрузка настроек...</p>
      </div>
    )
  }

  const languagesValue = (form.placementAllowedLanguages ?? []).join(', ')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Настройки платформы</h1>
          <p className="text-sm text-muted-foreground">
            Управление ключевыми правилами автоматизации: сертификаты, аналитика и placement‑тест.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
        <section className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold">Сертификаты</h2>
          <p className="text-sm text-muted-foreground">
            Управляет тем, когда студент может получить сертификат по курсу.
          </p>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-muted-foreground/40"
              checked={!!form.requireFinalTestForCertificate}
              onChange={event => handleChange('requireFinalTestForCertificate')(event.target.checked)}
            />
            <div>
              <div className="font-medium">Требовать финальный тест для сертификата</div>
              <p className="text-sm text-muted-foreground">
                Если включено, сертификат выдаётся только при наличии и успешном прохождении финального теста.
              </p>
            </div>
          </label>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Минимальный прогресс для сертификата (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.minProgressForCertificate ?? 100}
              onChange={event =>
                handleChange('minProgressForCertificate')(Number(event.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              При достижении этого прогресса курс считается завершённым для целей сертификата.
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold">Аналитика проблемных курсов</h2>
          <p className="text-sm text-muted-foreground">
            Пороговые значения для блока &quot;Курсы с низким рейтингом&quot; в аналитике.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Порог низкого рейтинга
              </label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={form.lowRatingThreshold ?? 2.5}
                onChange={event =>
                  handleChange('lowRatingThreshold')(Number(event.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Курсы с средним рейтингом ниже или равным этому значению считаются проблемными.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Минимум зачислений для учёта рейтинга
              </label>
              <Input
                type="number"
                min={0}
                value={form.minEnrollmentsForRating ?? 5}
                onChange={event =>
                  handleChange('minEnrollmentsForRating')(Number(event.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Курсы с меньшим количеством зачисленных студентов не попадают в список проблемных.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold">Placement‑тест</h2>
          <p className="text-sm text-muted-foreground">
            Базовые параметры адаптивного теста и доступных языков.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Количество вопросов по умолчанию
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.placementDefaultQuestions ?? 25}
                onChange={event =>
                  handleChange('placementDefaultQuestions')(Number(event.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Сколько вопросов проходит студент в одной сессии placement‑теста.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Разрешённые языки (через запятую)
              </label>
              <Input
                type="text"
                placeholder="Например: Английский, Русский, Немецкий"
                value={languagesValue}
                onChange={event => {
                  const raw = event.target.value
                  const list = raw
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean)
                  handleChange('placementAllowedLanguages')(list)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Если список пустой, placement‑тест доступен для всех языков.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
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

