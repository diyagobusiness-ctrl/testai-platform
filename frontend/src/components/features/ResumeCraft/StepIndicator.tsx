'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderKanban,
  Award,
  Eye,
  Check,
} from 'lucide-react'

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Summary', icon: FileText },
  { label: 'Education', icon: GraduationCap },
  { label: 'Experience', icon: Briefcase },
  { label: 'Skills', icon: Wrench },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Certifications', icon: Award },
  { label: 'Preview', icon: Eye },
]

interface StepIndicatorProps {
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
}

export default function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.includes(index) || index < currentStep
          const Icon = step.icon

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center relative z-10">
                <motion.button
                  onClick={() => onStepClick?.(index)}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300',
                    isActive &&
                      'border-primary bg-primary text-white shadow-lg shadow-primary/30',
                    isCompleted &&
                      !isActive &&
                      'border-success bg-success text-white',
                    !isActive &&
                      !isCompleted &&
                      'border-muted-foreground/30 bg-background text-muted-foreground'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={isActive ? { duration: 0.6, repeat: Infinity, repeatDelay: 2 } : {}}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                <span
                  className={cn(
                    'mt-2 text-xs font-medium whitespace-nowrap hidden lg:block',
                    isActive && 'text-primary',
                    isCompleted && !isActive && 'text-success',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="relative mx-1 flex-1 h-0.5 top-0 lg:-mt-5">
                  <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
                  <motion.div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      isCompleted && index < currentStep
                        ? 'bg-success'
                        : 'bg-transparent'
                    )}
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted && index < currentStep ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
