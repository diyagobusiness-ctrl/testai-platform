'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CardHover } from '@/components/animations/CardHover'
import { StaggerList } from '@/components/animations/StaggerList'
import { api } from '@/lib/api'
import {
  CreditCard,
  Check,
  Download,
  Receipt,
  Star,
  Shield,
  Zap,
  Crown,
  Calendar,
  FileText,
} from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  status: string
  plan: string
  tenant_name: string
  created_at: string
  paid_at: string | null
}

interface SubscriptionPlan {
  id: string
  name: string
  maxStudents: number
  price: number
}

const planIcons: Record<string, typeof Zap> = {
  TRIAL: Zap,
  BASIC: Shield,
  PREMIUM: Star,
  ENTERPRISE: Crown,
}

const planColors: Record<string, string> = {
  TRIAL: 'text-gray-500',
  BASIC: 'text-blue-500',
  PREMIUM: 'text-purple-500',
  ENTERPRISE: 'text-yellow-500',
}

const planBorders: Record<string, string> = {
  TRIAL: 'border-gray-500/30',
  BASIC: 'border-blue-500/30',
  PREMIUM: 'border-purple-500/30',
  ENTERPRISE: 'border-yellow-500/30',
}

const planFeatures: Record<string, string[]> = {
  TRIAL: ['50 students', 'All modules', 'Email support', 'Basic analytics'],
  BASIC: ['100 students', 'Core modules', 'Email support', 'Basic analytics', 'Community access'],
  PREMIUM: ['500 students', 'All modules', 'Priority support', 'Advanced analytics', 'Custom branding', 'API access'],
  ENTERPRISE: ['Unlimited students', 'All modules', 'Dedicated support', 'Full analytics', 'White-label', 'SSO', 'SLA guarantee'],
}

const statusStyles: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  failed: 'bg-red-500/10 text-red-500',
}

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/super-admin/subscriptions').catch(() => ({ data: { plans: [] } })),
      api.get('/api/super-admin/invoices').catch(() => ({ data: { invoices: [] } })),
    ]).then(([plansRes, invoicesRes]) => {
      setPlans(plansRes.data.plans || [])
      setInvoices(invoicesRes.data.invoices || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Billing</span> & Subscription
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage subscription plans, invoices, and payment methods.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Plans Grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Subscription Plans</h2>
            <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
              {plans.map((plan) => {
                const Icon = planIcons[plan.name] || Zap
                const color = planColors[plan.name] || 'text-gray-500'
                const border = planBorders[plan.name] || 'border-border'
                const features = planFeatures[plan.name] || []

                return (
                  <CardHover key={plan.id} intensity="medium">
                    <div
                      className={cn(
                        'relative rounded-xl border bg-card p-6 transition-all',
                        border,
                        selectedPlan === plan.name && 'ring-2 ring-primary/40'
                      )}
                    >
                      <div className={cn('mb-4 inline-flex rounded-xl p-2.5 bg-muted')}>
                        <Icon className={cn('h-6 w-6', color)} />
                      </div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.maxStudents === 9999 ? 'Unlimited' : `Up to ${plan.maxStudents}`} students
                      </p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-muted-foreground">/month</span>
                        )}
                      </div>
                      <ul className="mt-6 space-y-2.5">
                        {features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardHover>
                )
              })}
            </StaggerList>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Invoice History */}
            <CardHover intensity="low" className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Invoice History</h2>
                  <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Download className="h-4 w-4" />
                    Export All
                  </button>
                </div>
                {invoices.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No invoices yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Invoice</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice, index) => (
                          <motion.tr
                            key={invoice.id}
                            className="border-b border-border last:border-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{invoice.invoice_number}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-sm text-muted-foreground">
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-sm">{invoice.tenant_name || '-'}</td>
                            <td className="py-3.5 font-medium">
                              {invoice.amount === 0 ? 'Free' : `$${invoice.amount}`}
                            </td>
                            <td className="py-3.5">
                              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', statusStyles[invoice.status] || '')}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <motion.button
                                className="inline-flex items-center gap-1 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Download className="h-4 w-4" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardHover>

            {/* Payment Method */}
            <CardHover intensity="low">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">No payment method</p>
                      <p className="text-sm text-muted-foreground">Add a card to enable billing</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <motion.button
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Add Payment Method
                  </motion.button>
                </div>
              </div>
            </CardHover>
          </div>
        </>
      )}
    </div>
  )
}
