import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui'

export const MyCoursesEmptyState = () => (
  <div className="glass-card flex flex-col items-center gap-4 py-20 text-center rounded-2xl">
    <BookOpen className="h-16 w-16 text-primary/30" />
    <h2 className="text-xl font-semibold">Начните обучение</h2>
    <p className="max-w-md text-muted-foreground">
      Вы ещё не записаны ни на один курс. Найдите интересующий вас курс и начните изучение.
    </p>
    <Link to="/courses">
      <Button variant="primary">
        Каталог курсов
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  </div>
)

