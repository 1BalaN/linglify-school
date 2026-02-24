import { useState } from 'react'
import type { GetCoursesQuery, CourseLevel } from '@/shared/types/course'
import { COURSE_CATEGORIES } from '@/shared/constants/courseCategories'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface CoursesFiltersProps {
  filters: GetCoursesQuery
  onChange: (filters: GetCoursesQuery) => void
}

const levels: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const categories = [...COURSE_CATEGORIES]

export const CoursesFilters = ({ filters, onChange }: CoursesFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleLevelChange = (level: CourseLevel) => {
    onChange({
      ...filters,
      level: filters.level === level ? undefined : level,
      page: 1,
    })
  }

  const handleCategoryChange = (category: string) => {
    onChange({
      ...filters,
      category: filters.category === category ? undefined : category,
      page: 1,
    })
  }

  const handleSearchClear = () => {
    setSearchInput('')
    onChange({
      ...filters,
      search: undefined,
      page: 1,
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange({
      ...filters,
      search: searchInput || undefined,
      page: 1,
    })
  }

  const handlePriceChange = (type: 'free' | 'paid') => {
    const isFreeActive = filters.minPrice === 0 && filters.maxPrice === 0
    const isPaidActive =
      !!(filters.minPrice && filters.minPrice > 0) && filters.maxPrice === undefined

    if (type === 'free') {
      if (isFreeActive) {
        onChange({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
          page: 1,
        })
      } else {
        onChange({
          ...filters,
          minPrice: 0,
          maxPrice: 0,
          page: 1,
        })
      }
    } else {
      if (isPaidActive) {
        onChange({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
          page: 1,
        })
      } else {
        onChange({
          ...filters,
          minPrice: 1,
          maxPrice: undefined,
          page: 1,
        })
      }
    }
  }

  const handleSortChange = (sortBy: GetCoursesQuery['sortBy']) => {
    onChange({
      ...filters,
      sortBy,
      page: 1,
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    onChange({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      order: 'desc',
      isPublished: true,
    })
  }

  const hasActiveFilters =
    filters.level ||
    filters.category ||
    filters.search ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined

  return (
    <div className="glass-card sticky top-4 rounded-md p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Фильтры</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground lg:hidden"
        >
          {isExpanded ? 'Скрыть' : 'Показать'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-5">
          {/* Search */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Поиск курсов..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                aria-label="Выполнить поиск"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchInput && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Очистить поиск"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </form>

          {/* Level */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Уровень
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {levels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelChange(level)}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    filters.level === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Категория
            </h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filters.category === category
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Цена
            </h3>
            <div className="space-y-1">
              {[
                { type: 'free' as const, label: 'Бесплатные', active: filters.minPrice === 0 && filters.maxPrice === 0 },
                {
                  type: 'paid' as const,
                  label: 'Платные',
                  active: !!(filters.minPrice && filters.minPrice > 0),
                },
              ].map(({ type, label, active }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePriceChange(type)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Сортировка
            </h3>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e =>
                  handleSortChange(e.target.value as GetCoursesQuery['sortBy'])
                }
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="createdAt">Новые</option>
                <option value="updatedAt">Недавно обновленные</option>
                <option value="title">По названию</option>
                <option value="price">По цене</option>
                <option value="enrolledCount">По популярности</option>
                <option value="averageRating">По рейтингу</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  )
}

