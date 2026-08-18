'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import type { Job } from './JobCard'

interface QuickApplyModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onSubmit?: (jobId: string, data: ApplicationData) => Promise<void>
}

export interface ApplicationData {
  resumeId: string
  coverLetter: string
}

interface Resume {
  id: string
  name: string
  updatedAt: string
  isDefault: boolean
}

const mockResumes: Resume[] = [
  { id: '1', name: 'Software Engineer Resume.pdf', updatedAt: '2024-01-15', isDefault: true },
  { id: '2', name: 'Full Stack Developer Resume.pdf', updatedAt: '2024-01-10', isDefault: false },
]

export function QuickApplyModal({ job, isOpen, onClose, onSubmit }: QuickApplyModalProps) {
  const [selectedResume, setSelectedResume] = useState<string>('')
  const [coverLetter, setCoverLetter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && mockResumes.length > 0) {
      const defaultResume = mockResumes.find((r) => r.isDefault) || mockResumes[0]
      setSelectedResume(defaultResume.id)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setCoverLetter('')
      setIsSuccess(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!selectedResume) {
      setError('Please select a resume')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit?.(job?.id || '', {
        resumeId: selectedResume,
        coverLetter: coverLetter.trim(),
      })
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch {
      setError('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!job) return null

  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`
    }
    return `$${amount}`
  }

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
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
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

              {/* Success State */}
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center p-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.div
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </motion.div>
                    <motion.h3
                      className="mt-4 text-xl font-semibold text-foreground"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Application Submitted!
                    </motion.h3>
                    <motion.p
                      className="mt-2 text-center text-muted-foreground"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Your application has been sent to {job.company}. Good luck!
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="border-b border-border p-6">
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-7 w-7 text-primary/60" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-foreground">Quick Apply</h2>
                          <p className="text-muted-foreground">{job.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">
                      {/* Resume Selection */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Select Resume <span className="text-red-400">*</span>
                        </label>
                        <div className="space-y-2">
                          {mockResumes.map((resume) => (
                            <motion.label
                              key={resume.id}
                              className={cn(
                                'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors',
                                selectedResume === resume.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-muted/50'
                              )}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="resume"
                                  value={resume.id}
                                  checked={selectedResume === resume.id}
                                  onChange={(e) => setSelectedResume(e.target.value)}
                                  className="peer sr-only"
                                />
                                <div className={cn(
                                  'h-5 w-5 rounded-full border-2 transition-colors flex items-center justify-center',
                                  selectedResume === resume.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/30'
                                )}>
                                  {selectedResume === resume.id && (
                                    <motion.div
                                      className="h-2 w-2 rounded-full bg-white"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    />
                                  )}
                                </div>
                              </div>
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{resume.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                  {resume.isDefault && (
                                    <span className="ml-2 text-primary">(Default)</span>
                                  )}
                                </p>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                        <motion.button
                          className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <Upload className="h-4 w-4" />
                          Upload new resume
                        </motion.button>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Cover Letter <span className="text-muted-foreground">(Optional)</span>
                        </label>
                        <textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Write a brief cover letter to stand out..."
                          rows={4}
                          className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {coverLetter.length}/500 characters
                        </p>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <motion.div
                          className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors',
                          isSubmitting
                            ? 'bg-primary/70 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90'
                        )}
                        whileHover={!isSubmitting ? { scale: 1.02, boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Briefcase className="h-5 w-5" />
                            Submit Application
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickApplyModal
