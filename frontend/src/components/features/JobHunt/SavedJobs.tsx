'use client'

import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Briefcase,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import type { Job } from './JobCard'

interface SavedJobsProps {
  savedJobs: Job[]
  onUnsave?: (jobId: string) => void
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

function SavedJobCard({ job, onUnsave, onApply, onViewDetails, index }: {
  job: Job
  onUnsave?: (jobId: string) => void
  onApply?: (jobId: string) => void
  onViewDetails?: (job: Job) => void
  index: number
}) {
  const typeConfig = jobTypeConfig[job.jobType]

  return (
    <motion.div
      className={cn(
        'group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4',
        'transition-colors hover:border-primary/30 hover:bg-card',
        job.isApplied && 'border-success/20 bg-success/5'
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.05,
      }}
      layout
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-7 w-7 text-primary/60" />
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => onViewDetails?.(job)}
              >
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{job.company}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onUnsave?.(job.id)}
                title="Remove from saved"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
              <motion.button
                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onViewDetails?.(job)}
                title="View details"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Details */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
              <span>{new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Skills & Type */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                typeConfig.bgColor,
                typeConfig.color
              )}
            >
              <Briefcase className="h-3 w-3" />
              {typeConfig.label}
            </span>

            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground border border-border/50"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="rounded-md bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground border border-border/50">
                +{job.skills.length - 3}
              </span>
            )}
          </div>

          {/* Quick Apply Button */}
          <div className="mt-4">
            <motion.button
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                job.isApplied
                  ? 'bg-success/10 text-success cursor-default'
                  : 'bg-primary text-white hover:bg-primary/90'
              )}
              whileHover={!job.isApplied ? { scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' } : {}}
              whileTap={!job.isApplied ? { scale: 0.95 } : {}}
              onClick={() => !job.isApplied && onApply?.(job.id)}
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
          </div>
        </div>
      </div>

      {/* Applied indicator */}
      {job.isApplied && (
        <div className="absolute top-0 right-0">
          <div className="h-0 w-0 border-t-[30px] border-t-success border-l-[30px] border-l-transparent" />
        </div>
      )}
    </motion.div>
  )
}

export function SavedJobs({ savedJobs, onUnsave, onApply, onViewDetails, className }: SavedJobsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Saved Jobs</h2>
            <p className="text-sm text-muted-foreground">
              {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {savedJobs.length > 0 ? (
            savedJobs.map((job, index) => (
              <SavedJobCard
                key={job.id}
                job={job}
                onUnsave={onUnsave}
                onApply={onApply}
                onViewDetails={onViewDetails}
                index={index}
              />
            ))
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Bookmark className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No saved jobs yet</p>
              <p className="text-sm text-muted-foreground/70">
                Click the bookmark icon on any job to save it here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SavedJobs
