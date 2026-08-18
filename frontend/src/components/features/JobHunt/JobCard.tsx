'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Clock,
  Building2,
  ExternalLink,
  Briefcase,
} from 'lucide-react'

export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  salaryMin: number
  salaryMax: number
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'
  skills: string[]
  postedAt: string
  description?: string
  requirements?: string[]
  benefits?: string[]
  isSaved?: boolean
  isApplied?: boolean
}

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  onApply?: (jobId: string) => void
  onViewDetails?: (job: Job) => void
  className?: string
}

const jobTypeConfig: Record<Job['jobType'], { label: string; color: string; bgColor: string }> = {
  'full-time': { label: 'Full-time', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
  'part-time': { label: 'Part-time', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  'contract': { label: 'Contract', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  'internship': { label: 'Internship', color: 'text-purple-400', bgColor: 'bg-purple-500/15 border-purple-500/30' },
  'remote': { label: 'Remote', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15 border-cyan-500/30' },
}

function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`
  }
  return `$${amount}`
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const posted = new Date(dateString)
  const diffMs = now.getTime() - posted.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

export function JobCard({ job, onSave, onApply, onViewDetails, className }: JobCardProps) {
  const typeConfig = jobTypeConfig[job.jobType]

  return (
    <motion.div
      className={cn(
        'group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm',
        'cursor-pointer overflow-hidden transition-colors duration-300',
        'hover:border-primary/40 hover:bg-card',
        job.isApplied && 'border-success/30 bg-success/5',
        className
      )}
      whileHover={{
        scale: 1.02,
        rotateX: 3,
        rotateY: -3,
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.08)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onClick={() => onViewDetails?.(job)}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Company Logo */}
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-6 w-6 text-primary/60" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{job.company}</p>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            className={cn(
              'flex-shrink-0 rounded-lg p-2 transition-colors',
              job.isSaved
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onSave?.(job.id)
            }}
          >
            {job.isSaved ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Location & Salary */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            <span>{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{timeAgo(job.postedAt)}</span>
          </div>
        </div>

        {/* Job Type Badge */}
        <div className="mt-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              typeConfig.bgColor,
              typeConfig.color
            )}
          >
            <Briefcase className="h-3 w-3" />
            {typeConfig.label}
          </span>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground border border-border/50"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="rounded-md bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground border border-border/50">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <motion.button
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              job.isApplied
                ? 'bg-success/10 text-success cursor-default'
                : 'bg-primary text-white hover:bg-primary/90'
            )}
            whileHover={!job.isApplied ? { scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' } : {}}
            whileTap={!job.isApplied ? { scale: 0.95 } : {}}
            onClick={(e) => {
              e.stopPropagation()
              if (!job.isApplied) onApply?.(job.id)
            }}
            disabled={job.isApplied}
          >
            {job.isApplied ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Applied
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Quick Apply
              </>
            )}
          </motion.button>

          <motion.button
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ x: 4 }}
          >
            View Details
            <ExternalLink className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Applied indicator */}
      {job.isApplied && (
        <div className="absolute top-0 right-0">
          <div className="h-0 w-0 border-t-[40px] border-t-success border-l-[40px] border-l-transparent" />
        </div>
      )}
    </motion.div>
  )
}

export default JobCard
