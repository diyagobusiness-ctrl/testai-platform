'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface SummaryStepProps {
  data: string
  onChange: (data: string) => void
}

const MAX_CHARS = 200

export default function SummaryStep({ data, onChange }: SummaryStepProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = data.length
  const isNearLimit = charCount > MAX_CHARS * 0.8
  const isAtLimit = charCount >= MAX_CHARS

  const getCounterColor = () => {
    if (isAtLimit) return 'text-red-500'
    if (isNearLimit) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Professional Summary</h2>
        <p className="mt-1 text-muted-foreground">
          Write a brief summary highlighting your strengths and career objectives.
        </p>
      </div>

      <div className="relative">
        <div
          className={cn(
            'relative rounded-xl border-2 bg-background transition-all duration-300',
            isFocused
              ? 'border-primary shadow-lg shadow-primary/10'
              : 'border-border hover:border-muted-foreground/50',
            isAtLimit && 'border-red-500/50'
          )}
        >
          <div className="flex items-start gap-3 p-4">
            <FileText
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 transition-colors duration-300',
                isFocused ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <textarea
              value={data}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  onChange(e.target.value)
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Experienced software engineer with 5+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and user-centric design..."
              rows={6}
              className={cn(
                'w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50',
                'leading-relaxed'
              )}
            />
          </div>
        </div>

        {/* Character Counter */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Tip: Keep it concise and focused on your key achievements.
          </p>
          <motion.div
            className={cn('text-sm font-medium tabular-nums', getCounterColor())}
            animate={isAtLimit ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {charCount}/{MAX_CHARS}
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors duration-300',
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-primary'
            )}
            initial={{ width: '0%' }}
            animate={{ width: `${(charCount / MAX_CHARS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-primary/30 pointer-events-none"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    </motion.div>
  )
}
