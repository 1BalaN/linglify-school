import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button, Input } from '@/shared/ui'

export interface EditExerciseForm {
  id: string
  sentence: string
  blanks: string[]
  hint: string
}

interface InteractiveEditorProps {
  exercises: EditExerciseForm[]
  onAddExercise: () => void
  onRemoveExercise: (id: string) => void
  onPatchExercise: (id: string, patch: Partial<EditExerciseForm>) => void
}

export const InteractiveEditor = ({
  exercises,
  onAddExercise,
  onRemoveExercise,
  onPatchExercise,
}: InteractiveEditorProps) => (
  <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
        <MessageSquare className="h-4 w-4" />
        <span>Интерактивные упражнения ({exercises.length})</span>
      </div>
    </div>

    <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1 scroll-soft">
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
                    const newBlanks = [...ex.blanks]
                    while (newBlanks.length < count) newBlanks.push('')
                    onPatchExercise(ex.id, { sentence: newSentence, blanks: newBlanks.slice(0, count) })
                  }}
                  placeholder="I ___ to school ___ ."
                />
              </div>
              {Array.from({ length: Math.max(1, (ex.sentence.match(/___/g) || []).length) }, (_, bi) => (
                <div key={bi}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Пропуск {bi + 1} * (синонимы через запятую)
                  </label>
                  <Input
                    value={ex.blanks[bi] ?? ''}
                    onChange={e => {
                      const newBlanks = [...(ex.blanks || [])]
                      while (newBlanks.length <= bi) newBlanks.push('')
                      newBlanks[bi] = e.target.value
                      onPatchExercise(ex.id, { blanks: newBlanks })
                    }}
                    placeholder="go, goes"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Подсказка (опционально)
                </label>
                <Input
                  value={ex.hint}
                  onChange={e => onPatchExercise(ex.id, { hint: e.target.value })}
                  placeholder="Глагол в форме 1-го лица..."
                />
              </div>
            </div>
            {exercises.length > 1 && (
              <button
                onClick={() => onRemoveExercise(ex.id)}
                type="button"
                className="mt-2 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
    <Button variant="outline" size="sm" type="button" onClick={onAddExercise} className="mt-3 w-full">
      <Plus className="mr-1 h-3 w-3" />
      Добавить упражнение
    </Button>
  </div>
)
