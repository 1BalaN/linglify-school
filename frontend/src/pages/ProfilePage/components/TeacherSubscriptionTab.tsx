import { SubscriptionManagementPanel } from '@/features/subscription'

/**
 * Thin page-level wrapper — mounts the feature panel inside the Profile tab layout.
 * All business logic lives in features/subscription/ui/SubscriptionManagementPanel.
 */
export const TeacherSubscriptionTab = () => <SubscriptionManagementPanel />
