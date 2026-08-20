'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface AIAvatarProps {
  isSpeaking: boolean
  isListening: boolean
  name?: string
  subtitle?: string
  className?: string
}

function OrbParticles({ color }: { color: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i / 12) * Math.PI * 2,
        delay: i * 0.15,
        size: 2 + Math.random() * 3,
      })),
    []
  )

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: color,
            left: `${50 + Math.cos(p.angle) * 38}%`,
            top: `${50 + Math.sin(p.angle) * 38}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
            x: [0, Math.cos(p.angle) * 15, 0],
            y: [0, Math.sin(p.angle) * 15, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

function WaveformRings({ isSpeaking, isListening }: { isSpeaking: boolean; isListening: boolean }) {
  const ringCount = 5

  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => {
        const delay = i * 0.2
        const baseScale = 1 + i * 0.15

        return (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              left: '50%',
              top: '50%',
              width: `${100 + i * 20}%`,
              height: `${100 + i * 20}%`,
              marginLeft: `-${(100 + i * 20) / 2}%`,
              marginTop: `-${(100 + i * 20) / 2}%`,
              borderColor: isSpeaking
                ? `rgba(168, 85, 247, ${0.25 - i * 0.04})`
                : isListening
                  ? `rgba(52, 211, 153, ${0.2 - i * 0.03})`
                  : `rgba(99, 102, 241, ${0.1 - i * 0.015})`,
            }}
            animate={
              isSpeaking
                ? {
                    scale: [baseScale, baseScale + 0.08, baseScale],
                    opacity: [0.4, 0.7, 0.4],
                  }
                : isListening
                  ? {
                      scale: [baseScale, baseScale + 0.04, baseScale],
                      opacity: [0.25, 0.5, 0.25],
                    }
                  : {
                      scale: [baseScale, baseScale + 0.02, baseScale],
                      opacity: [0.1, 0.2, 0.1],
                    }
            }
            transition={{
              duration: isSpeaking ? 1.2 : isListening ? 1.8 : 3,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </>
  )
}

function AudioBars({ isSpeaking }: { isSpeaking: boolean }) {
  const barCount = 24

  return (
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-6">
      {Array.from({ length: barCount }, (_, i) => {
        const centerDist = Math.abs(i - barCount / 2) / (barCount / 2)
        const maxHeight = isSpeaking ? (1 - centerDist * 0.6) * 20 : 3

        return (
          <motion.div
            key={i}
            className="w-[2px] rounded-full"
            style={{
              background: isSpeaking
                ? 'linear-gradient(to top, #a855f7, #6366f1)'
                : 'rgba(99, 102, 241, 0.3)',
            }}
            animate={{
              height: isSpeaking
                ? [3, maxHeight, 2, maxHeight * 0.8, 3]
                : 3,
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: isSpeaking ? Infinity : 0,
              delay: i * 0.03,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

export default function AIAvatar({
  isSpeaking,
  isListening,
  name = 'Aria',
  subtitle = 'AI Interview Coach',
  className,
}: AIAvatarProps) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    let frame: number
    const animate = () => {
      setPulse(Math.sin(Date.now() * 0.003) * 0.5 + 0.5)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const orbColor = isSpeaking
    ? 'from-purple-500 via-violet-500 to-indigo-500'
    : isListening
      ? 'from-emerald-400 via-teal-400 to-cyan-400'
      : 'from-indigo-500 via-purple-500 to-violet-500'

  const glowColor = isSpeaking
    ? 'rgba(168, 85, 247, 0.4)'
    : isListening
      ? 'rgba(52, 211, 153, 0.35)'
      : 'rgba(99, 102, 241, 0.25)'

  const particleColor = isSpeaking
    ? '#c084fc'
    : isListening
      ? '#6ee7b7'
      : '#818cf8'

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center overflow-hidden', className)}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Ambient glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Waveform rings */}
      <div className="absolute w-72 h-72 md:w-80 md:h-80">
        <WaveformRings isSpeaking={isSpeaking} isListening={isListening} />
      </div>

      {/* Particles */}
      <div className="absolute w-72 h-72 md:w-80 md:h-80">
        <OrbParticles color={particleColor} />
      </div>

      {/* Main orb */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: isSpeaking ? [1, 1.04, 1] : isListening ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: isSpeaking ? 0.8 : isListening ? 1.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="relative w-40 h-40 md:w-48 md:h-48">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: glowColor, opacity: 0.4 + pulse * 0.2 }}
          />

          {/* Orb body */}
          <div
            className={cn(
              'absolute inset-2 rounded-full bg-gradient-to-br',
              orbColor,
              'shadow-2xl'
            )}
            style={{
              boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
            }}
          />

          {/* Inner highlight */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/25 via-transparent to-transparent" />

          {/* Core light */}
          <div
            className="absolute rounded-full bg-white/40 blur-sm"
            style={{
              width: 30 + pulse * 8,
              height: 30 + pulse * 8,
              left: '50%',
              top: '35%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Specular highlight */}
          <div className="absolute w-8 h-4 rounded-full bg-white/30 blur-sm" style={{ left: '35%', top: '28%' }} />

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-[-8px] rounded-full border border-white/10"
            style={{ borderStyle: 'dashed', borderWidth: 1 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {/* Audio bars */}
      <div className="absolute w-64 md:w-72 z-10">
        <AudioBars isSpeaking={isSpeaking} />
      </div>

      {/* Status label */}
      <div className="absolute bottom-5 left-0 right-0 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            animate={
              isSpeaking
                ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
                : isListening
                  ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
                  : { opacity: 0.5 }
            }
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              'w-2 h-2 rounded-full',
              isSpeaking ? 'bg-purple-400' : isListening ? 'bg-emerald-400' : 'bg-indigo-400'
            )}
          />
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">{name}</span>
        </div>
        <p className="text-xs text-zinc-400">
          {isSpeaking ? 'Speaking...' : isListening ? 'Listening to you...' : subtitle}
        </p>
      </div>
    </div>
  )
}
