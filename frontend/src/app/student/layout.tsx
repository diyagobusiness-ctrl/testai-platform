'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import CreditCheck from '@/components/CreditCheck'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      <CreditCheck>{children}</CreditCheck>
    </DashboardLayout>
  )
}
