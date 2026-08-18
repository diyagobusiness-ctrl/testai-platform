'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface CardHoverProps {
  children: React.ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  glowColor?: string
}

const intensityConfig = {
  low: {
    scale: 1.01,
    rotateX: 2,
    rotateY: -2,
    shadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
  },
  medium: {
    scale: 1.02,
    rotateX: 5,
    rotateY: -5,
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  high: {
    scale: 1.03,
    rotateX: 8,
    rotateY: -8,
    shadow: '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  },
}

export function CardHover({
  children,
  className,
  intensity = 'medium',
  glowColor,
}: CardHoverProps) {
  const config = intensityConfig[intensity]

  return (
    <motion.div
      className={cn(
        'relative rounded-xl overflow-hidden cursor-pointer',
        'transition-shadow duration-300',
        className
      )}
      whileHover={{
        scale: config.scale,
        rotateX: config.rotateX,
        rotateY: config.rotateY,
        boxShadow: glowColor
          ? `0 0 30px ${glowColor}40, ${config.shadow}`
          : config.shadow,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

export default CardHover
