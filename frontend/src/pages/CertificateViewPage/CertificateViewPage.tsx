import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AlertCircle, Loader2, Download } from 'lucide-react'
import { useVerifyCertificateQuery } from '@/entities/certificate'
import { CertificateCard } from '@/features/certificate'
import { openCertificatePdf } from '@/shared/lib/certificate'

export const CertificateViewPage = () => {
  const { t } = useTranslation('platform', { keyPrefix: 'certificateViewPage' })
  const { code } = useParams<{ code: string }>()

  const {
    data,
    isLoading,
    isError,
  } = useVerifyCertificateQuery(code || '', {
    skip: !code,
  })

  if (!code) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-lg font-semibold">{t('invalidLink')}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-lg font-semibold">{t('notFound')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('notFoundBody')}</p>
        </div>
      </div>
    )
  }

  const certificate = data.data

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <CertificateCard certificate={certificate} />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => openCertificatePdf(certificate.id)}
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Download className="h-3.5 w-3.5" />
            {t('openPdf')}
          </button>
        </div>
      </div>
    </div>
  )
}

