'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { StaggerList } from '@/components/animations/StaggerList'
import { api } from '@/lib/api'
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  CreditCard,
  AlertCircle,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DashboardStats {
  totalTenants: number
  activeTenants: number
  totalStudents: number
  activeStudents: number
  mrr: number
}

const tenantGrowthData = [
  { month: 'Jan', tenants: 0 },
  { month: 'Feb', tenants: 0 },
  { month: 'Mar', tenants: 0 },
  { month: 'Apr', tenants: 0 },
  { month: 'May', tenants: 0 },
  { month: 'Jun', tenants: 0 },
  { month: 'Jul', tenants: 0 },
  { month: 'Aug', tenants: 0 },
]

function AnimatedCounter({ value, prefix = '' }: { value: number; prefix?: string }) {
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

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
    </span>
  )
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getDashboardStats()
      .then((res) => {
        setStats(res.data.stats)
        tenantGrowthData[7].tenants = res.data.stats.totalTenants
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        {
          label: 'Total Tenants',
          value: stats.totalTenants,
          icon: Building2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        },
        {
          label: 'Active Students',
          value: stats.activeStudents,
          icon: Users,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        },
        {
          label: 'Monthly Revenue',
          value: stats.mrr,
          prefix: '$',
          icon: DollarSign,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
        },
        {
          label: 'Active Tenants',
          value: stats.activeTenants,
          icon: TrendingUp,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Super Admin</span> Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Overview of your entire platform performance.</p>
      </motion.div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
            {statCards.map((stat) => (
              <CardHover key={stat.label} intensity="low">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">
                        <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                      </p>
                    </div>
                    <div className={cn('rounded-xl p-3', stat.bgColor)}>
                      <stat.icon className={cn('h-6 w-6', stat.color)} />
                    </div>
                  </div>
                </div>
              </CardHover>
            ))}
          </StaggerList>

          <CardHover intensity="low">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Tenant Growth</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tenantGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tenants"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardHover>
        </>
      )}
    </div>
  )
}
