import { useMemo, useState } from 'react'
import {
  useGetCoursesQuery,
  useUpdateCourseStatusMutation,
  useDeleteCourseMutation,
} from '@/entities/course'
import type { GetCoursesQuery, Course } from '@/shared/types/course'
import { CourseStatus } from '@/shared/constants/courseStatus';


type Message = { type: 'success' | 'error'; text: string }

export const useAdminModeration = () => {
  const [selectedStatus, setSelectedStatus] =
    useState<CourseStatus | 'ALL'>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)

  const filters: GetCoursesQuery = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc',
  }

  const { data, isLoading } = useGetCoursesQuery(filters)
  const [updateStatus] = useUpdateCourseStatusMutation()
  const [deleteCourse] = useDeleteCourseMutation()

  const courses = useMemo(
    () => (data?.data || []) as (Course & { status: CourseStatus })[],
    [data]
  )

  const filteredCourses = useMemo(() => {
    if (selectedStatus === 'ALL') return courses
    return courses.filter(c => c.status === selectedStatus)
  }, [courses, selectedStatus])

  const stats = useMemo(() => {
    const base: Record<CourseStatus | 'ALL', number> = {
      ALL: courses.length,
      DRAFT: 0,
      PENDING_REVIEW: 0,
      IN_REVIEW: 0,
      PUBLISHED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    }

    courses.forEach(c => base[c.status]++)
    return base
  }, [courses])

  const changeStatus = async (id: string, status: CourseStatus, comment?: string) => {
    try {
      setActionLoading(id)
      setMessage(null)
      await updateStatus({ id, status, ...(comment ? { comment } : {}) }).unwrap()
      setMessage({ type: 'success', text: 'Статус обновлён' })
    } catch {
      setMessage({ type: 'error', text: 'Ошибка обновления' })
    } finally {
      setActionLoading(null)
    }
  }

  const removeCourse = async (id: string) => {
    try {
      setActionLoading(id)
      setMessage(null)
      await deleteCourse(id).unwrap()
      setMessage({ type: 'success', text: 'Курс удалён' })
    } catch {
      setMessage({ type: 'error', text: 'Ошибка удаления' })
    } finally {
      setActionLoading(null)
    }
  }

  return {
    isLoading,
    selectedStatus,
    setSelectedStatus,
    courses: filteredCourses,
    stats,
    actionLoading,
    message,
    changeStatus,
    removeCourse,
  }
}