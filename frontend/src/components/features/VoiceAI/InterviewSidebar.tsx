'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, User, Mic, Clock } from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'interviewer' | 'candidate'
  text: string
  timestamp: number
}

interface InterviewSidebarProps {
  messages: ChatMessage[]
  interimTranscript: string
  isListening: boolean
  isAiSpeaking: boolean
  currentQuestion: string
  questionNumber: number
  totalQuestions: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function InterviewSidebar({
  messages,
  interimTranscript,
  isListening,
  isAiSpeaking,
  currentQuestion,
  questionNumber,
  totalQuestions,
}: InterviewSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, interimTranscript])

  return (
    <div className="flex h-full flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-200">
            Live Transcription
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="w-3 h-3" />
          <span>
            Q{questionNumber}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Current Question Banner */}
      {currentQuestion && (
        <div className="px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
          <div className="flex items-start gap-2">
            <Bot className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-300 leading-relaxed">
              {currentQuestion}
            </p>
          </div>
        </div>
      )}

      {/* Chat / Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === 'interviewer'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {msg.role === 'interviewer' ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'interviewer'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'bg-blue-600/20 text-blue-100'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Interim (live) transcript */}
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 flex-row-reverse"
          >
            <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed bg-emerald-600/10 text-emerald-300 italic border border-emerald-500/20">
              <p>{interimTranscript}</p>
              <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isListening && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Listening...
                </span>
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-emerald-400 rounded-full"
                      animate={{ height: [4, 12, 4] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            {isAiSpeaking && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  Interviewer speaking...
                </span>
              </motion.div>
            )}
            {!isListening && !isAiSpeaking && messages.length > 0 && (
              <span className="text-xs text-zinc-500">Waiting...</span>
            )}
          </div>
          <span className="text-[10px] text-zinc-600">
            {messages.length} messages
          </span>
        </div>
      </div>
    </div>
  )
}
