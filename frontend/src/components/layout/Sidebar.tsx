'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/hooks'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Mic,
  Code2,
  Briefcase,
  FileText,
  Brain,
  Users,
  Settings,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  LogOut,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tenants', href: '/tenants', icon: Building2 },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Access Control', href: '/access-control', icon: Shield },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const tenantAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/students', icon: Users },
  { label: 'Content', href: '/content', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Voice AI', href: '/voice-ai', icon: Mic },
  { label: 'Y-Codes', href: '/y-codes', icon: Code2 },
  { label: 'Job Hunt', href: '/job-hunt', icon: Briefcase },
  { label: 'Resume Craft', href: '/resume-craft', icon: FileText },
  { label: 'Aptitude Arena', href: '/aptitude-arena', icon: Brain },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role, tenant } = useAuth()
  const { sidebarState, toggleSidebar } = useUIStore()
  const { logout } = useAuth()

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'SUPER_ADMIN':
        return superAdminNav
      case 'TENANT_ADMIN':
        return tenantAdminNav
      case 'STUDENT':
        return studentNav
      default:
        return []
    }
  }

  const getBasePath = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin'
      case 'TENANT_ADMIN':
        return '/admin'
      case 'STUDENT':
        return tenant ? `/${tenant.slug}/student` : '/student'
      default:
        return ''
    }
  }

  const navItems = getNavItems()
  const basePath = getBasePath()
  const isExpanded = sidebarState === 'expanded'

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border',
        'bg-sidebar transition-all duration-300',
        isExpanded ? 'w-64' : 'w-20'
      )}
      animate={{ width: isExpanded ? 256 : 80 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex h-full flex-col">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = pathname === href || pathname.startsWith(href + '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={href}>
                <motion.div
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-3',
                    'transition-colors duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-border p-4 space-y-2">
          <motion.button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-muted-foreground hover:bg-muted transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </motion.button>
          <motion.button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-red-500 hover:bg-red-500/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-5 w-5" />
            {isExpanded && <span className="text-sm font-medium">Logout</span>}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
