'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useStudent } from '@/hooks'
import type { RecentActivity } from '@/hooks'
import { CardHover, StaggerList } from '@/components/animations'
import {
  Brain,
  Mic,
  Code2,
  FileText,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const modules = [
  {
    title: 'Voice AI',
    description: 'Practice interviews with AI',
    icon: Mic,
    href: '/voice-ai',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Y-Codes',
    description: 'Solve coding challenges',
    icon: Code2,
    href: '/y-codes',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Job Hunt',
    description: 'Find your dream job',
    icon: Briefcase,
    href: '/job-hunt',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    title: 'Resume Craft',
    description: 'Build your resume',
    icon: FileText,
    href: '/resume-craft',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    title: 'Aptitude Arena',
    description: 'Test your skills',
    icon: Brain,
    href: '/aptitude-arena',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
]

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'aptitude': return Brain
    case 'voice_ai': return Mic
    case 'ycode': return Code2
    default: return CheckCircle
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'aptitude': return 'text-blue-500 bg-blue-500/10'
    case 'voice_ai': return 'text-green-500 bg-green-500/10'
    case 'ycode': return 'text-purple-500 bg-purple-500/10'
    default: return 'text-gray-500 bg-gray-500/10'
  }
}

function ResultBadge({ result }: { result: string }) {
  const isPassed = result === 'Passed' || (result.includes('%') && parseInt(result) >= 50)
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium ${
      isPassed ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
    }`}>
      {isPassed ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {result}
    </span>
  )
}

export default function StudentDashboard() {
  const { studentData, stats, recentActivity, isLoading } = useStudent()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{studentData?.user?.firstName || 'Student'}</span>!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your learning journey. You&apos;re doing great!
        </p>
      </motion.div>

      {/* Quick Stats */}
      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
        {[
          {
            label: 'Overall Progress',
            value: `${stats?.overallProgress || 0}%`,
            icon: TrendingUp,
            color: 'text-primary',
          },
          {
            label: 'Activity Streak',
            value: `${stats?.activityStreak || 0} days`,
            icon: Zap,
            color: 'text-warning',
          },
          {
            label: 'Credits Remaining',
            value: studentData?.currentCredits || 0,
            icon: Award,
            color: 'text-success',
          },
          {
            label: 'Completed Modules',
            value: `${stats?.completedModules || 0}/${stats?.totalModules || 5}`,
            icon: Target,
            color: 'text-accent',
          },
        ].map((stat) => (
          <CardHover key={stat.label} intensity="low">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.color}/10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </CardHover>
        ))}
      </StaggerList>

      {/* Daily Challenge */}
      <CardHover intensity="medium" glowColor="rgba(99, 102, 241, 0.3)">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Daily Challenge</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">Today&apos;s Aptitude Question</h3>
              <p className="mt-1 text-muted-foreground">
                Test your quantitative skills with a quick 5-minute challenge.
              </p>
            </div>
            <motion.button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              Start Challenge
            </motion.button>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>5 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>1 question</span>
            </div>
          </div>
        </div>
      </CardHover>

      {/* Module Cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Start Modules</h2>
        <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" staggerDelay={0.05}>
          {modules.map((module) => (
            <CardHover key={module.title} intensity="medium">
              <a
                href={module.href}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className={`mb-3 inline-flex rounded-xl p-2 ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <h3 className="font-semibold">{module.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
              </a>
            </CardHover>
          ))}
        </StaggerList>
      </div>

      {/* Recent Activity */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)
                return (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    <ResultBadge result={activity.result} />
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-xl bg-muted/50 p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No activity yet. Start practicing to see your progress here!
              </p>
            </div>
          )}
        </div>
      </CardHover>
    </div>
  )
}
