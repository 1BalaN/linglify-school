import { SubscriptionManagementPanel } from '@/features/subscription'

/**
 * Standalone /teacher/subscription page.
 * All business logic lives in features/subscription/ui/SubscriptionManagementPanel.
 */
export const TeacherSubscriptionPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <SubscriptionManagementPanel />
    </div>
  </div>
)

export default TeacherSubscriptionPage
