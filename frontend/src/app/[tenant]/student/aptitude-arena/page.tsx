'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Brain, Timer, Trophy, BarChart3, ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { mockQuestions } from '@/data/aptitude-questions'
import {
  QuestionCard,
  QuestionPalette,
  Timer as CountdownTimer,
  ProgressBar,
  ScoreReport,
  AnswerSheet,
  AnalyticsChart,
} from '@/components/features/AptitudeArena'

type Category = 'QUANTITATIVE' | 'LOGICAL_REASONING' | 'VERBAL_ABILITY'
type Mode = 'PRACTICE' | 'EXAM'
type View = 'SELECT' | 'EXAM' | 'RESULTS' | 'ANSWERS' | 'ANALYTICS'

const categories = [
  { key: 'QUANTITATIVE' as Category, label: 'Quantitative Aptitude', icon: '📐' },
  { key: 'LOGICAL_REASONING' as Category, label: 'Logical Reasoning', icon: '🧠' },
  { key: 'VERBAL_ABILITY' as Category, label: 'Verbal Ability', icon: '📝' },
]

export default function AptitudeArenaPage() {
  const router = useRouter()
  const { tenant } = useAuth()
  const [view, setView] = useState<View>('SELECT')
  const [selectedCategory, setSelectedCategory] = useState<Category>('QUANTITATIVE')
  const [mode, setMode] = useState<Mode>('PRACTICE')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | null>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const filteredQuestions = mockQuestions.filter((q) => q.category === selectedCategory)
  const questions = filteredQuestions.length > 0 ? filteredQuestions : mockQuestions

  const handleSelectAnswer = useCallback((answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
  }, [currentQuestion])

  const handleToggleReview = useCallback(() => {
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion)) {
        next.delete(currentQuestion)
      } else {
        next.add(currentQuestion)
      }
      return next
    })
  }, [currentQuestion])

  const handleStartExam = () => {
    setView('EXAM')
    setCurrentQuestion(0)
    setAnswers({})
    setMarkedForReview(new Set())
    setIsTimerRunning(true)
  }

  const handleSubmit = () => {
    setIsTimerRunning(false)
    let correctCount = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount++
    })
    setScore(Math.round((correctCount / questions.length) * 100))
    setView('RESULTS')
  }

  const handleTimeUp = () => {
    handleSubmit()
  }

  const handleNext = useCallback(() => {
    setCurrentQuestion((prev) => {
      if (prev < questions.length - 1) return prev + 1
      return prev
    })
  }, [questions.length])

  const handlePrev = useCallback(() => {
    setCurrentQuestion((prev) => {
      if (prev > 0) return prev - 1
      return prev
    })
  }, [])

  const handleBack = () => {
    router.push(`/${tenant}/student/dashboard`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aptitude Arena</h1>
              <p className="text-muted-foreground">Practice quantitative, logical reasoning, and verbal ability</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Selection View */}
        {view === 'SELECT' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Category Tabs */}
            <div className="flex gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    'flex-1 rounded-xl border-2 p-4 text-left transition-all',
                    selectedCategory === cat.key
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="mt-2 font-semibold">{cat.label}</p>
                </motion.button>
              ))}
            </div>

            {/* Mode Selection */}
            <div className="flex gap-4">
              {(['PRACTICE', 'EXAM'] as Mode[]).map((m) => (
                <motion.button
                  key={m}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 rounded-xl border-2 p-4 text-center transition-all',
                    mode === m
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  {m === 'PRACTICE' ? (
                    <>
                      <Timer className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-2 font-semibold">Practice Mode</p>
                      <p className="text-xs text-muted-foreground">Unlimited time, see answers immediately</p>
                    </>
                  ) : (
                    <>
                      <Trophy className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-2 font-semibold">Exam Mode</p>
                      <p className="text-xs text-muted-foreground">Timed, no review until submit</p>
                    </>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartExam}
              className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg"
            >
              Start {mode === 'EXAM' ? 'Exam' : 'Practice'}
            </motion.button>
          </motion.div>
        )}

        {/* Exam View */}
        {view === 'EXAM' && (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <ProgressBar
                current={currentQuestion}
                total={questions.length}
                answered={Object.keys(answers).length}
              />
              {mode === 'EXAM' && (
                <CountdownTimer
                  totalSeconds={questions.length * 60}
                  onTimeUp={handleTimeUp}
                  isRunning={isTimerRunning}
                />
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              {/* Question */}
              <div>
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={questions[currentQuestion].id}
                    question={questions[currentQuestion]}
                    selectedAnswer={answers[currentQuestion] || null}
                    isMarkedForReview={markedForReview.has(currentQuestion)}
                    onSelectAnswer={handleSelectAnswer}
                    onToggleReview={handleToggleReview}
                    questionNumber={currentQuestion + 1}
                  />
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-4 flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white disabled:opacity-50"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <QuestionPalette
                  totalQuestions={questions.length}
                  currentQuestion={currentQuestion}
                  answers={answers}
                  markedForReview={markedForReview}
                  onSelectQuestion={setCurrentQuestion}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-success py-3 font-bold text-white"
                >
                  <Send className="mr-2 inline h-4 w-4" />
                  Submit All
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results View */}
        {view === 'RESULTS' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('ANSWERS')}
                className="rounded-xl border border-border px-4 py-2"
              >
                View Answer Sheet
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('ANALYTICS')}
                className="rounded-xl border border-border px-4 py-2"
              >
                <BarChart3 className="mr-2 inline h-4 w-4" />
                Analytics
              </motion.button>
            </div>
            <ScoreReport
              score={score}
              totalQuestions={questions.length}
              correctCount={Math.round((score / 100) * questions.length)}
              incorrectCount={questions.length - Math.round((score / 100) * questions.length) - 2}
              unansweredCount={2}
              timeTaken={180}
              totalTime={questions.length * 60}
              categoryAccuracy={[
                { category: 'Quantitative', accuracy: 85 },
                { category: 'Logical', accuracy: 70 },
                { category: 'Verbal', accuracy: 90 },
              ]}
              onPracticeWeak={() => setView('SELECT')}
              onBackToDashboard={() => setView('SELECT')}
            />
          </motion.div>
        )}

        {/* Answer Sheet View */}
        {view === 'ANSWERS' && (
          <motion.div
            key="answers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('RESULTS')}
              className="mb-4 flex items-center gap-2 text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Results
            </motion.button>
            <AnswerSheet
              answers={questions.map((q, i) => ({
                questionId: q.id,
                questionText: q.text,
                yourAnswer: answers[i] || null,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                options: q.options,
                difficulty: q.difficulty,
                isCorrect: answers[i] === q.correctAnswer,
                timeTaken: 30 + Math.floor(Math.random() * 40),
              }))}
            />
          </motion.div>
        )}

        {/* Analytics View */}
        {view === 'ANALYTICS' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('RESULTS')}
              className="mb-4 flex items-center gap-2 text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Results
            </motion.button>
            <AnalyticsChart
              data={{
                scoreProgression: [
                  { date: 'Week 1', score: 55 },
                  { date: 'Week 2', score: 62 },
                  { date: 'Week 3', score: 58 },
                  { date: 'Week 4', score: 71 },
                  { date: 'Week 5', score: 78 },
                  { date: 'Week 6', score: score || 82 },
                ],
                categoryAccuracy: [
                  { category: 'Quantitative', accuracy: 85 },
                  { category: 'Logical', accuracy: 70 },
                  { category: 'Verbal', accuracy: 90 },
                ],
                performanceVsAverage: [
                  { metric: 'Speed', you: 80, average: 65 },
                  { metric: 'Accuracy', you: score || 82, average: 70 },
                  { metric: 'Difficulty', you: 75, average: 60 },
                ],
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
