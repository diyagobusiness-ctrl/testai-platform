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
          const { user, tenant, role, token } = response.data

          set({
            user,
            tenant,
            role,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

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
          const { token } = response.data
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
          const { user, tenant, role } = response.data
          set({ user, tenant, role, isAuthenticated: true, isLoading: false })
        } catch {
          get().clearAuth()
        }
      },

      getRedirectPath: () => {
        const { role } = get()
        
        switch (role) {
          case 'SUPER_ADMIN':
            return '/admin/dashboard'
          case 'TENANT_ADMIN':
            return '/admin/dashboard'
          case 'STUDENT':
            return '/student/dashboard'
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
