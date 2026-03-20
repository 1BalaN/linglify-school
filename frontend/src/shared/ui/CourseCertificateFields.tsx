import { Award, Info } from 'lucide-react'
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
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-4.5 w-4.5 text-primary" />
        <h3 className="text-sm font-semibold">Политика сертификата</h3>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-muted-foreground/40 accent-primary"
          checked={values.requireFinalTestForCertificate}
          onChange={e => onChange('requireFinalTestForCertificate', e.target.checked)}
        />
        <div>
          <div className="text-sm font-medium">Требовать финальный тест</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Если включено, студент должен пройти урок с типом «Финальный тест» для получения
            сертификата. Результат теста всегда отображается в PDF-сертификате.
          </p>
        </div>
      </label>

      <div className="space-y-1">
        <label className="text-sm font-medium">Минимальный прогресс для сертификата (%)</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={values.minProgressForCertificate}
          onChange={e => onChange('minProgressForCertificate', Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Студент должен пройти не менее этого процента уроков курса.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span>
          PDF-сертификат всегда содержит поле «Результат финального теста».
          Если тест не требуется или студент его не проходил — поле остаётся пустым.
        </span>
      </div>
    </div>
  )
}
