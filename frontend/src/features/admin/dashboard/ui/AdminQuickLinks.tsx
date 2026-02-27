import { adminDashboardQuickLinks } from "@/shared/constants/adminDashboardConstants"
import { Link } from "react-router-dom"

export const AdminQuickLinks = () => {
  return (
    <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Быстрый доступ
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminDashboardQuickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className={`group rounded-2xl glass-card p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 ${
                  link.badge ? 'opacity-75 hover:opacity-100' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${link.color}`}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  {link.badge && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {link.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
  )
}