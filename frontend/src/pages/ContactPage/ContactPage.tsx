import { ContactForm, ContactInfoPanel } from '@/features/contact'


export const ContactPage = () => {
  

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Свяжитесь с нами
          </h1>
          <p className="text-lg text-muted-foreground">
            Мы всегда рады помочь и ответить на ваши вопросы
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <ContactInfoPanel />

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
