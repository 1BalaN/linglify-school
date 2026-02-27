import { useUpdateCourseStatusMutation } from "@/entities/course"
import { statusConfig } from "@/shared/constants/courseStatus"
import { Course } from "@/shared/types/course"
import { Button } from "@/shared/ui"
import { Link } from "react-router-dom"

type AdminCoursesListProps = {
  courses: Course[]
  isCoursesLoading: boolean
}

export const AdminCoursesList = ({courses, isCoursesLoading}: AdminCoursesListProps) => {
  const [updateCourseStatus] = useUpdateCourseStatusMutation()  
  const handleSendToModeration = async (courseId: string) => {
    try {
      await updateCourseStatus({ id: courseId, status: 'PENDING_REVIEW' }).unwrap()
    } catch (error) {
      console.error('Ошибка при отправке на модерацию', error)
    }
  }
  return (
    <div className="rounded-2xl glass-card p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Ваши курсы</h2>
        <span className="text-xs text-muted-foreground">
          Последние {courses.length} курсов
        </span>
      </div>

      {isCoursesLoading ? (
        <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Курсов пока нет. Создайте первый курс.
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => 
            {
              const { icon: StatusIcon, label, color } = statusConfig[course.status]
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-start justify-between rounded-xl border border-border bg-background/60 px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {course.level}
                      </span>
                      <span className={`inline-flex items-center rounded-full bg-${color}-500/10 px-2 py-0.5 text-xs font-medium text-${color}-600 dark:text-${color}-300 gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                      {course.title}
                    </h3>
                    {course.shortDescription && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {course.shortDescription}
                      </p>
                    )}
                    {(course.status === 'DRAFT' || course.status === 'REJECTED') && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.preventDefault()
                          handleSendToModeration(course.id)
                        }}
                      >
                        Отправить на модерацию
                      </Button>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end justify-between gap-2">
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{course.lessonsCount} уроков</div>
                      <div>{course.enrolledCount} студентов</div>
                    </div>
                  </div>
                </Link>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}