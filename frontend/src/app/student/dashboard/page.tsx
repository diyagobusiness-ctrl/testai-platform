'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { CardHover } from '@/components/animations/CardHover'
import { StaggerList } from '@/components/animations/StaggerList'
import { Mic, Code2, Briefcase, FileText, Brain, TrendingUp, Award, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { tenant } = useAuth()
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const tenantSlug = tenant?.slug || 'acme'

  useEffect(() => {
    api.getDashboard()
      .then((res) => setStats(res.data.stats || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const modules = [
    { name: 'Voice AI Practice', icon: Mic, href: `/${tenantSlug}/student/voice-ai`, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { name: 'Y-Codes Challenges', icon: Code2, href: `/${tenantSlug}/student/y-codes`, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { name: 'Job Hunt', icon: Briefcase, href: `/${tenantSlug}/student/job-hunt`, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { name: 'Resume Craft', icon: FileText, href: `/${tenantSlug}/student/resume-craft`, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { name: 'Aptitude Arena', icon: Brain, href: `/${tenantSlug}/student/aptitude-arena`, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Student</span> Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Welcome back! Track your learning progress.</p>
      </motion.div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
            {[
              { label: 'Credits', value: (stats as Record<string, number>)?.current_credits || 0, icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
              { label: 'Sessions', value: (stats as Record<string, number>)?.total_sessions || 0, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
              { label: 'Score', value: `${(stats as Record<string, number>)?.avg_score || 0}%`, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
              { label: 'Progress', value: `${(stats as Record<string, number>)?.completion_rate || 0}%`, icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
            ].map((stat) => (
              <CardHover key={stat.label} intensity="low">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </CardHover>
            ))}
          </StaggerList>

          <h2 className="text-xl font-semibold">Learning Modules</h2>
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
            {modules.map((mod) => (
              <CardHover key={mod.name} intensity="medium">
                <a href={mod.href} className="block rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/30">
                  <div className={`inline-flex rounded-xl p-3 ${mod.bgColor}`}>
                    <mod.icon className={`h-6 w-6 ${mod.color}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{mod.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Click to start practicing</p>
                </a>
              </CardHover>
            ))}
          </StaggerList>
        </>
      )}
    </div>
  )
}
