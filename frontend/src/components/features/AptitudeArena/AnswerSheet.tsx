'use client'

import { motion } from 'motion/react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Answer {
  questionId: string
  questionText: string
  yourAnswer: string | null
  correctAnswer: string
  explanation: string
  options: { a: string; b: string; c: string; d: string }
  difficulty: string
  isCorrect: boolean
  timeTaken: number
}

interface AnswerSheetProps {
  answers: Answer[]
}

export function AnswerSheet({ answers }: AnswerSheetProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Detailed Answer Sheet</h3>
      {answers.map((answer, index) => (
        <motion.div
          key={answer.questionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'rounded-xl border-2 p-5',
            answer.isCorrect ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
          )}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              {answer.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-error" />
              )}
              <span className="font-semibold">Q{index + 1}</span>
              <span className={cn(
                'rounded px-2 py-0.5 text-xs font-medium',
                answer.difficulty === 'EASY' && 'bg-success/10 text-success',
                answer.difficulty === 'MEDIUM' && 'bg-warning/10 text-warning',
                answer.difficulty === 'HARD' && 'bg-error/10 text-error'
              )}>
                {answer.difficulty}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{answer.timeTaken}s</span>
          </div>

          <p className="mb-4 text-sm">{answer.questionText}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Your Answer</p>
              <p className={cn('font-medium', answer.isCorrect ? 'text-success' : 'text-error')}>
                {answer.yourAnswer ? `${answer.yourAnswer.toUpperCase()}) ${answer.options[answer.yourAnswer as keyof typeof answer.options]}` : 'Not answered'}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Correct Answer</p>
              <p className="font-medium text-success">
                {answer.correctAnswer.toUpperCase()}) {answer.options[answer.correctAnswer as keyof typeof answer.options]}
              </p>
            </div>
          </div>

          {answer.explanation && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p>{answer.explanation}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default AnswerSheet
