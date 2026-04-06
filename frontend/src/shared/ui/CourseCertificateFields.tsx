import { Award, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/ui/Input'

export interface CourseCertificateValues {
  requireFinalTestForCertificate: boolean
  minProgressForCertificate: number
}

interface CourseCertificateFieldsProps {
  values: CourseCertificateValues
  onChange: (field: keyof CourseCertificateValues, value: boolean | number) => void
}

/**
 * Certificate-policy section rendered inside course create/edit forms.
 * Per-course settings — decoupled from global platform config.
 */
export const CourseCertificateFields = ({ values, onChange }: CourseCertificateFieldsProps) => {
  const { t } = useTranslation('platform')
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-4.5 w-4.5 text-primary" />
        <h3 className="text-sm font-semibold">{t('sharedUi.certificate.sectionTitle')}</h3>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-muted-foreground/40 accent-primary"
          checked={values.requireFinalTestForCertificate}
          onChange={e => onChange('requireFinalTestForCertificate', e.target.checked)}
        />
        <div>
          <div className="text-sm font-medium">{t('sharedUi.certificate.requireFinalTest')}</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('sharedUi.certificate.requireFinalTestHelp')}
          </p>
        </div>
      </label>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('sharedUi.certificate.minProgressLabel')}</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={values.minProgressForCertificate}
          onChange={e => onChange('minProgressForCertificate', Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          {t('sharedUi.certificate.minProgressHelp')}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span>
          {t('sharedUi.certificate.pdfHint')}
        </span>
      </div>
    </div>
  )
}
