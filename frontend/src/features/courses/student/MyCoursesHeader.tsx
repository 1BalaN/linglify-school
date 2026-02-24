import { GraduationCap } from 'lucide-react'

interface MyCoursesHeaderProps {
  total: number
}

export const MyCoursesHeader = ({ total }: MyCoursesHeaderProps) => {
  const countLabel =
    total > 0
      ? `${total} ${total === 1 ? 'курс' : total < 5 ? 'курса' : 'курсов'}`
      : 'Вы пока не записаны ни на один курс'

  return (
    <div className="mb-10 flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
        <GraduationCap className="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Моё обучение</h1>
        <p className="mt-0.5 text-muted-foreground">{countLabel}</p>
      </div>
    </div>
  )
}

