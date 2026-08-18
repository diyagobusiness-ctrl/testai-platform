'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { StaggerList } from '@/components/animations/StaggerList'
import {
  Users,
  UserCheck,
  UserX,
  UsersRound,
  TrendingUp,
  Clock,
  BarChart3,
  Activity,
  ArrowUpRight,
  Brain,
  Mic,
  Code2,
  FileText,
  Briefcase,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const statsData = [
  { label: 'Active Students', value: 845, change: 5.2, trend: 'up' as const, icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { label: 'Suspended', value: 12, change: -8.0, trend: 'down' as const, icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { label: 'Total Students', value: 857, change: 4.8, trend: 'up' as const, icon: UsersRound, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Engagement Rate', value: 78, suffix: '%', change: 3.1, trend: 'up' as const, icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
]

const studentActivityData = [
  { day: 'Mon', active: 320, new: 12 },
  { day: 'Tue', active: 385, new: 18 },
  { day: 'Wed', active: 420, new: 15 },
  { day: 'Thu', active: 395, new: 22 },
  { day: 'Fri', active: 350, new: 10 },
  { day: 'Sat', active: 180, new: 5 },
  { day: 'Sun', active: 150, new: 3 },
]

const moduleUsageData = [
  { name: 'Aptitude Arena', value: 35, color: '#3b82f6' },
  { name: 'Voice AI', value: 25, color: '#10b981' },
  { name: 'Y-Codes', value: 20, color: '#8b5cf6' },
  { name: 'Resume Craft', value: 12, color: '#f59e0b' },
  { name: 'Job Hunt', value: 8, color: '#ec4899' },
]

const recentStudentActivity = [
  { id: 1, student: 'Alex Johnson', action: 'Completed Aptitude Test', score: '92%', time: '5 min ago', module: 'Aptitude Arena' },
  { id: 2, student: 'Maria Garcia', action: 'Finished Voice AI Session', score: '85%', time: '12 min ago', module: 'Voice AI' },
  { id: 3, student: 'James Wilson', action: 'Solved Y-Code Challenge', score: 'Passed', time: '25 min ago', module: 'Y-Codes' },
  { id: 4, student: 'Sarah Chen', action: 'Updated Resume', score: '-', time: '40 min ago', module: 'Resume Craft' },
  { id: 5, student: 'David Kim', action: 'Applied to Google', score: '-', time: '1 hour ago', module: 'Job Hunt' },
  { id: 6, student: 'Emily Brown', action: 'Completed Aptitude Test', score: '78%', time: '1.5 hours ago', module: 'Aptitude Arena' },
]

const moduleIcons: Record<string, typeof Brain> = {
  'Aptitude Arena': Brain,
  'Voice AI': Mic,
  'Y-Codes': Code2,
  'Resume Craft': FileText,
  'Job Hunt': Briefcase,
}

const moduleColors: Record<string, string> = {
  'Aptitude Arena': 'text-blue-500',
  'Voice AI': 'text-green-500',
  'Y-Codes': 'text-purple-500',
  'Resume Craft': 'text-orange-500',
  'Job Hunt': 'text-pink-500',
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function TenantAdminDashboard() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Tenant</span> Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your organization&apos;s students and performance.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
        {statsData.map((stat) => (
          <CardHover key={stat.label} intensity="low">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                </div>
                <div className={cn('rounded-xl p-3', stat.bgColor)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <ArrowUpRight className={cn('h-4 w-4', stat.trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-90')} />
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            </div>
          </CardHover>
        ))}
      </StaggerList>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Activity Chart */}
        <CardHover intensity="low">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Student Activity</h2>
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="active" name="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="new" name="New" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardHover>

        {/* Module Usage Distribution */}
        <CardHover intensity="low">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Module Usage Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {moduleUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardHover>
      </div>

      {/* Recent Student Activity */}
      <CardHover intensity="low">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Student Activity</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentStudentActivity.map((activity, index) => {
              const ModuleIcon = moduleIcons[activity.module] || Activity
              return (
                <motion.div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <ModuleIcon className={cn('h-5 w-5', moduleColors[activity.module] || 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.student}</span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className="text-sm text-muted-foreground">{activity.action}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  {activity.score !== '-' && (
                    <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
                      {activity.score}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardHover>
    </div>
  )
}
