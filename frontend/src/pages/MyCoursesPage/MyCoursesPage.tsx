import { Link } from 'react-router-dom'
import { useGetUserCoursesQuery } from '@/entities/course'
import { AlertCircle, Loader2, BookOpen } from 'lucide-react'
import { Button } from '@/shared/ui'
import { MyCoursesHeader, MyCoursesEmptyState, MyCourseCard } from '@/features/courses/student'

export const MyCoursesPage = () => {
  const { data, isLoading, isError } = useGetUserCoursesQuery()

  const enrollments = data?.data ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка курсов...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-lg font-semibold">Не удалось загрузить курсы</p>
          <p className="mt-1 text-muted-foreground">Попробуйте обновить страницу</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <MyCoursesHeader total={enrollments.length} />

        {enrollments.length === 0 ? (
          <MyCoursesEmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(enrollment => (
              <MyCourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
        {enrollments.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/courses">
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Найти ещё курсы
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
