import { Course } from '@/shared/types/course'
import { CourseModerationCard } from './CourseModerationCard'
import { CourseStatus } from '@/shared/constants/courseStatus'

type CoursesListProps = {
  courses: Course[]
  isLoading: boolean
  actionLoading: string | null
  onStatusChange: (id: string, status: CourseStatus) => void
  onDelete: (id: string) => void
}

export const CoursesList = ({
  courses,
  isLoading,
  actionLoading,
  onStatusChange,
  onDelete,
}: CoursesListProps) => {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="glass-card py-12 text-center">
        <p className="text-muted-foreground">Курсов с таким статусом нет</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map(course => (
        <CourseModerationCard
          key={course.id}
          course={course}
          loading={actionLoading === course.id}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}