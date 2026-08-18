'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { ChallengeCard, Difficulty, Status } from './ChallengeCard'
import { Search, Filter, X } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  difficulty: Difficulty
  status: Status
  attemptCount: number
  maxScore?: number
  timeLimit?: string
}

interface ChallengeListProps {
  challenges: Challenge[]
  onChallengeClick?: (id: string) => void
  className?: string
}

const difficultyFilters: Difficulty[] = ['Easy', 'Medium', 'Hard']
const statusFilters: Status[] = ['Not Started', 'In Progress', 'Completed']

export function ChallengeList({ challenges, onChallengeClick, className }: ChallengeListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null)

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchesSearch = challenge.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty
      const matchesStatus = !selectedStatus || challenge.status === selectedStatus
      return matchesSearch && matchesDifficulty && matchesStatus
    })
  }, [challenges, searchQuery, selectedDifficulty, selectedStatus])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDifficulty(null)
    setSelectedStatus(null)
  }

  const hasActiveFilters = searchQuery || selectedDifficulty || selectedStatus

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4',
              'text-sm placeholder:text-muted-foreground',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {difficultyFilters.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() =>
                  setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)
                }
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  selectedDifficulty === difficulty
                    ? difficulty === 'Easy'
                      ? 'bg-green-500 text-white'
                      : difficulty === 'Medium'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {difficulty}
              </button>
            ))}
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  selectedStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <motion.button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <X className="h-3 w-3" />
              Clear
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              <ChallengeCard
                challenge={challenge}
                onClick={onChallengeClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredChallenges.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Search className="mb-3 h-12 w-12 opacity-50" />
          <p>No challenges found matching your criteria</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ChallengeList
