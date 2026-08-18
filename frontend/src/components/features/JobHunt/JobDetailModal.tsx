'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  X,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Heart,
  Share2,
  Calendar,
  Users,
  Globe,
  Award,
  Target,
} from 'lucide-react'
import type { Job } from './JobCard'

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onApply?: (jobId: string) => void
  onSave?: (jobId: string) => void
  similarJobs?: Job[]
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

function SkillMatchRing({ percentage }: { percentage: number }) {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage}%
        </motion.span>
        <span className="text-[10px] text-muted-foreground">Match</span>
      </div>
    </div>
  )
}

export function JobDetailModal({ job, isOpen, onClose, onApply, onSave, similarJobs = [] }: JobDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!job) return null

  const typeConfig = jobTypeConfig[job.jobType]
  const skillMatchPercentage = Math.min(100, Math.floor((job.skills.filter(s =>
    ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL'].includes(s)
  ).length / Math.max(job.skills.length, 1)) * 100))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              ref={modalRef}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                className="absolute right-4 top-4 z-10 rounded-full bg-muted/80 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Header */}
              <div className="relative border-b border-border p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary/60" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
                        <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
                      </div>
                      <SkillMatchRing percentage={skillMatchPercentage} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}/year</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                      </div>
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center gap-3">
                  <motion.button
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-colors',
                      job.isApplied
                        ? 'bg-success/10 text-success cursor-default'
                        : 'bg-primary text-white hover:bg-primary/90'
                    )}
                    whileHover={!job.isApplied ? { scale: 1.05, boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' } : {}}
                    whileTap={!job.isApplied ? { scale: 0.95 } : {}}
                    onClick={() => !job.isApplied && onApply?.(job.id)}
                    disabled={job.isApplied}
                  >
                    {job.isApplied ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Applied
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-5 w-5" />
                        Apply Now
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-3 font-medium transition-colors',
                      job.isSaved
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSave?.(job.id)}
                  >
                    <Heart className={cn('h-5 w-5', job.isSaved && 'fill-current')} />
                    {job.isSaved ? 'Saved' : 'Save'}
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="h-5 w-5" />
                    Share
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="grid gap-6 p-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {job.description || `We are looking for a talented ${job.title} to join our team at ${job.company}. 
                      This role offers an exciting opportunity to work on challenging projects and collaborate with 
                      a team of experienced professionals. You will be responsible for designing, developing, and 
                      maintaining high-quality software solutions that meet our clients' needs.`}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Requirements</h3>
                    <ul className="mt-3 space-y-2">
                      {(job.requirements || [
                        'Strong proficiency in relevant technologies',
                        'Excellent problem-solving skills',
                        'Ability to work in a collaborative team environment',
                        'Strong communication and interpersonal skills',
                        'Experience with agile development methodologies',
                      ]).map((req, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-2 text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                          <span>{req}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Benefits</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {(job.benefits || [
                        'Competitive salary package',
                        'Health & dental insurance',
                        'Flexible working hours',
                        'Remote work options',
                        'Professional development budget',
                        'Team building events',
                      ]).map((benefit, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <Award className="h-4 w-4 text-primary" />
                          {benefit}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Skills Match */}
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="font-semibold text-foreground">Required Skills</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <motion.span
                          key={skill}
                          className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="font-semibold text-foreground">Job Information</h4>
                    <div className="mt-3 space-y-3">
                      {[
                        { icon: Briefcase, label: 'Job Type', value: typeConfig.label },
                        { icon: DollarSign, label: 'Salary Range', value: `${formatSalary(job.salaryMin)} - ${formatSalary(job.salaryMax)}` },
                        { icon: MapPin, label: 'Location', value: job.location },
                        { icon: Calendar, label: 'Posted', value: new Date(job.postedAt).toLocaleDateString() },
                        { icon: Users, label: 'Team Size', value: '10-20 people' },
                        { icon: Globe, label: 'Language', value: 'English' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similar Jobs */}
                  {similarJobs.length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="font-semibold text-foreground">Similar Jobs</h4>
                      <div className="mt-3 space-y-3">
                        {similarJobs.slice(0, 3).map((similarJob) => (
                          <motion.div
                            key={similarJob.id}
                            className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{similarJob.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{similarJob.company}</p>
                            </div>
                            <Target className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default JobDetailModal
