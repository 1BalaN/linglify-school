import { LucideIcon } from "lucide-react"
import React from "react"
import { Link } from "react-router-dom"

export type AdminStatItemProps = {
  id: string
  title: string
  value: number
  total: number | null
  icon: LucideIcon
  color: string
  link: string
}
export const AdminStatItem = React.memo(({title, value, total, icon: Icon, color, link}: AdminStatItemProps) => {
  return (
    <Link
      to={link}
      className="group rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {value > 0 && (
          <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
            {value}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">
          {value}
        </span>
        {total !== null && (
          <span className="text-sm text-muted-foreground">
            / {total}
          </span>
        )}
      </div>
    </Link>
  )
})