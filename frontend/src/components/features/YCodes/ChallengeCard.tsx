'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Code2, CheckCircle, Clock, Play, Trophy } from 'lucide-react'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Status = 'Not Started' | 'In Progress' | 'Completed'

interface Challenge {
  id: string
  title: string
  difficulty: Difficulty
  status: Status
  attemptCount: number
  maxScore?: number
  timeLimit?: string
}

const difficultyConfig: Record<Difficulty, { color: string; bgColor: string; glowColor: string }> = {
  Easy: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  Medium: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
  Hard: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
}

const statusConfig: Record<Status, { color: string; bgColor: string; icon: React.ElementType }> = {
  'Not Started': {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: Play,
  },
  'In Progress': {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Clock,
  },
  Completed: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: CheckCircle,
  },
}

interface ChallengeCardProps {
  challenge: Challenge
  onClick?: (id: string) => void
  className?: string
}

export function ChallengeCard({ challenge, onClick, className }: ChallengeCardProps) {
  const difficulty = difficultyConfig[challenge.difficulty]
  const status = statusConfig[challenge.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border border-border bg-card p-5 cursor-pointer',
        'transition-colors duration-200 hover:border-primary/50',
        className
      )}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px ${difficulty.glowColor}`,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onClick={() => onClick?.(challenge.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{challenge.title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  difficulty.bgColor,
                  difficulty.color
                )}
              >
                {challenge.difficulty}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  status.bgColor,
                  status.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {challenge.status}
              </span>
            </div>
          </div>
        </div>

        {challenge.status === 'Completed' && challenge.maxScore && (
          <div className="flex items-center gap-1 text-green-500">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">{challenge.maxScore}%</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Attempts: {challenge.attemptCount}</span>
        </div>
        {challenge.timeLimit && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{challenge.timeLimit}</span>
          </div>
        )}
      </div>

      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        style={{
          background: `radial-gradient(circle at center, ${difficulty.glowColor}, transparent 70%)`,
        }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default ChallengeCard
