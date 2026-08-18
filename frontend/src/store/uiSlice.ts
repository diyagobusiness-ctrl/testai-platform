import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type SidebarState = 'expanded' | 'collapsed'

interface UIState {
  theme: Theme
  sidebarState: SidebarState
  isMobileMenuOpen: boolean
  isCommandPaletteOpen: boolean
  notifications: Notification[]
  
  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarState: (state: SidebarState) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  createdAt: Date
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarState: 'expanded',
      isMobileMenuOpen: false,
      isCommandPaletteOpen: false,
      notifications: [],

      setTheme: (theme) => {
        set({ theme })
        
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement
          root.classList.remove('light', 'dark')
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            root.classList.add(systemTheme)
          } else {
            root.classList.add(theme)
          }
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },

      setSidebarState: (sidebarState) => set({ sidebarState }),

      toggleSidebar: () => {
        const { sidebarState } = get()
        set({ sidebarState: sidebarState === 'expanded' ? 'collapsed' : 'expanded' })
      },

      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),

      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 10),
        }))

        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarState: state.sidebarState,
      }),
    }
  )
)
