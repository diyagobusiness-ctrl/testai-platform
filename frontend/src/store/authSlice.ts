import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STUDENT'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl?: string
  subscriptionPlan: string
  maxStudents: number
  currentStudentsCount: number
  isActive: boolean
  // White-label fields
  businessName?: string
  primaryColor?: string
  accentColor?: string
  customDomain?: string
  welcomeMessage?: string
  footerText?: string
  faviconUrl?: string
}

export interface AuthState {
  user: User | null
  tenant: Tenant | null
  role: UserRole | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setRole: (role: UserRole | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void

  // Async actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  fetchUser: () => Promise<void>
  fetchTenantSettings: () => Promise<void>

  // Helpers
  getRedirectPath: () => string
  hasRole: (role: UserRole) => boolean
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      role: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      setRole: (role) => set({ role }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.login(email, password)
          const data = response.data as Record<string, unknown>
          const user = data.user as User
          const tenant = data.tenant as Tenant
          const role = data.role as UserRole
          const token = data.token as string

          set({
            user,
            tenant,
            role,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

          // Fetch full tenant settings (white-label)
          if (tenant?.id) {
            get().fetchTenantSettings()
          }

          return { success: true }
        } catch (error: unknown) {
          set({ isLoading: false })
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.logout()
        } finally {
          get().clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.refreshToken()
          const data = response.data as Record<string, unknown>
          const token = data.token as string
          set({ token })
          return true
        } catch {
          get().clearAuth()
          return false
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const response = await api.getProfile()
          const data = response.data as Record<string, unknown>
          const user = data.user as User
          const profileTenant = data.tenant as Tenant | undefined
          const role = (data.role as UserRole) || get().role
          // Merge: keep existing tenant data if profile doesn't include it
          const existingTenant = get().tenant
          const tenant = profileTenant
            ? { ...existingTenant, ...profileTenant }
            : existingTenant
          set({ user, tenant, role, isAuthenticated: true, isLoading: false })
          // Fetch full tenant settings (white-label)
          if (tenant?.id) {
            get().fetchTenantSettings()
          }
        } catch {
          get().clearAuth()
        }
      },

      fetchTenantSettings: async () => {
        try {
          const currentTenant = get().tenant
          if (!currentTenant) return

          let settings: Record<string, unknown> | undefined

          // Try authenticated endpoint first (works for TENANT_ADMIN)
          try {
            const response = await api.getTenantSettings()
            const data = response.data as Record<string, unknown>
            settings = data.settings as Record<string, unknown> | undefined
          } catch {
            // Falls back to public endpoint for STUDENT role
          }

          // Fallback: public endpoint by slug
          if (!settings && currentTenant.slug) {
            try {
              const response = await api.getPublicTenantSettings(currentTenant.slug)
              const data = response.data as Record<string, unknown>
              settings = data.tenant as Record<string, unknown> | undefined
            } catch {
              // Silently fail
            }
          }

          if (!settings) return
          set({
            tenant: {
              ...currentTenant,
              name: (settings.name as string) || currentTenant.name,
              logoUrl: (settings.logo_url as string) || currentTenant.logoUrl,
              businessName: (settings.business_name as string) || undefined,
              primaryColor: (settings.primary_color as string) || undefined,
              accentColor: (settings.accent_color as string) || undefined,
              customDomain: (settings.custom_domain as string) || undefined,
              welcomeMessage: (settings.welcome_message as string) || undefined,
              footerText: (settings.footer_text as string) || undefined,
              faviconUrl: (settings.favicon_url as string) || undefined,
            },
          })
        } catch {
          // Silently fail — white-label is non-critical
        }
      },

      getRedirectPath: () => {
        const { role, tenant } = get()
        
        switch (role) {
          case 'SUPER_ADMIN':
            return '/admin/dashboard'
          case 'TENANT_ADMIN':
            return '/admin/dashboard'
          case 'STUDENT':
            return tenant?.slug ? `/${tenant.slug}/student/dashboard` : '/student/dashboard'
          default:
            return '/login'
        }
      },

      hasRole: (role) => {
        return get().role === role
      },

      clearAuth: () => {
        set({
          user: null,
          tenant: null,
          role: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        tenant: state.tenant,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
