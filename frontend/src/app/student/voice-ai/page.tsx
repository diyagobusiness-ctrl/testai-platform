'use client'

import { motion } from 'motion/react'
import { CardHover } from '@/components/animations/CardHover'
import { Mic, Circle, Play, Square } from 'lucide-react'
import { useState } from 'react'

export default function VoiceAI() {
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Voice AI</span> Practice
        </h1>
        <p className="mt-2 text-muted-foreground">Practice speaking with AI-powered feedback.</p>
      </motion.div>

      <CardHover intensity="medium">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-16 w-16 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Start a Session</h2>
          <p className="mt-2 text-muted-foreground">Click the button below to start a voice practice session</p>
          <motion.button
            className="mt-6 rounded-xl bg-primary px-8 py-3 font-semibold text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <><Square className="mr-2 inline h-4 w-4" /> Stop Recording</>
            ) : (
              <><Circle className="mr-2 inline h-4 w-4" /> Start Recording</>
            )}
          </motion.button>
        </div>
      </CardHover>
    </div>
  )
}
