import { AdminStatItem, AdminStatItemProps } from "./AdminStatItem"

type AdminStatsGridProps = {
  stats: AdminStatItemProps[]
}
  
export const AdminStatsGrid = ({stats}: AdminStatsGridProps) => {
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) =>  (<AdminStatItem key={stat.id} {...stat} />))}
    </div>
  )
}