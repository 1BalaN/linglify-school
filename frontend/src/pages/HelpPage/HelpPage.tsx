import { Link } from 'react-router-dom'
import { BookOpen, Video, FileText, Users, Award, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const HELP_ICONS = [BookOpen, Video, FileText, Users, Award, Settings] as const

type HelpTopic = {
  title: string
  description: string
  items: string[]
}

export const HelpPage = () => {
  const { t } = useTranslation('support')
  const topics = t('help.topics', { returnObjects: true }) as HelpTopic[]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            {t('help.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('help.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((card, index) => {
            const Icon = HELP_ICONS[index] ?? BookOpen
            return (
              <div
                key={card.title}
                className="rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{card.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{card.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {card.items.map(item => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            {t('help.contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  )
}
