import { useMemo, useState } from 'react'
import {
  useGetCoursesQuery,
  useUpdateCourseStatusMutation,
  useDeleteCourseMutation,
} from '@/entities/course'
import type { GetCoursesQuery, Course } from '@/shared/types/course'
import { CourseStatus } from '@/shared/constants/courseStatus';


export type ModerationToast = {
  type: 'success' | 'error'
  messageKey:
    | 'toastStatusUpdated'
    | 'toastStatusError'
    | 'toastCourseDeleted'
    | 'toastDeleteError'
}

export const useAdminModeration = (initialStatus: CourseStatus | 'ALL' = 'ALL') => {
  const [selectedStatus, setSelectedStatus] =
    useState<CourseStatus | 'ALL'>(initialStatus)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<ModerationToast | null>(null)

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
      setMessage({ type: 'success', messageKey: 'toastStatusUpdated' })
    } catch {
      setMessage({ type: 'error', messageKey: 'toastStatusError' })
    } finally {
      setActionLoading(null)
    }
  }

  const removeCourse = async (id: string) => {
    try {
      setActionLoading(id)
      setMessage(null)
      await deleteCourse(id).unwrap()
      setMessage({ type: 'success', messageKey: 'toastCourseDeleted' })
    } catch {
      setMessage({ type: 'error', messageKey: 'toastDeleteError' })
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