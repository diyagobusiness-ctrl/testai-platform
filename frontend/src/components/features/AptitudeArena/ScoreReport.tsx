'use client'

import { motion } from 'motion/react'
import { Trophy, CheckCircle, XCircle, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoreReportProps {
  score: number
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  unansweredCount: number
  timeTaken: number
  totalTime: number
  categoryAccuracy?: { category: string; accuracy: number }[]
  onPracticeWeak?: () => void
  onBackToDashboard?: () => void
}

export function ScoreReport({
  score,
  totalQuestions,
  correctCount,
  incorrectCount,
  unansweredCount,
  timeTaken,
  totalTime,
  categoryAccuracy = [],
  onPracticeWeak,
  onBackToDashboard,
}: ScoreReportProps) {
  const isHighScore = score >= 80

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Celebration Banner */}
      {isHighScore && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-r from-success/20 to-primary/20 p-6 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy className="mx-auto h-12 w-12 text-warning" />
          </motion.div>
          <h2 className="mt-2 text-2xl font-bold">Excellent Performance!</h2>
          <p className="text-muted-foreground">You scored above 80%. Great job!</p>
        </motion.div>
      )}

      {/* Score Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary"
          >
            <span className="text-4xl font-bold text-primary">{score}%</span>
          </motion.div>
          <h3 className="mt-4 text-xl font-semibold">Final Score</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Correct', value: correctCount, icon: CheckCircle, color: 'text-success' },
            { label: 'Wrong', value: incorrectCount, icon: XCircle, color: 'text-error' },
            { label: 'Unanswered', value: unansweredCount, icon: Target, color: 'text-muted-foreground' },
            { label: 'Time', value: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, icon: Clock, color: 'text-primary' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="rounded-xl bg-muted/50 p-4 text-center"
            >
              <stat.icon className={cn('mx-auto mb-1 h-5 w-5', stat.color)} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Category Accuracy */}
        {categoryAccuracy.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <h4 className="mb-3 font-semibold">Accuracy by Category</h4>
            <div className="space-y-2">
              {categoryAccuracy.map((cat, index) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-muted-foreground">{cat.category}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        'h-2 rounded-full',
                        cat.accuracy >= 80 ? 'bg-success' : cat.accuracy >= 50 ? 'bg-warning' : 'bg-error'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.accuracy}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{cat.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPracticeWeak}
            className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white"
          >
            Practice Weak Areas
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToDashboard}
            className="flex-1 rounded-xl border border-border py-3 font-semibold hover:bg-muted"
          >
            Back to Dashboard
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ScoreReport
