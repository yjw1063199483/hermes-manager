import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import { api } from './api/client'
import { Sidebar } from './components/layout/Sidebar'
import { Drawer } from './components/layout/Drawer'
import { ToastContainer } from './components/layout/Toast'
import { SkillsPanel } from './components/skills/SkillsPanel'
import { MCPPanel } from './components/mcp/MCPPanel'
import { ToolsetsPanel } from './components/toolsets/ToolsetsPanel'
import { MarketPanel } from './components/market/MarketPanel'
import { MemoryPanel } from './components/layout/MemoryPanel'
import { SessionsPanel } from './components/sessions/SessionsPanel'

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setStats = useAppStore((s) => s.setStats)

  useEffect(() => {
    api.getStats().then((d) => setStats(d)).catch(() => {})
  }, [setStats])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main className="main-content">
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'mcp' && <MCPPanel />}
        {activeTab === 'memory' && <MemoryPanel />}
        {activeTab === 'sessions' && <SessionsPanel />}
        {activeTab === 'toolsets' && <ToolsetsPanel />}
        {activeTab === 'market' && <MarketPanel />}
      </main>
      <Drawer />
      <ToastContainer />
    </div>
  )
}
