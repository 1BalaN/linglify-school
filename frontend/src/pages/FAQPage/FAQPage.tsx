import { useState, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/shared/ui'
import { useGetAllFAQsQuery } from '@/entities/faq'

const faqDataFallback = [
  {
    category: 'Общие вопросы',
    question: 'Что такое Linglify?',
    answer: 'Linglify — это современная образовательная платформа для изучения иностранных языков. Мы предлагаем интерактивные курсы, видеоуроки, упражнения и персонализированный подход к обучению.',
  },
  {
    category: 'Общие вопросы',
    question: 'Какие языки можно изучать на платформе?',
    answer: 'В настоящее время доступны курсы английского, испанского, французского, немецкого, итальянского, китайского и японского языков. Мы постоянно работаем над добавлением новых языков.',
  },
  {
    category: 'Общие вопросы',
    question: 'Нужно ли скачивать приложение?',
    answer: 'Нет, Linglify работает полностью в браузере. Однако мы планируем выпустить мобильные приложения для iOS и Android в ближайшем будущем.',
  },
]

export const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])
  const { data, isLoading } = useGetAllFAQsQuery()

  const faqData = useMemo(() => {
    if (data?.data?.items) {
      return data.data.items
        .filter(item => item.isActive)
        .map(item => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.category,
          order: item.order,
        }))
    }
    return faqDataFallback
  }, [data])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredFAQ = faqData.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = Array.from(new Set(faqData.map(item => item.category)))

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Часто задаваемые вопросы
          </h1>
          <p className="text-lg text-muted-foreground">
            Ответы на популярные вопросы о платформе Linglify
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl glass-card p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Загрузка FAQ...</p>
          </div>
        )}

        {!isLoading && categories.map(category => {
          const categoryItems = filteredFAQ.filter(
            item => item.category === category
          )
          
          if (categoryItems.length === 0) return null

          return (
            <div key={category} className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                {category}
              </h2>
              <div className="space-y-3">
                {categoryItems.map(item => {
                  const itemId: string = 'id' in item && typeof item.id === 'string' 
                    ? item.id 
                    : `temp-${faqData.indexOf(item)}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <div
                      key={itemId}
                      className="rounded-xl glass-card backdrop-blur-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-primary/5"
                      >
                        <span className="font-semibold text-foreground pr-4">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="border-t border-border/50 bg-primary/5 px-6 py-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredFAQ.length === 0 && (
          <div className="rounded-2xl glass-card p-12 text-center backdrop-blur-xl">
            <p className="text-muted-foreground">
              По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос или{' '}
              <a href="/contact" className="text-primary hover:underline">
                свяжитесь с поддержкой
              </a>
              .
            </p>
          </div>
        )}

        <div className="mt-12 rounded-2xl glass-card p-8 text-center backdrop-blur-xl">
          <h3 className="mb-3 text-xl font-bold text-foreground">
            Не нашли ответ?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Наша служба поддержки всегда готова помочь
          </p>
          <a
            href="/contact"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            Связаться с поддержкой
          </a>
        </div>
      </div>
    </div>
  )
}
