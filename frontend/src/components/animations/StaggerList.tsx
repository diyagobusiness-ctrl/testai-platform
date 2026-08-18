'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface StaggerListProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
}

export function StaggerList({
  children,
  className,
  staggerDelay = 0.1,
  direction = 'up',
}: StaggerListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = directionVariants[direction]

  return (
    <motion.ul
      className={cn('space-y-4', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.li
          key={index}
          variants={itemVariants}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 24,
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export default StaggerList
