import { MessageSquare, Plus, X } from 'lucide-react'
import { Button, Input, VideoUpload } from '@/shared/ui'

interface FillBlank {
  id: string
  sentence: string
  blanks: string[]
  hint: string
}

interface NewInteractiveSectionProps {
  videoUrl: string
  exercises: FillBlank[]
  onVideoChange: (url: string) => void
  onAddExercise: () => void
  onRemoveExercise: (id: string) => void
  onUpdateExercise: (id: string, patch: Partial<FillBlank>) => void
}

export const NewInteractiveSection = ({
  videoUrl,
  exercises,
  onVideoChange,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}: NewInteractiveSectionProps) => (
  <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
    <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
      <MessageSquare className="h-4 w-4" />
      <span>Интерактивные упражнения</span>
    </div>

    <VideoUpload value={videoUrl} onChange={onVideoChange} label="Видео к интерактиву (по желанию)" />

    <div className="rounded-lg border border-purple-200/60 bg-purple-100/30 px-3 py-2 text-xs text-purple-700 dark:border-purple-800/30 dark:bg-purple-900/20 dark:text-purple-300">
      Обозначьте пропуск символами{' '}
      <code className="rounded bg-purple-200/50 px-1 dark:bg-purple-800/40">___</code> в
      предложении. Пример: <em>«I ___ (go) to school every day.»</em>
    </div>

    <div>
      <h4 className="mb-3 text-sm font-semibold">Упражнения ({exercises.length})</h4>
      <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1 scroll-soft">
        {exercises.map((ex, ei) => (
          <div key={ex.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-start gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                {ei + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Предложение с пропусками ___ *
                  </label>
                  <Input
                    value={ex.sentence}
                    onChange={e => {
                      const newSentence = e.target.value
                      const count = (newSentence.match(/___/g) || []).length || 1
                      const newBlanks = [...(ex.blanks || [''])]
                      while (newBlanks.length < count) newBlanks.push('')
                      onUpdateExercise(ex.id, {
                        sentence: newSentence,
                        blanks: newBlanks.slice(0, count),
                      })
                    }}
                    placeholder="I ___ to school ___ ."
                  />
                </div>
                {Array.from(
                  { length: Math.max(1, (ex.sentence.match(/___/g) || []).length) },
                  (_, bi) => (
                    <div key={bi}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Пропуск {bi + 1} * (синонимы через запятую)
                      </label>
                      <Input
                        value={(ex.blanks || [])[bi] ?? ''}
                        onChange={e => {
                          const newBlanks = [...(ex.blanks || [''])]
                          while (newBlanks.length <= bi) newBlanks.push('')
                          newBlanks[bi] = e.target.value
                          onUpdateExercise(ex.id, { blanks: newBlanks })
                        }}
                        placeholder="go, goes"
                      />
                    </div>
                  ),
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Подсказка (по желанию)
                  </label>
                  <Input
                    value={ex.hint}
                    onChange={e => onUpdateExercise(ex.id, { hint: e.target.value })}
                    placeholder="Глагол в форме Present Simple"
                  />
                </div>
              </div>
              {exercises.length > 1 && (
                <button
                  onClick={() => onRemoveExercise(ex.id)}
                  type="button"
                  className="mt-2 text-muted-foreground hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddExercise}
        type="button"
        className="mt-3 w-full"
      >
        <Plus className="mr-1 h-3 w-3" />
        Добавить упражнение
      </Button>
    </div>
  </div>
)
