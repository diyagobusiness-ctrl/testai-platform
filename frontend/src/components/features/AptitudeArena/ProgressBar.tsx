'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  current: number
  total: number
  answered: number
}

export function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const completionPercentage = (answered / total) * 100
  const positionPercentage = ((current + 1) / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {current + 1} of {total}
        </span>
        <span className="font-medium text-primary">
          {answered} answered
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow"
          initial={{ left: 0 }}
          animate={{ left: `${positionPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>{Math.round(completionPercentage)}% complete</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export default ProgressBar
