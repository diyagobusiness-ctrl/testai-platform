'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Code2,
  RotateCcw,
} from 'lucide-react'

export interface FilterState {
  search: string
  location: string
  salaryRange: [number, number]
  jobTypes: string[]
  skills: string[]
}

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
  isCollapsible?: boolean
}

const locations = [
  'All Locations',
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Remote',
  'Hybrid',
]

const jobTypes = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
  { id: 'remote', label: 'Remote' },
]

const availableSkills = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Rust',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'MongoDB',
  'PostgreSQL',
]

const defaultFilters: FilterState = {
  search: '',
  location: 'All Locations',
  salaryRange: [0, 200000],
  jobTypes: [],
  skills: [],
}

function SalarySlider({
  value,
  onChange,
}: {
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
  const min = 0
  const max = 200000
  const step = 5000

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1] - step)
    onChange([newMin, value[1]])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0] + step)
    onChange([value[0], newMax])
  }

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return `$${Math.round(val / 1000)}k`
    }
    return `$${val}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Min: {formatValue(value[0])}</span>
        <span className="text-muted-foreground">Max: {formatValue(value[1])}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-muted" />
        <motion.div
          className="absolute h-full rounded-full bg-primary"
          style={{
            left: `${(value[0] / max) * 100}%`,
            right: `${100 - (value[1] / max) * 100}%`,
          }}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
        />
      </div>
    </div>
  )
}

function FilterSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ElementType
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <motion.button
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={onToggle}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FilterPanel({ filters, onFiltersChange, className, isCollapsible = true }: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(!isCollapsible)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    search: true,
    location: true,
    salary: true,
    jobType: true,
    skills: true,
  })

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange]
  )

  const toggleJobType = useCallback(
    (typeId: string) => {
      const currentTypes = filters.jobTypes
      const newTypes = currentTypes.includes(typeId)
        ? currentTypes.filter((t) => t !== typeId)
        : [...currentTypes, typeId]
      updateFilter('jobTypes', newTypes)
    },
    [filters.jobTypes, updateFilter]
  )

  const toggleSkill = useCallback(
    (skill: string) => {
      const currentSkills = filters.skills
      const newSkills = currentSkills.includes(skill)
        ? currentSkills.filter((s) => s !== skill)
        : [...currentSkills, skill]
      updateFilter('skills', newSkills)
    },
    [filters.skills, updateFilter]
  )

  const resetFilters = useCallback(() => {
    onFiltersChange(defaultFilters)
  }, [onFiltersChange])

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.location !== 'All Locations' ? 1 : 0) +
    (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 200000 ? 1 : 0) +
    filters.jobTypes.length +
    filters.skills.length

  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-border bg-card/80 backdrop-blur-sm',
        className
      )}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <motion.span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {activeFilterCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <motion.button
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </motion.button>
          )}
          {isCollapsible && (
            <motion.button
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/50 p-4">
              {/* Search */}
              <FilterSection
                title="Search"
                icon={Search}
                isExpanded={expandedSections.search}
                onToggle={() => toggleSection('search')}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Job title or keyword..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                  {filters.search && (
                    <motion.button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateFilter('search', '')}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </FilterSection>

              {/* Location */}
              <FilterSection
                title="Location"
                icon={MapPin}
                isExpanded={expandedSections.location}
                onToggle={() => toggleSection('location')}
              >
                <div className="relative">
                  <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </FilterSection>

              {/* Salary Range */}
              <FilterSection
                title="Salary Range"
                icon={DollarSign}
                isExpanded={expandedSections.salary}
                onToggle={() => toggleSection('salary')}
              >
                <SalarySlider
                  value={filters.salaryRange}
                  onChange={(value) => updateFilter('salaryRange', value)}
                />
              </FilterSection>

              {/* Job Type */}
              <FilterSection
                title="Job Type"
                icon={Briefcase}
                isExpanded={expandedSections.jobType}
                onToggle={() => toggleSection('jobType')}
              >
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <motion.label
                      key={type.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.jobTypes.includes(type.id)}
                          onChange={() => toggleJobType(type.id)}
                          className="peer sr-only"
                        />
                        <div className={cn(
                          'h-5 w-5 rounded-md border-2 transition-colors',
                          filters.jobTypes.includes(type.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30 bg-transparent'
                        )}>
                          {filters.jobTypes.includes(type.id) && (
                            <motion.svg
                              className="h-full w-full text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.path
                                d="M5 12l5 5L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground">{type.label}</span>
                    </motion.label>
                  ))}
                </div>
              </FilterSection>

              {/* Skills */}
              <FilterSection
                title="Skills"
                icon={Code2}
                isExpanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
              >
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <motion.button
                      key={skill}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                        filters.skills.includes(skill)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </motion.button>
                  ))}
                </div>
              </FilterSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FilterPanel
