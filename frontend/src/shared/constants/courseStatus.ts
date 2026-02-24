import {
  Clock,
  Eye,
  FileCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED'

export const statusConfig: Record<
  CourseStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  DRAFT: { label: 'Черновик', color: 'yellow', icon: Clock },
  PENDING_REVIEW: { label: 'Отправлен на модерацию', color: 'amber', icon: Clock },
  IN_REVIEW: { label: 'На модерации', color: 'blue', icon: Eye },
  PUBLISHED: { label: 'Опубликован', color: 'green', icon: FileCheck },
  REJECTED: { label: 'Отклонен', color: 'red', icon: XCircle },
  ARCHIVED: { label: 'Архивирован', color: 'slate', icon: AlertCircle },
}