import { create } from 'zustand'
import type { AppStats } from '../types/market'

type Tab = 'skills' | 'mcp' | 'memory' | 'sessions' | 'toolsets' | 'market'
type DrawerMode = 'view' | 'edit' | 'create' | null
type DrawerType = 'skill' | 'mcp' | 'soul' | 'memory' | 'session' | 'market-skill' | null

interface AppState {
  // Navigation
  activeTab: Tab
  setActiveTab: (tab: Tab) => void

  // Drawer
  drawerOpen: boolean
  drawerType: DrawerType
  drawerMode: DrawerMode
  drawerData: unknown
  openDrawer: (type: DrawerType, mode: DrawerMode, data?: unknown) => void
  closeDrawer: () => void

  // Stats
  stats: AppStats | null
  setStats: (stats: AppStats) => void

  // Toast
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>
  addToast: (message: string, type: 'success' | 'error' | 'info') => void

  // Market sub-tab
  marketSub: 'skills' | 'mcp' | 'plugins'
  setMarketSub: (sub: 'skills' | 'mcp' | 'plugins') => void

  // Refresh trigger
  refreshKey: number
  incRefreshKey: () => void
}

let toastId = 0

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'skills',
  setActiveTab: (tab) => set({ activeTab: tab }),

  drawerOpen: false,
  drawerType: null,
  drawerMode: null,
  drawerData: null,
  openDrawer: (type, mode, data = null) =>
    set({ drawerOpen: true, drawerType: type, drawerMode: mode, drawerData: data }),
  closeDrawer: () =>
    set({ drawerOpen: false, drawerType: null, drawerMode: null, drawerData: null }),

  stats: null,
  setStats: (stats) => set({ stats }),

  toasts: [],
  addToast: (message, type) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
  },

  marketSub: 'skills',
  setMarketSub: (sub) => set({ marketSub: sub }),

  refreshKey: 0,
  incRefreshKey: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))
