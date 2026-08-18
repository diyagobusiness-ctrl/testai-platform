'use client'

import { motion } from 'motion/react'
import { CardHover } from '@/components/animations/CardHover'
import { Code2, Play } from 'lucide-react'

export default function YCodes() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Y-Codes</span> Challenges
        </h1>
        <p className="mt-2 text-muted-foreground">Solve coding challenges to improve your skills.</p>
      </motion.div>

      <CardHover intensity="medium">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-green-500/10">
            <Code2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Coding Challenges</h2>
          <p className="mt-2 text-muted-foreground">Practice coding problems in multiple languages</p>
          <motion.button
            className="mt-6 rounded-xl bg-green-500 px-8 py-3 font-semibold text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="mr-2 inline h-4 w-4" /> Start Coding
          </motion.button>
        </div>
      </CardHover>
    </div>
  )
}
