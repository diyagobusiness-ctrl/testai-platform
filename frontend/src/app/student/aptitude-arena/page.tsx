'use client'

import { motion } from 'motion/react'
import { CardHover } from '@/components/animations/CardHover'
import { Brain, Play } from 'lucide-react'

export default function AptitudeArena() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Aptitude</span> Arena
        </h1>
        <p className="mt-2 text-muted-foreground">Test your aptitude with timed practice exams.</p>
      </motion.div>

      <CardHover intensity="medium">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-500/10">
            <Brain className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Practice Tests</h2>
          <p className="mt-2 text-muted-foreground">Quantitative, Logical Reasoning, and Verbal Ability</p>
          <motion.button
            className="mt-6 rounded-xl bg-red-500 px-8 py-3 font-semibold text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="mr-2 inline h-4 w-4" /> Start Test
          </motion.button>
        </div>
      </CardHover>
    </div>
  )
}
