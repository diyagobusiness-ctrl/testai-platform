'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Plus, X, Wrench, Star } from 'lucide-react'

export interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

interface SkillsStepProps {
  data: Skill[]
  onChange: (data: Skill[]) => void
}

const proficiencyLevels: Skill['level'][] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
]

const levelColors: Record<Skill['level'], string> = {
  Beginner: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  Advanced: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  Expert: 'bg-green-500/10 text-green-500 border-green-500/30',
}

const levelDots: Record<Skill['level'], number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

export default function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<Skill['level']>('Intermediate')

  const addSkill = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || data.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...data, { name: trimmed, level: selectedLevel }])
    setInputValue('')
  }

  const removeSkill = (name: string) => {
    onChange(data.filter((s) => s.name !== name))
  }

  const updateSkillLevel = (name: string, level: Skill['level']) => {
    onChange(data.map((s) => (s.name === name ? { ...s, level } : s)))
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
        <h2 className="text-2xl font-bold">Skills</h2>
        <p className="mt-1 text-muted-foreground">
          Add your technical and soft skills with proficiency levels.
        </p>
      </div>

      {/* Proficiency Level Selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Star className="h-4 w-4" />
          Default Proficiency Level
        </label>
        <div className="flex flex-wrap gap-2">
          {proficiencyLevels.map((level) => (
            <motion.button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={cn(
                'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all duration-200',
                selectedLevel === level
                  ? levelColors[level]
                  : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        i < levelDots[level]
                          ? 'bg-current'
                          : 'bg-current opacity-30'
                      )}
                    />
                  ))}
                </div>
                {level}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill()
              }
            }}
            placeholder="Type a skill and press Enter..."
            className="w-full rounded-xl border-2 border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/10 hover:border-muted-foreground/50"
          />
        </div>
        <motion.button
          onClick={addSkill}
          disabled={!inputValue.trim()}
          className={cn(
            'rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
          whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Skills Grid */}
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {data.map((skill) => (
            <motion.div
              key={skill.name}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              <div
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-4 py-2.5',
                  levelColors[skill.level]
                )}
              >
                <span className="text-sm font-medium">{skill.name}</span>

                {/* Level Selector Dropdown */}
                <div className="relative">
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      updateSkillLevel(skill.name, e.target.value as Skill['level'])
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  >
                    {proficiencyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          i < levelDots[skill.level]
                            ? 'bg-current'
                            : 'bg-current opacity-30'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => removeSkill(skill.name)}
                  className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {data.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No skills added yet. Start typing above to add your first skill.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {data.length} skill{data.length !== 1 ? 's' : ''} added
      </p>
    </motion.div>
  )
}
