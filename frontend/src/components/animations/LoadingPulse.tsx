'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface LoadingPulseProps {
  className?: string
  variant?: 'spinner' | 'dots' | 'bars' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { spinner: 16, dots: 4, bars: 12, skeleton: 'h-4' },
  md: { spinner: 24, dots: 6, bars: 16, skeleton: 'h-6' },
  lg: { spinner: 32, dots: 8, bars: 20, skeleton: 'h-8' },
}

function Spinner({ size }: { size: number }) {
  return (
    <motion.div
      className="rounded-full border-2 border-muted border-t-primary"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function Dots({ size }: { size: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-primary"
          style={{ width: size, height: size }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

function Bars({ size }: { size: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-primary"
          style={{ width: size / 3, height: size }}
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

function Skeleton({ className }: { className: string }) {
  return (
    <div className={cn('rounded-lg bg-muted overflow-hidden relative', className)}>
      <motion.div
        className="absolute inset-0 shimmer"
        animate={{
          backgroundPosition: ['-200% 0', '200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

export function LoadingPulse({
  className,
  variant = 'spinner',
  size = 'md',
}: LoadingPulseProps) {
  const sizeValue = sizeConfig[size][variant === 'skeleton' ? 'skeleton' : variant]

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {variant === 'spinner' && <Spinner size={sizeValue as number} />}
      {variant === 'dots' && <Dots size={sizeValue as number} />}
      {variant === 'bars' && <Bars size={sizeValue as number} />}
      {variant === 'skeleton' && <Skeleton className={sizeValue as string} />}
    </div>
  )
}

export default LoadingPulse
