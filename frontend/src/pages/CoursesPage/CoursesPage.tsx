import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGetCoursesQuery } from '@/entities/course'
import type { GetCoursesQuery } from '@/shared/types/course'
import { Loader2 } from 'lucide-react'
import { CoursesFilters, CatalogCourseCard } from '@/features/courses/catalog'
import { Button } from '@/shared/ui'
import { useTranslation } from 'react-i18next'

const DEFAULT_FILTERS: GetCoursesQuery = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  order: 'desc',
  isPublished: true,
}

export const CoursesPage = () => {
  const { t } = useTranslation('courses')
  const [searchParams, setSearchParams] = useSearchParams()

  const initialFiltersFromUrl: GetCoursesQuery = useMemo(() => {
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || `${DEFAULT_FILTERS.limit}`)
    const sortBy =
      (searchParams.get('sortBy') as GetCoursesQuery['sortBy']) ??
      DEFAULT_FILTERS.sortBy
    const order =
      (searchParams.get('order') as GetCoursesQuery['order']) ??
      DEFAULT_FILTERS.order
    const level = searchParams.get('level') as GetCoursesQuery['level'] | null
    const category = searchParams.get('category') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')

    const minPrice =
      minPriceParam !== null ? Number(minPriceParam) || undefined : undefined
    const maxPrice =
      maxPriceParam !== null ? Number(maxPriceParam) || undefined : undefined

    return {
      ...DEFAULT_FILTERS,
      page: Number.isNaN(page) ? DEFAULT_FILTERS.page : page,
      limit: Number.isNaN(limit) ? DEFAULT_FILTERS.limit : limit,
      sortBy,
      order,
      level: level ?? undefined,
      category,
      search,
      minPrice,
      maxPrice,
    }
  }, [searchParams])

  const [filters, setFilters] = useState<GetCoursesQuery>(initialFiltersFromUrl)

  useEffect(() => {
    setFilters(initialFiltersFromUrl)
  }, [initialFiltersFromUrl])

  const { data, isLoading, error } = useGetCoursesQuery(filters)

  const updateFilters = (next: GetCoursesQuery) => {
    setFilters(next)

    const params: Record<string, string> = {}

    if (next.page && next.page !== DEFAULT_FILTERS.page) {
      params.page = String(next.page)
    }
    if (next.limit && next.limit !== DEFAULT_FILTERS.limit) {
      params.limit = String(next.limit)
    }
    if (next.sortBy && next.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.sortBy = next.sortBy
    }
    if (next.order && next.order !== DEFAULT_FILTERS.order) {
      params.order = next.order
    }
    if (next.level) {
      params.level = next.level
    }
    if (next.category) {
      params.category = next.category
    }
    if (next.search) {
      params.search = next.search
    }
    if (typeof next.minPrice === 'number') {
      params.minPrice = String(next.minPrice)
    }
    if (typeof next.maxPrice === 'number') {
      params.maxPrice = String(next.maxPrice)
    }

    setSearchParams(params, { replace: true })
  }

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {t('catalog.title')}
            </h1>
            <p className="text-lg text-white/90">
              {t('catalog.subtitle')}
            </p>
            <div>
              <Link to="/placement-test">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  {t('catalog.placementCta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <CoursesFilters filters={filters} onChange={updateFilters} />
          </aside>

          <div className="lg:col-span-3">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              </div>
            )}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 dark:text-red-400">
                  {t('catalog.loadingError')}
                </p>
              </div>
            )}
            {data && data.data.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('catalog.notFound')}
                </p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  {t('catalog.tryFilters')}
                </p>
              </div>
            )}
            {data && data.data.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('catalog.foundTotal', { count: data.pagination.total })}{' '}
                    <span className="font-semibold">{data.pagination.total}</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {data.data.map(course => (
                    <CatalogCourseCard key={course.id} course={course} />
                  ))}
                </div>
                {data.pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(data.pagination.page - 1)}
                        disabled={data.pagination.page === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {t('catalog.prev')}
                      </button>

                      {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg border ${
                            page === data.pagination.page
                              ? 'bg-cyan-600 text-white border-cyan-600'
                              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(data.pagination.page + 1)}
                        disabled={data.pagination.page === data.pagination.totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {t('catalog.next')}
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
