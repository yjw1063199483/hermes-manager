import { useAppStore } from '../../stores/appStore'
import type { AppStats } from '../../types/market'

const tabs = [
  { id: 'skills' as const, label: 'Skills', icon: '📚', badge: (s: AppStats) => s?.skills_count },
  { id: 'mcp' as const, label: 'MCP', icon: '🔌', badge: (s: AppStats) => s?.mcp_count },
  { id: 'memory' as const, label: 'Memory', icon: '🧩' },
  { id: 'sessions' as const, label: 'History', icon: '💬' },
  { id: 'toolsets' as const, label: 'Toolsets', icon: '⚙️' },
]

export function Sidebar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const stats = useAppStore((s) => s.stats)
  const openDrawer = useAppStore((s) => s.openDrawer)

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
            <path d="M8 22V10l8 6-8 6zM16 22V10l8 6-8 6z" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span>Hermes Manager</span>
        </div>
      </div>

      <div className="nav-items">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => t.id === 'memory' ? setActiveTab('memory') : setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && stats && (
              <span className="badge">{t.badge(stats)}</span>
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => openDrawer('soul', 'view')}
          style={{ width: '100%', marginBottom: 4 }}>
          <span>🧠</span>
          <span>人设</span>
        </button>
        <button className="nav-item" onClick={() => setActiveTab('market')}
          style={{ width: '100%', marginBottom: 4 }}>
          <span>🛒</span>
          <span>市场</span>
        </button>
        <a className="nav-item" href="/api/v1/export" download="hermes-export.zip"
          style={{ width: '100%', textDecoration: 'none' }}>
          <span>📦</span>
          <span>导出配置</span>
        </a>
        <div className="stats-mini">
          <div className="stat-line">
            <span className="stat-label">Model</span>
            <span className="stat-value">{stats?.model ?? '-'}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
