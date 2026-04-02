import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
} from '@/entities/user'
import { useDispatch } from 'react-redux'
import { setUser } from '@/entities/user'
import { Button, Input } from '@/shared/ui'
import type { User } from '@/shared/types/user'
import { useState } from 'react'
import { CheckCircle, Phone as PhoneIcon, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const createPhoneSchema = (t: (key: string) => string) =>
  z.object({
    phone: z
      .string()
      .min(10, t('phone.validation.invalidPhone'))
      .regex(/^\+?[0-9]{10,15}$/, t('phone.validation.phoneFormat')),
  })

const createVerifySchema = (t: (key: string) => string) =>
  z.object({
    code: z.string().length(6, t('phone.validation.codeLen')),
  })

type PhoneFormData = z.infer<ReturnType<typeof createPhoneSchema>>
type VerifyFormData = z.infer<ReturnType<typeof createVerifySchema>>

interface PhoneVerificationProps {
  user: User
}

export const PhoneVerification = ({ user }: PhoneVerificationProps) => {
  const { t } = useTranslation('profile')
  const dispatch = useDispatch()
  const [sendVerification, { isLoading: isSending }] =
    useSendPhoneVerificationMutation()
  const [verifyPhone, { isLoading: isVerifying, error: verifyError }] =
    useVerifyPhoneMutation()
  const [codeSent, setCodeSent] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(createPhoneSchema(t)),
  })

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(createVerifySchema(t)),
  })

  const onSendCode = async (data: PhoneFormData) => {
    try {
      await sendVerification({ phone: data.phone }).unwrap()
      setPhoneNumber(data.phone)
      setCodeSent(true)
    } catch (err) {
      console.error('Send verification error:', err)
    }
  }

  const onVerify = async (data: VerifyFormData) => {
    try {
      const result = await verifyPhone({
        phone: phoneNumber,
        code: data.code,
      }).unwrap()
      dispatch(setUser(result.data))
      setSuccess(true)
      setCodeSent(false)
    } catch (err) {
      console.error('Verify phone error:', err)
    }
  }

  if (user.isPhoneVerified) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
              {t('phone.verifiedTitle')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t('phone.verifiedNumber')} <span className="font-medium">{user.phone}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <PhoneIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gradient">
            {t('phone.title')}
          </h3>
          <p className="text-muted-foreground mt-1">
            {codeSent
              ? t('phone.subtitleCode')
              : t('phone.subtitleStart')}
          </p>
        </div>
      </div>

      {!codeSent ? (
        <form onSubmit={handleSubmitPhone(onSendCode)} className="space-y-4">
          <Input
            {...registerPhone('phone')}
            type="tel"
            label={t('phone.phoneLabel')}
            placeholder={t('phone.phonePlaceholder')}
            error={phoneErrors.phone?.message}
            helperText={t('phone.phoneHint')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSending}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('phone.sendCode')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitCode(onVerify)} className="space-y-4">
          <div className="rounded-lg border border-border bg-accent/20 p-4">
            <p className="text-sm text-muted-foreground">
              {t('phone.codeSentTo')}
            </p>
            <p className="mt-1 font-medium text-foreground">{phoneNumber}</p>
          </div>

          <Input
            {...registerCode('code')}
            type="text"
            label={t('phone.codeLabel')}
            placeholder="123456"
            error={codeErrors.code?.message}
            maxLength={6}
            helperText={t('phone.codeHint')}
          />

          {verifyError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {'data' in verifyError
                ? (
                    verifyError.data as { error: { message: string } }
                  ).error.message
                : t('phone.verifyError')}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {t('phone.verifySuccess')}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCodeSent(false)}
              className="flex-1"
            >
              {t('phone.changeNumber')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isVerifying}
            >
              {t('phone.confirm')}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-accent/20 p-4">
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          {t('phone.whyTitle')}
        </h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {(t('phone.whyItems', { returnObjects: true }) as string[]).map(item => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
