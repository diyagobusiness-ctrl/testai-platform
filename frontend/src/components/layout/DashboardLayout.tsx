'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useAuth } from '@/hooks'
import { Navbar, Sidebar } from '@/components/layout'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { sidebarState } = useUIStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] pt-16 transition-all duration-300',
          sidebarState === 'expanded' ? 'ml-64' : 'ml-20'
        )}
      >
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default DashboardLayout
