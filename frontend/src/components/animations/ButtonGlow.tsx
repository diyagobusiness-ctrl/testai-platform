'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ButtonGlowProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glowColor?: string
  disabled?: boolean
  onClick?: () => void
}

const variantConfig = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  ghost: 'text-foreground hover:bg-muted',
}

const sizeConfig = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function ButtonGlow({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glowColor,
  disabled = false,
  onClick,
}: ButtonGlowProps) {
  const defaultGlowColor = variant === 'primary'
    ? 'rgba(99, 102, 241, 0.5)'
    : variant === 'secondary'
    ? 'rgba(20, 184, 166, 0.5)'
    : variant === 'accent'
    ? 'rgba(192, 132, 252, 0.5)'
    : 'rgba(99, 102, 241, 0.3)'

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl font-semibold',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantConfig[variant],
        sizeConfig[size],
        className
      )}
      whileHover={!disabled ? {
        scale: 1.02,
        boxShadow: `0 0 30px ${glowColor || defaultGlowColor}`,
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `radial-gradient(circle at center, ${glowColor || defaultGlowColor}, transparent 70%)`,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

export default ButtonGlow
