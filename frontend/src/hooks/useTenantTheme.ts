'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks'

/**
 * Applies tenant white-label colors as CSS custom properties on :root
 */
export function useTenantTheme() {
  const { tenant } = useAuth()

  useEffect(() => {
    if (!tenant?.primaryColor) return
    const root = document.documentElement
    root.style.setProperty('--primary', tenant.primaryColor)
    return () => {
      root.style.removeProperty('--primary')
    }
  }, [tenant?.primaryColor])

  useEffect(() => {
    if (!tenant?.accentColor) return
    const root = document.documentElement
    root.style.setProperty('--accent', tenant.accentColor)
    return () => {
      root.style.removeProperty('--accent')
    }
  }, [tenant?.accentColor])
}
