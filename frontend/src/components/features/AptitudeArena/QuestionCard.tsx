'use client'

import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  question: {
    id: string
    text: string
    options: { a: string; b: string; c: string; d: string }
  }
  selectedAnswer: string | null
  isMarkedForReview: boolean
  onSelectAnswer: (answer: string) => void
  onToggleReview: () => void
  questionNumber: number
}

export function QuestionCard({
  question,
  selectedAnswer,
  isMarkedForReview,
  onSelectAnswer,
  onToggleReview,
  questionNumber,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl border border-border bg-card p-6 shadow-xl"
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {questionNumber}
          </span>
          <h2 className="text-lg font-semibold leading-relaxed">{question.text}</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleReview}
          className={cn(
            'rounded-lg p-2 transition-colors',
            isMarkedForReview
              ? 'bg-warning/10 text-warning'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <Star className={cn('h-5 w-5', isMarkedForReview && 'fill-current')} />
        </motion.button>
      </div>

      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08 }}
            whileHover={{ scale: 1.01, x: 8 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectAnswer(key)}
            className={cn(
              'w-full text-left rounded-xl border-2 p-4 transition-all duration-200',
              selectedAnswer === key
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                : 'border-border hover:border-primary/40 hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors',
                  selectedAnswer === key
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {key.toUpperCase()}
              </span>
              <span className="text-sm">{value}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default QuestionCard
