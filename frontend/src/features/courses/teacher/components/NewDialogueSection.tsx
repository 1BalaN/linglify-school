import { MessageCircle, Plus, X } from 'lucide-react'
import { Button, Input, VideoUpload } from '@/shared/ui'

interface DialogueOption {
  id: string
  text: string
  isCorrect: boolean
}

interface DialogueStep {
  id: string
  prompt: string
  options: DialogueOption[]
}

interface NewDialogueSectionProps {
  videoUrl: string
  steps: DialogueStep[]
  onVideoChange: (url: string) => void
  onAddStep: () => void
  onRemoveStep: (id: string) => void
  onPatchStep: (id: string, patch: Partial<DialogueStep>) => void
  onAddOption: (stepId: string) => void
  onRemoveOption: (stepId: string, optId: string) => void
  onPatchOption: (stepId: string, optId: string, patch: Partial<DialogueOption>) => void
}

export const NewDialogueSection = ({
  videoUrl,
  steps,
  onVideoChange,
  onAddStep,
  onRemoveStep,
  onPatchStep,
  onAddOption,
  onRemoveOption,
  onPatchOption,
}: NewDialogueSectionProps) => (
  <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
    <div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
      <MessageCircle className="h-4 w-4" />
      <span>Диалоговые шаги</span>
    </div>

    <VideoUpload value={videoUrl} onChange={onVideoChange} label="Видео к диалогу (по желанию)" />

    <div className="rounded-lg border border-sky-200/60 bg-sky-100/30 px-3 py-2 text-xs text-sky-700 dark:border-sky-800/30 dark:bg-sky-900/20 dark:text-sky-300">
      Добавьте реплики собеседника и варианты ответов ученика. В каждом шаге должен быть ровно
      один правильный вариант.
    </div>

    <div>
      <h4 className="mb-3 text-sm font-semibold">Шаги диалога ({steps.length})</h4>
      <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1 scroll-soft">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-start gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-600 dark:text-sky-300">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Реплика собеседника *
                  </label>
                  <textarea
                    value={step.prompt}
                    onChange={e => onPatchStep(step.id, { prompt: e.target.value })}
                    placeholder="Например: Waiter: Good evening! Do you have a reservation?"
                    className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none scroll-soft"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Варианты ответа ученика (один правильный) *
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onAddOption(step.id)}
                      className="text-[11px]"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Добавить вариант
                    </Button>
                  </div>

                  {step.options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={opt.isCorrect}
                        onChange={e => {
                          if (e.target.checked) {
                            step.options.forEach(o =>
                              onPatchOption(step.id, o.id, { isCorrect: o.id === opt.id }),
                            )
                          }
                        }}
                        className="h-4 w-4 shrink-0 text-primary"
                        name={`dialogue-${step.id}`}
                      />
                      <Input
                        value={opt.text}
                        onChange={e => onPatchOption(step.id, opt.id, { text: e.target.value })}
                        placeholder="Вариант ответа"
                        className="flex-1 text-sm"
                      />
                      {step.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveOption(step.id, opt.id)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveStep(step.id)}
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
        className="mt-3 w-full"
        variant="outline"
        size="sm"
        type="button"
        onClick={onAddStep}
      >
        <Plus className="mr-1 h-3 w-3" />
        Добавить шаг
      </Button>
    </div>
  </div>
)
