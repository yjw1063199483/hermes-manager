import { useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useT } from '../../i18n'
import type { AppStats } from '../../types/market'

const tabs = [
  { id: 'skills' as const, tkey: 'sidebar.skills', icon: '📚', badge: (s: AppStats) => s?.skills_count },
  { id: 'mcp' as const, tkey: 'sidebar.mcp', icon: '🔌', badge: (s: AppStats) => s?.mcp_count },
  { id: 'memory' as const, tkey: 'sidebar.memory', icon: '🧩' },
  { id: 'sessions' as const, tkey: 'sidebar.history', icon: '💬' },
  { id: 'toolsets' as const, tkey: 'sidebar.toolsets', icon: '⚙️' },
]

export function Sidebar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const stats = useAppStore((s) => s.stats)
  const openDrawer = useAppStore((s) => s.openDrawer)
  const addToast = useAppStore((s) => s.addToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, lang, setLang } = useT()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const resp = await fetch('/api/v1/import', { method: 'POST', body: formData })
      const data = await resp.json()
      if (data.ok) {
        addToast(data.message || t('import.success'), 'success')
      } else {
        addToast(data.detail || t('import.fail'), 'error')
      }
    } catch (err: unknown) {
      addToast((err as Error).message, 'error')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{t(tab.tkey)}</span>
            {tab.badge && stats && (
              <span className="badge">{tab.badge(stats)}</span>
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => openDrawer('soul', 'view')}
          style={{ width: '100%', marginBottom: 4 }}>
          <span>🧠</span>
          <span>{t('sidebar.soul')}</span>
        </button>
        <button className="nav-item" onClick={() => setActiveTab('market')}
          style={{ width: '100%', marginBottom: 4 }}>
          <span>🛒</span>
          <span>{t('sidebar.market')}</span>
        </button>
        <div className="nav-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-start', padding: '8px 12px' }}>
          <a href="/api/v1/export" download="hermes-export.zip"
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📦</span>
            <span style={{ fontSize: 13 }}>{t('common.export')}</span>
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, margin: '0 4px' }}>|</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 13 }}>
            {t('common.import')}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".zip"
          style={{ display: 'none' }} onChange={handleImport} />

        {/* Language Toggle */}
        <button className="nav-item"
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
          <span>🌐</span>
          <span>{lang === 'zh' ? 'English' : '中文'}</span>
        </button>

        <div className="stats-mini">
          <div className="stat-line">
            <span className="stat-label" style={{ whiteSpace: 'nowrap' }}>{stats?.model ?? '-'}</span>
          </div>
          <button
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 11, padding: 0,
              textAlign: 'left', whiteSpace: 'nowrap',
            }}
            onClick={async () => {
              try {
                const r = await fetch('/api/v1/update/check')
                const d = await r.json()
                if (d.error) {
                  addToast('检查失败: ' + d.error, 'error')
                } else if (d.has_update) {
                  if (confirm(`发现新版本 v${d.latest}（当前 v${d.current}），是否立即升级？`)) {
                    addToast('⏳ 正在升级...', 'info')
                    const ur = await fetch('/api/v1/update/upgrade', { method: 'POST' })
                    const ud = await ur.json()
                    addToast(ud.ok ? '✅ ' + ud.message : '❌ ' + (ud.error || '失败'), ud.ok ? 'success' : 'error')
                  }
                } else {
                  addToast(`✅ 已是最新 (v${d.current})`, 'success')
                }
              } catch { addToast('检查失败', 'error') }
            }}>
            🔄 v2.3.5
          </button>
        </div>
      </div>
    </nav>
  )
}
