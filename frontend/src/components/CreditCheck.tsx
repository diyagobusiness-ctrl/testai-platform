'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '@/lib/api'
import { Coins, MessageSquare } from 'lucide-react'

interface CreditInfo {
  current_credits: number
  total_credits: number
}

export default function CreditCheck({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCredits()
      .then((res) => setCredits(res.data.credits))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <>{children}</>
  }

  const noCredits = credits && credits.current_credits <= 0

  if (noCredits) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-yellow-500/20 bg-card p-8 text-center shadow-xl"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <Coins className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">No Credits Remaining</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            You have used all your available credits for this month. Please contact your tenant admin to get more credits.
          </p>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Reach out to your organization admin for credit top-up</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
