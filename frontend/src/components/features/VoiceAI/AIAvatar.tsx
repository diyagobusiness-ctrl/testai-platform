'use client'

import { useEffect, useState } from 'react'
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
    }, 2800 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <g>
      {/* Left eye - with eyelashes */}
      <path
        d="M 158 128 Q 165 122 172 128"
        stroke="#1a1a2e"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="165"
        cy="132"
        rx="4.5"
        ry={blink ? 0.5 : 4.5}
        fill="#1a1a2e"
        style={{ transition: 'ry 0.08s ease' }}
      />
      {!blink && (
        <>
          <circle cx="166" cy="131" r="1.8" fill="#0a0a14" />
          <circle cx="167.5" cy="130" r="0.8" fill="white" opacity="0.8" />
        </>
      )}

      {/* Right eye - with eyelashes */}
      <path
        d="M 228 128 Q 235 122 242 128"
        stroke="#1a1a2e"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="235"
        cy="132"
        rx="4.5"
        ry={blink ? 0.5 : 4.5}
        fill="#1a1a2e"
        style={{ transition: 'ry 0.08s ease' }}
      />
      {!blink && (
        <>
          <circle cx="236" cy="131" r="1.8" fill="#0a0a14" />
          <circle cx="237.5" cy="130" r="0.8" fill="white" opacity="0.8" />
        </>
      )}

      {/* Eyebrows - arched */}
      <path d="M 155 120 Q 165 114 175 118" stroke="#2d2d44" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 225 118 Q 235 114 245 120" stroke="#2d2d44" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
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
      setMouthOpen(Math.random() * 5 + 1)
    }, 130)
    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <g>
      {/* Lips */}
      <path
        d={isSpeaking
          ? `M 188 ${172 + mouthOpen} Q 200 ${176 + mouthOpen * 1.8} 212 ${172 + mouthOpen}`
          : 'M 190 172 Q 200 178 210 172'
        }
        fill={isSpeaking ? '#c0392b' : 'none'}
        stroke="#c0392b"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ transition: 'all 0.08s ease' }}
      />
      {/* Upper lip highlight */}
      {!isSpeaking && (
        <path
          d="M 192 171 Q 200 168 208 171"
          stroke="#e74c3c"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

export default function AIAvatar({
  isSpeaking,
  isListening,
  name = 'Aria',
  subtitle = 'AI Interview Coach',
  className,
}: AIAvatarProps) {
  const [breathOffset, setBreathOffset] = useState(0)
  const [hairSway, setHairSway] = useState(0)

  useEffect(() => {
    let frame: number
    const animate = () => {
      setBreathOffset(Math.sin(Date.now() * 0.0018) * 1.2)
      setHairSway(Math.sin(Date.now() * 0.001) * 2)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center overflow-hidden', className)}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', left: '60%', top: '20%' }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? '#818cf8' : '#c084fc',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 3.5 + i * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Speaking pulse rings */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.08, 0.25] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute w-72 h-72 rounded-full border-2 border-purple-400/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.03, 0.15] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              className="absolute w-80 h-80 rounded-full border border-indigo-400/20"
            />
          </>
        )}
      </AnimatePresence>

      {/* Listening waveform ring */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.1, 0.3] }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute w-64 h-64 rounded-full border-2 border-emerald-400/30"
          />
        )}
      </AnimatePresence>

      {/* Avatar SVG */}
      <motion.svg
        viewBox="0 0 400 420"
        className="relative z-10 w-60 h-60 md:w-72 md:h-72"
        animate={{ y: breathOffset }}
        transition={{ duration: 0.1 }}
      >
        <defs>
          <radialGradient id="femaleFaceGrad" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#fde8d8" />
            <stop offset="60%" stopColor="#f5d0b0" />
            <stop offset="100%" stopColor="#e8b898" />
          </radialGradient>
          <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0a2e" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="50%" stopColor="#2d2d44" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#c0392b" />
          </linearGradient>
        </defs>

        {/* Glow behind */}
        <circle cx="200" cy="180" r="160" fill="url(#femaleFaceGrad)" opacity="0.08" />

        {/* Body / Blazer */}
        <path
          d="M 115 340 Q 115 300 155 275 L 175 262 L 200 254 L 225 262 L 245 275 Q 285 300 285 340 L 285 420 L 115 420 Z"
          fill="url(#blazerGrad)"
        />
        {/* Blazer lapels */}
        <path
          d="M 175 262 L 185 285 L 200 278"
          stroke="#312e81"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 225 262 L 215 285 L 200 278"
          stroke="#312e81"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Blouse */}
        <path
          d="M 185 262 L 195 278 L 200 275 L 205 278 L 215 262"
          fill="#e8e0f0"
        />
        {/* Necklace */}
        <circle cx="200" cy="278" r="3" fill="#a78bfa" />
        <path d="M 192 275 Q 200 282 208 275" stroke="#a78bfa" strokeWidth="0.8" fill="none" />

        {/* Neck */}
        <rect x="187" y="235" width="26" height="28" rx="6" fill="#e8b898" />

        {/* Hair behind head */}
        <ellipse cx="200" cy="145" rx="82" ry="90" fill="url(#hairGrad)" />

        {/* Head */}
        <ellipse cx="200" cy="152" rx="68" ry="78" fill="url(#femaleFaceGrad)" />

        {/* Hair - flowing style with volume */}
        <path
          d="M 132 148 Q 128 70 200 58 Q 272 70 268 148
             Q 265 105 240 90 Q 210 75 170 85 Q 140 95 132 148 Z"
          fill="url(#hairGrad)"
        />
        {/* Hair strands - left side flowing */}
        <path
          d="M 132 148 Q 125 175 120 220 Q 118 240 125 260"
          stroke="#2d2d44"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={{ transform: `translateX(${hairSway * 0.3}px)` }}
        />
        {/* Hair strands - right side flowing */}
        <path
          d="M 268 148 Q 275 175 280 220 Q 282 240 275 260"
          stroke="#2d2d44"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={{ transform: `translateX(${-hairSway * 0.3}px)` }}
        />
        {/* Hair highlight */}
        <path
          d="M 160 70 Q 180 62 200 60 Q 210 60 215 62"
          stroke="#4a4a6a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Earrings */}
        <circle cx="132" cy="158" r="3.5" fill="#a78bfa" opacity="0.9" />
        <circle cx="132" cy="163" r="2" fill="#c4b5fd" opacity="0.7" />
        <circle cx="268" cy="158" r="3.5" fill="#a78bfa" opacity="0.9" />
        <circle cx="268" cy="163" r="2" fill="#c4b5fd" opacity="0.7" />

        {/* Eyes */}
        <BlinkAnimation isSpeaking={isSpeaking} />

        {/* Nose */}
        <path d="M 198 142 Q 200 152 202 142" stroke="#d4a88a" strokeWidth="1.2" fill="none" />

        {/* Cheek blush */}
        <ellipse cx="155" cy="155" rx="10" ry="6" fill="#f0a0a0" opacity="0.2" />
        <ellipse cx="245" cy="155" rx="10" ry="6" fill="#f0a0a0" opacity="0.2" />

        {/* Mouth */}
        <MouthAnimation isSpeaking={isSpeaking} />
      </motion.svg>

      {/* Status label */}
      <div className="absolute bottom-5 left-0 right-0 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-purple-400"
            />
          )}
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
          )}
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">{name}</span>
        </div>
        <p className="text-xs text-zinc-400">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening to you...' : subtitle}
        </p>
      </div>
    </div>
  )
}
