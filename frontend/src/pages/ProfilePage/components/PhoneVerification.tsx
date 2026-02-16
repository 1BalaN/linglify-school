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

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Введите корректный номер телефона')
    .regex(/^\+?[0-9]{10,15}$/, 'Неверный формат номера телефона'),
})

const verifySchema = z.object({
  code: z.string().length(6, 'Код должен содержать 6 цифр'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type VerifyFormData = z.infer<typeof verifySchema>

interface PhoneVerificationProps {
  user: User
}

export const PhoneVerification = ({ user }: PhoneVerificationProps) => {
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
    resolver: zodResolver(phoneSchema),
  })

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
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
              Телефон подтвержден
            </h3>
            <p className="mt-2 text-muted-foreground">
              Ваш номер телефона: <span className="font-medium">{user.phone}</span>
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
            Подтверждение телефона
          </h3>
          <p className="text-muted-foreground mt-1">
            {codeSent
              ? 'Введите код, отправленный на ваш телефон'
              : 'Добавьте номер телефона для дополнительной безопасности'}
          </p>
        </div>
      </div>

      {!codeSent ? (
        <form onSubmit={handleSubmitPhone(onSendCode)} className="space-y-4">
          <Input
            {...registerPhone('phone')}
            type="tel"
            label="Номер телефона"
            placeholder="+7 (999) 123-45-67"
            error={phoneErrors.phone?.message}
            helperText="Введите номер в международном формате"
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSending}
          >
            <Send className="mr-2 h-4 w-4" />
            Отправить код подтверждения
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitCode(onVerify)} className="space-y-4">
          <div className="rounded-lg border border-border bg-accent/20 p-4">
            <p className="text-sm text-muted-foreground">
              Код подтверждения отправлен на номер:
            </p>
            <p className="mt-1 font-medium text-foreground">{phoneNumber}</p>
          </div>

          <Input
            {...registerCode('code')}
            type="text"
            label="Код подтверждения"
            placeholder="123456"
            error={codeErrors.code?.message}
            maxLength={6}
            helperText="6-значный код из SMS"
          />

          {verifyError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {'data' in verifyError
                ? (
                    verifyError.data as { error: { message: string } }
                  ).error.message
                : 'Произошла ошибка при подтверждении'}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Телефон успешно подтвержден!
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCodeSent(false)}
              className="flex-1"
            >
              Изменить номер
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isVerifying}
            >
              Подтвердить
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-accent/20 p-4">
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Зачем подтверждать телефон?
        </h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Дополнительная защита аккаунта</li>
          <li>• Восстановление доступа при потере пароля</li>
          <li>• Уведомления о важных событиях</li>
        </ul>
      </div>
    </div>
  )
}
