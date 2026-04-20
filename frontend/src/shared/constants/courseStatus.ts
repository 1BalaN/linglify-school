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

/** i18n key under platform.admin.courseStatusShort */
export const statusConfig: Record<
  CourseStatus,
  { labelKey: CourseStatus; color: string; icon: typeof Clock }
> = {
  DRAFT: { labelKey: 'DRAFT', color: 'yellow', icon: Clock },
  PENDING_REVIEW: { labelKey: 'PENDING_REVIEW', color: 'amber', icon: Clock },
  IN_REVIEW: { labelKey: 'IN_REVIEW', color: 'blue', icon: Eye },
  PUBLISHED: { labelKey: 'PUBLISHED', color: 'green', icon: FileCheck },
  REJECTED: { labelKey: 'REJECTED', color: 'red', icon: XCircle },
  ARCHIVED: { labelKey: 'ARCHIVED', color: 'slate', icon: AlertCircle },
}
