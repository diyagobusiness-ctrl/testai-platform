'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { user, tenant, role, logout } = useAuth()
  const { theme, toggleTheme } = useUIStore()
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)

  const getDashboardLink = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard'
      case 'TENANT_ADMIN':
        return '/admin/dashboard'
      case 'STUDENT':
        return tenant ? `/${tenant.slug}/student/dashboard` : '/'
      default:
        return '/'
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={getDashboardLink()} className="flex items-center gap-2">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl font-bold text-white">T</span>
          </motion.div>
          <span className="hidden text-xl font-bold sm:block gradient-text">
            TestAi
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isProfileOpen && 'rotate-180'
              )} />
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl"
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="mt-1 text-xs font-medium text-primary">{role?.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition-colors md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-xl border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm
                             focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
