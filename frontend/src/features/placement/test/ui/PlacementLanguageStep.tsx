import type React from 'react'
import { Button, Input } from '@/shared/ui'
import { Loader2 } from 'lucide-react'

interface PlacementLanguageStepProps {
  language: string
  isStarting: boolean
  onLanguageChange: (value: string) => void
  onStart: (e: React.FormEvent) => void
  onBackToCourses: () => void
}

export const PlacementLanguageStep = ({
  language,
  isStarting,
  onLanguageChange,
  onStart,
  onBackToCourses,
}: PlacementLanguageStepProps) => {
  return (
    <form
      onSubmit={onStart}
      className="glass-card rounded-2xl p-6 backdrop-blur-xl space-y-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Целевой язык
        </label>
        <Input
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          placeholder="Например: Английский"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Укажите язык, по которому вы хотите пройти тест.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Примерная длительность: 15–25 минут</span>
        <span>Количество вопросов: 25</span>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToCourses}
        >
          Назад к курсам
        </Button>
        <Button type="submit" disabled={isStarting || !language.trim()}>
          {isStarting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Начать тест
        </Button>
      </div>
    </form>
  )
}

