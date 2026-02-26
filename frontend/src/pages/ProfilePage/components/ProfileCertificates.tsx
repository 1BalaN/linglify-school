import { AlertCircle, Loader2, Download } from 'lucide-react'
import { useGetMyCertificatesQuery } from '@/entities/certificate'
import { CertificateCard } from '@/features/certificate'
import { openCertificatePdf } from '@/shared/lib/certificate'

export const ProfileCertificates = () => {
  const { data, isLoading, isError } = useGetMyCertificatesQuery()
  const certificates = data?.data ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        <AlertCircle className="h-4 w-4" />
        <span>Не удалось загрузить сертификаты. Попробуйте обновить страницу.</span>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
        У вас пока нет сертификатов. Завершайте курсы и финальные тесты, чтобы получать
        подтверждение об окончании.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {certificates.map(certificate => (
        <div key={certificate.id} className="space-y-3">
          <CertificateCard certificate={certificate} />
          <div className="flex flex-wrap justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => openCertificatePdf(certificate.id)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Download className="h-3.5 w-3.5" />
              Открыть / скачать PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

