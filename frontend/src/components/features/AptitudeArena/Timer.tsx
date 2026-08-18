'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface TimerProps {
  totalSeconds: number
  onTimeUp: () => void
  isRunning: boolean
}

export function Timer({ totalSeconds, onTimeUp, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  const percentage = (remaining / totalSeconds) * 100

  const colorClass = useMemo(() => {
    if (percentage > 25) return 'text-success'
    if (percentage > 10) return 'text-warning'
    return 'text-error'
  }, [percentage])

  const isUrgent = percentage <= 10

  useEffect(() => {
    if (!isRunning) return

    if (remaining <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, remaining, onTimeUp])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      className={cn('relative flex items-center gap-3', isUrgent && 'animate-pulse')}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            className={colorClass}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-bold tabular-nums', colorClass)}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium">Time Remaining</p>
        <p className={cn('text-xs', colorClass)}>
          {isUrgent ? 'Hurry up!' : `${minutes} min ${seconds} sec`}
        </p>
      </div>
    </motion.div>
  )
}

export default Timer
