export const TeacherEarningsPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="hidden h-16 w-48 animate-pulse rounded-2xl bg-muted md:block" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {['a', 'b', 'c', 'd'].map(k => (
          <div key={k} className="h-28 animate-pulse rounded-2xl bg-muted/80" />
        ))}
      </div>
      <div className="mb-8 h-56 animate-pulse rounded-2xl bg-muted/60" />
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted/50" />
    </div>
  </div>
)
