'use client'

import { useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/store'

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  
  const {
    user,
    tenant,
    role,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    fetchUser,
    getRedirectPath,
    hasRole,
  } = useAuthStore()

  // Check if user is authenticated on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.includes('/login')) {
      fetchUser()
    }
  }, [isLoading, isAuthenticated, pathname, fetchUser])

  // Handle redirect after login
  const handleRedirect = useCallback(() => {
    const redirectPath = getRedirectPath()
    router.push(redirectPath)
  }, [getRedirectPath, router])

  // Login with redirect
  const loginWithRedirect = useCallback(async (email: string, password: string) => {
    const result = await login(email, password)
    if (result.success) {
      handleRedirect()
    }
    return result
  }, [login, handleRedirect])

  // Logout with redirect
  const logoutWithRedirect = useCallback(async () => {
    await logout()
    router.push('/login')
  }, [logout, router])

  // Check if user has specific role
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isTenantAdmin = role === 'TENANT_ADMIN'
  const isStudent = role === 'STUDENT'

  // Check if current route is protected
  const isProtectedRoute = !pathname.includes('/login') && !pathname.includes('/register')

  // Check if user can access current route
  const canAccessRoute = useCallback((requiredRole?: UserRole) => {
    if (!isAuthenticated) return false
    if (!requiredRole) return true
    return hasRole(requiredRole)
  }, [isAuthenticated, hasRole])

  return {
    user,
    tenant,
    role,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isTenantAdmin,
    isStudent,
    isProtectedRoute,
    login: loginWithRedirect,
    logout: logoutWithRedirect,
    refreshToken,
    fetchUser,
    handleRedirect,
    canAccessRoute,
    hasRole,
  }
}

export default useAuth
