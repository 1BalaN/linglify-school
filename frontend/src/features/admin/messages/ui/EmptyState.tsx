import { MessageSquare } from 'lucide-react'

type EmptyStateProps = {
  text: string
}

export const EmptyState = ({ text }: EmptyStateProps) => (
  <div className="py-8 text-center">
    <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
)