'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  MessageSquare,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Eye,
  Phone,
  Video,
  MapPin,
  ExternalLink,
  StickyNote,
} from 'lucide-react'

export type ApplicationStatus = 'applied' | 'interviewing' | 'offered' | 'rejected'

export interface ApplicationEvent {
  id: string
  type: 'applied' | 'status_change' | 'interview' | 'note' | 'email'
  title: string
  description?: string
  date: string
  status?: ApplicationStatus
}

export interface Application {
  id: string
  jobId: string
  company: string
  companyLogo?: string
  title: string
  location: string
  appliedDate: string
  status: ApplicationStatus
  events: ApplicationEvent[]
  notes?: string
}

interface ApplicationTrackerProps {
  applications: Application[]
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
  onAddNote?: (applicationId: string, note: string) => void
  className?: string
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  applied: { label: 'Applied', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30', icon: Send },
  interviewing: { label: 'Interviewing', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30', icon: MessageSquare },
  offered: { label: 'Offered', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30', icon: XCircle },
}

function TimelineEvent({ event, isLast }: { event: ApplicationEvent; isLast: boolean }) {
  const eventIcons: Record<ApplicationEvent['type'], React.ElementType> = {
    applied: Send,
    status_change: ChevronRight,
    interview: Calendar,
    note: StickyNote,
    email: MessageSquare,
  }

  const EventIcon = eventIcons[event.type]

  return (
    <motion.div
      className="relative flex gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-full w-px bg-border" />
      )}

      {/* Event icon */}
      <div className="relative z-10 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
          <EventIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{event.title}</p>
          <span className="text-xs text-muted-foreground">
            {new Date(event.date).toLocaleDateString()}
          </span>
        </div>
        {event.description && (
          <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
        )}
        {event.status && (
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              statusConfig[event.status].bgColor,
              statusConfig[event.status].color
            )}
          >
            {statusConfig[event.status].label}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function ApplicationCard({ application, onStatusChange, onAddNote }: {
  application: Application
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
  onAddNote?: (applicationId: string, note: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [noteText, setNoteText] = useState('')

  const status = statusConfig[application.status]
  const StatusIcon = status.icon

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote?.(application.id, noteText.trim())
      setNoteText('')
    }
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden transition-colors',
        'hover:border-primary/30'
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Company Logo */}
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden">
              {application.companyLogo ? (
                <img src={application.companyLogo} alt={application.company} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-primary/60">{application.company[0]}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{application.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{application.company}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{application.location}</span>
                <span className="text-border">•</span>
                <Calendar className="h-3 w-3" />
                <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.button
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  status.bgColor,
                  status.color
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
                <ChevronDown className="h-3 w-3" />
              </motion.button>

              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-border bg-card shadow-lg"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const MenuIcon = config.icon
                      return (
                        <motion.button
                          key={key}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl',
                            application.status === key ? 'bg-muted' : 'hover:bg-muted/50'
                          )}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onStatusChange?.(application.id, key as ApplicationStatus)
                            setShowStatusMenu(false)
                          }}
                        >
                          <MenuIcon className={cn('h-4 w-4', config.color)} />
                          <span className="text-foreground">{config.label}</span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-4">
              {/* Quick Actions */}
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { icon: Eye, label: 'View Job', color: 'text-blue-400' },
                  { icon: Phone, label: 'Schedule Call', color: 'text-green-400' },
                  { icon: Video, label: 'Video Interview', color: 'text-purple-400' },
                  { icon: ExternalLink, label: 'Company Site', color: 'text-orange-400' },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className={cn('h-3.5 w-3.5', action.color)} />
                    {action.label}
                  </motion.button>
                ))}
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Timeline</h4>
                <div className="space-y-0">
                  {application.events.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isLast={index === application.events.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Notes</h4>
                {application.notes && (
                  <p className="mb-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    {application.notes}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <motion.button
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                  >
                    <FileText className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ApplicationTracker({
  applications,
  onStatusChange,
  onAddNote,
  className,
}: ApplicationTrackerProps) {
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | 'all'>('all')

  const filteredApplications = activeFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === activeFilter)

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<ApplicationStatus, number>
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            activeFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFilter('all')}
        >
          All
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {applications.length}
          </span>
        </motion.button>

        {(Object.entries(statusConfig) as [ApplicationStatus, typeof statusConfig[ApplicationStatus]][]).map(
          ([key, config]) => {
            const Icon = config.icon
            const count = statusCounts[key] || 0
            return (
              <motion.button
                key={key}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  activeFilter === key
                    ? cn(config.bgColor, config.color)
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(key)}
              >
                <Icon className="h-4 w-4" />
                {config.label}
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span>
              </motion.button>
            )
          }
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onStatusChange={onStatusChange}
                onAddNote={onAddNote}
              />
            ))
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Clock className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No applications found</p>
              <p className="text-sm text-muted-foreground/70">
                {activeFilter === 'all'
                  ? "You haven't applied to any jobs yet"
                  : `No ${statusConfig[activeFilter].label.toLowerCase()} applications`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ApplicationTracker
