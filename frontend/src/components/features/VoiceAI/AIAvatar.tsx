'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface AIAvatarProps {
  isSpeaking: boolean
  isListening: boolean
  name?: string
  subtitle?: string
  className?: string
}

function BlinkAnimation({ isSpeaking }: { isSpeaking: boolean }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (isSpeaking) return
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <>
      {/* Left eye */}
      <ellipse
        cx="165"
        cy="135"
        rx={blink ? 5 : 5}
        ry={blink ? 0.5 : 5}
        fill="#1e293b"
        style={{ transition: 'ry 0.08s ease' }}
      />
      {/* Left pupil */}
      {!blink && (
        <circle cx="167" cy="134" r="2" fill="#0f172a" />
      )}
      {/* Right eye */}
      <ellipse
        cx="235"
        cy="135"
        rx={blink ? 5 : 5}
        ry={blink ? 0.5 : 5}
        fill="#1e293b"
        style={{ transition: 'ry 0.08s ease' }}
      />
      {/* Right pupil */}
      {!blink && (
        <circle cx="237" cy="134" r="2" fill="#0f172a" />
      )}
    </>
  )
}

function MouthAnimation({ isSpeaking }: { isSpeaking: boolean }) {
  const [mouthOpen, setMouthOpen] = useState(0)

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0)
      return
    }
    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 6 + 1)
    }, 120)
    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <g>
      {/* Mouth base (closed) */}
      <path
        d={isSpeaking
          ? `M 185 ${178 + mouthOpen} Q 200 ${182 + mouthOpen * 1.5} 215 ${178 + mouthOpen}`
          : 'M 188 178 Q 200 183 212 178'
        }
        stroke="#1e293b"
        strokeWidth="2.5"
        fill={isSpeaking ? '#1e293b' : 'none'}
        strokeLinecap="round"
        style={{ transition: 'all 0.08s ease' }}
      />
    </g>
  )
}

export default function AIAvatar({
  isSpeaking,
  isListening,
  name = 'AI Interviewer',
  subtitle = 'Ready to begin',
  className,
}: AIAvatarProps) {
  const [breathOffset, setBreathOffset] = useState(0)

  useEffect(() => {
    let frame: number
    const animate = () => {
      setBreathOffset(Math.sin(Date.now() * 0.002) * 1.5)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center overflow-hidden', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-zinc-900 to-zinc-950" />

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Speaking pulse ring */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-64 h-64 rounded-full border-2 border-blue-400/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.05, 0.2] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="absolute w-72 h-72 rounded-full border border-blue-400/20"
            />
          </>
        )}
      </AnimatePresence>

      {/* Avatar SVG */}
      <motion.svg
        viewBox="0 0 400 400"
        className="relative z-10 w-56 h-56 md:w-64 md:h-64"
        animate={{ y: breathOffset }}
        transition={{ duration: 0.1 }}
      >
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="200" cy="200" r="180" fill="url(#bgGlow)" />

        {/* Body / Suit */}
        <path
          d="M 120 320 Q 120 280 160 260 L 180 250 L 200 245 L 220 250 L 240 260 Q 280 280 280 320 L 280 400 L 120 400 Z"
          fill="url(#suitGrad)"
        />
        {/* Shirt collar */}
        <path
          d="M 180 250 L 195 265 L 200 258 L 205 265 L 220 250"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />
        {/* Tie */}
        <path
          d="M 198 260 L 200 300 L 202 260 Z"
          fill="#3b82f6"
        />
        <circle cx="200" cy="258" r="3" fill="#2563eb" />

        {/* Neck */}
        <rect x="185" y="230" width="30" height="25" rx="5" fill="#e2b89d" />

        {/* Head */}
        <ellipse cx="200" cy="155" rx="75" ry="85" fill="url(#faceGrad)" />

        {/* Hair */}
        <path
          d="M 125 145 Q 125 70 200 65 Q 275 70 275 145 Q 270 110 240 100 Q 210 90 170 100 Q 140 110 125 145 Z"
          fill="#1e293b"
        />

        {/* Ears */}
        <ellipse cx="125" cy="155" rx="10" ry="14" fill="#e2b89d" />
        <ellipse cx="275" cy="155" rx="10" ry="14" fill="#e2b89d" />

        {/* Eyebrows */}
        <path d="M 150 122 Q 165 118 178 122" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 222 122 Q 235 118 250 122" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <BlinkAnimation isSpeaking={isSpeaking} />

        {/* Nose */}
        <path d="M 198 148 Q 200 160 202 148" stroke="#c4a882" strokeWidth="1.5" fill="none" />

        {/* Mouth */}
        <MouthAnimation isSpeaking={isSpeaking} />
      </motion.svg>

      {/* Status label */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          )}
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
          )}
          <span className="text-sm font-medium text-zinc-200">{name}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening to you...' : subtitle}
        </p>
      </div>
    </div>
  )
}
