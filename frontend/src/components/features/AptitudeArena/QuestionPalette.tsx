'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface QuestionPaletteProps {
  totalQuestions: number
  currentQuestion: number
  answers: Record<number, string | null>
  markedForReview: Set<number>
  onSelectQuestion: (index: number) => void
}

export function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  markedForReview,
  onSelectQuestion,
}: QuestionPaletteProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answers[i] !== null && answers[i] !== undefined
          const isMarked = markedForReview.has(i)
          const isCurrent = i === currentQuestion

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectQuestion(i)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all',
                isCurrent && 'ring-2 ring-primary ring-offset-2',
                isMarked && 'bg-warning text-white',
                isAnswered && !isMarked && 'bg-success text-white',
                !isAnswered && !isMarked && 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {i + 1}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-4 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-success" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-warning" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-muted" />
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  )
}

export default QuestionPalette
