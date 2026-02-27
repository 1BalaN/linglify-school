import { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormFieldProps {
  label: string
  error?: string
  success?: boolean
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
}

export const FormField = ({
  label,
  error,
  success,
  required,
  hint,
  children,
  className = '',
}: FormFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      
      {children}
      
      {/* Hint text */}
      {hint && !error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {hint}
        </p>
      )}
      
      {/* Success indicator */}
      {success && !error && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Корректно
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
