'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Bookmark,
  BarChart3,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  JobCard,
  JobDetailModal,
  FilterPanel,
  ApplicationTracker,
  SavedJobs,
  QuickApplyModal,
} from '@/components/features/JobHunt'
import type { Job } from '@/components/features/JobHunt/JobCard'
import type { FilterState } from '@/components/features/JobHunt/FilterPanel'
import type { Application, ApplicationStatus } from '@/components/features/JobHunt/ApplicationTracker'

type ActiveTab = 'jobs' | 'saved' | 'tracker'

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salaryMin: 120000,
    salaryMax: 180000,
    jobType: 'full-time',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: true,
    isApplied: false,
    description: 'We are looking for a Senior React Developer to join our growing engineering team. You will be responsible for building and maintaining our customer-facing web applications, working closely with designers and backend developers to deliver exceptional user experiences.',
    requirements: [
      '5+ years of experience with React and modern JavaScript',
      'Strong proficiency in TypeScript',
      'Experience with state management (Redux, Zustand, or Context)',
      'Familiarity with RESTful APIs and GraphQL',
      'Excellent problem-solving skills',
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible working hours',
      'Remote work options',
      'Professional development budget',
    ],
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salaryMin: 100000,
    salaryMax: 150000,
    jobType: 'remote',
    skills: ['JavaScript', 'Python', 'React', 'Django', 'PostgreSQL'],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: false,
    isApplied: true,
    description: 'Join our remote-first startup as a Full Stack Engineer. You will work on building scalable web applications from concept to deployment.',
  },
  {
    id: '3',
    title: 'Junior Frontend Developer',
    company: 'Digital Agency Co.',
    location: 'New York, NY',
    salaryMin: 60000,
    salaryMax: 85000,
    jobType: 'full-time',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind'],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: false,
    isApplied: false,
  },
  {
    id: '4',
    title: 'DevOps Intern',
    company: 'CloudTech Solutions',
    location: 'Austin, TX',
    salaryMin: 25,
    salaryMax: 35,
    jobType: 'internship',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Python'],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: true,
    isApplied: false,
  },
  {
    id: '5',
    title: 'Backend Developer',
    company: 'DataFlow Inc.',
    location: 'Seattle, WA',
    salaryMin: 110000,
    salaryMax: 160000,
    jobType: 'full-time',
    skills: ['Go', 'Rust', 'PostgreSQL', 'Redis', 'gRPC'],
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: false,
    isApplied: false,
  },
  {
    id: '6',
    title: 'UI/UX Designer',
    company: 'Creative Studios',
    location: 'Boston, MA',
    salaryMin: 80000,
    salaryMax: 120000,
    jobType: 'contract',
    skills: ['Figma', 'Adobe XD', 'CSS', 'Prototyping', 'User Research'],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isSaved: false,
    isApplied: false,
  },
]

const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '2',
    company: 'StartupXYZ',
    title: 'Full Stack Engineer',
    location: 'Remote',
    appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'interviewing',
    events: [
      { id: '1', type: 'applied', title: 'Application Submitted', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', type: 'status_change', title: 'Application Reviewed', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'interviewing' },
      { id: '3', type: 'interview', title: 'Technical Interview Scheduled', description: 'Video call with Engineering Lead', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    notes: 'Mentioned interest in their AI projects during initial screening.',
  },
]

const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
  { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
  { id: 'tracker', label: 'Application Tracker', icon: BarChart3 },
]

export default function JobHuntPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: 'All Locations',
    salaryRange: [0, 200000],
    jobTypes: [],
    skills: [],
  })
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 6

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !job.title.toLowerCase().includes(searchLower) &&
          !job.company.toLowerCase().includes(searchLower) &&
          !job.skills.some((s) => s.toLowerCase().includes(searchLower))
        ) {
          return false
        }
      }

      // Location filter
      if (filters.location !== 'All Locations' && job.location !== filters.location) {
        return false
      }

      // Salary filter
      if (
        job.salaryMax < filters.salaryRange[0] ||
        job.salaryMin > filters.salaryRange[1]
      ) {
        return false
      }

      // Job type filter
      if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.jobType)) {
        return false
      }

      // Skills filter
      if (filters.skills.length > 0 && !filters.skills.some((s) => job.skills.includes(s))) {
        return false
      }

      return true
    })
  }, [jobs, filters])

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    return filteredJobs.slice(startIndex, startIndex + jobsPerPage)
  }, [filteredJobs, currentPage])

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)

  const savedJobs = useMemo(() => jobs.filter((job) => job.isSaved), [jobs])

  const handleSaveJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    )
  }, [])

  const handleApplyToJob = useCallback((jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setIsApplyModalOpen(true)
    }
  }, [jobs])

  const handleViewDetails = useCallback((job: Job) => {
    setSelectedJob(job)
    setIsDetailModalOpen(true)
  }, [])

  const handleQuickApply = useCallback(async (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, isApplied: true } : job
      )
    )
    setIsApplyModalOpen(false)
  }, [])

  const handleStatusChange = useCallback((applicationId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app
        return {
          ...app,
          status: newStatus,
          events: [
            ...app.events,
            {
              id: Date.now().toString(),
              type: 'status_change' as const,
              title: `Status changed to ${newStatus}`,
              date: new Date().toISOString(),
              status: newStatus,
            },
          ],
        }
      })
    )
  }, [])

  const handleAddNote = useCallback((applicationId: string, note: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app
        return {
          ...app,
          notes: note,
          events: [
            ...app.events,
            {
              id: Date.now().toString(),
              type: 'note' as const,
              title: 'Note added',
              description: note,
              date: new Date().toISOString(),
            },
          ],
        }
      })
    )
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Job Hunt</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find your dream job and track your applications
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="flex flex-wrap gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'saved' && savedJobs.length > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {savedJobs.length}
                </span>
              )}
              {tab.id === 'tracker' && applications.length > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {applications.length}
                </span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'jobs' && (
          <motion.div
            key="jobs"
            className="flex gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filter Sidebar */}
            <div className={cn(
              'flex-shrink-0 transition-all duration-300',
              isFilterCollapsed ? 'w-16' : 'w-80'
            )}>
              <div className="sticky top-24">
                {isFilterCollapsed ? (
                  <motion.button
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFilterCollapsed(false)}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <>
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={(newFilters) => {
                        setFilters(newFilters)
                        setCurrentPage(1)
                      }}
                      isCollapsible={false}
                    />
                    <motion.button
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsFilterCollapsed(true)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Collapse
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{paginatedJobs.length}</span> of{' '}
                  <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>{filteredJobs.length} results</span>
                </div>
              </div>

              {/* Jobs Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <JobCard
                        job={job}
                        onSave={handleSaveJob}
                        onApply={handleApplyToJob}
                        onViewDetails={handleViewDetails}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {filteredJobs.length === 0 && (
                <motion.div
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs found</h3>
                  <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms</p>
                  <motion.button
                    className="mt-4 rounded-xl bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({
                      search: '',
                      location: 'All Locations',
                      salaryRange: [0, 200000],
                      jobTypes: [],
                      skills: [],
                    })}
                  >
                    Reset Filters
                  </motion.button>
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="mt-6 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-colors',
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </motion.button>
                  ))}

                  <motion.button
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SavedJobs
              savedJobs={savedJobs}
              onUnsave={handleSaveJob}
              onApply={handleApplyToJob}
              onViewDetails={handleViewDetails}
            />
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ApplicationTracker
              applications={applications}
              onStatusChange={handleStatusChange}
              onAddNote={handleAddNote}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApply={(jobId) => {
          setIsDetailModalOpen(false)
          handleApplyToJob(jobId)
        }}
        onSave={handleSaveJob}
        similarJobs={jobs.filter((j) => j.id !== selectedJob?.id).slice(0, 3)}
      />

      {/* Quick Apply Modal */}
      <QuickApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleQuickApply}
      />
    </div>
  )
}
