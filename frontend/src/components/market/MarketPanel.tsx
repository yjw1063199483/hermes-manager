import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'
import { useT } from '../../i18n'
import type { MarketPlugin } from '../../types/market'

export function MarketPanel() {
  const sub = useAppStore((s) => s.marketSub)
  const setSub = useAppStore((s) => s.setMarketSub)
  const { t } = useT()

  return (
    <section className="panel active">
      <header className="panel-header">
        <div>
          <h1>{t('panel.market')}</h1>
          <p className="subtitle">发现和安装技能、MCP 服务器、插件</p>
        </div>
      </header>
      <div className="market-tabs">
        {(['skills', 'mcp', 'plugins'] as const).map((s) => (
          <button key={s} className={`market-tab ${sub === s ? 'active' : ''}`}
            onClick={() => setSub(s)}>
            {s === 'skills' ? t('market.skillsHub') : s === 'mcp' ? t('market.mcpCatalog') : t('market.plugins')}
          </button>
        ))}
      </div>
      {sub === 'skills' && <SkillsHub />}
      {sub === 'mcp' && <MCPMarketList />}
      {sub === 'plugins' && <PluginMarket />}
    </section>
  )
}

/** 终端命令执行器 */
function TerminalRunner() {
  const addToast = useAppStore((s) => s.addToast)
  const { t } = useT()
  const [cmd, setCmd] = useState('')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const install = async () => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setRunning(true)
    setProgress(0)

    const timer = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15 + 5, 90))
    }, 300)

    try {
      const resp = await fetch('/api/v1/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed }),
      })
      const data = await resp.json()
      clearInterval(timer)

      if (data.ok) {
        setProgress(100)
        addToast(t('market.terminalSuccess'), 'success')
        useAppStore.getState().incRefreshKey()
      } else {
        setProgress(0)
        addToast(data.output || t('market.terminalFail'), 'error')
      }
    } catch (e: unknown) {
      clearInterval(timer)
      setProgress(0)
      addToast((e as Error).message, 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{
      marginTop: 24, padding: '16px 20px', borderRadius: 10,
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      width: '100%', maxWidth: 600, textAlign: 'left',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t('market.terminalTitle')}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>$</span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') install() }}
          placeholder={t('market.terminalPlaceholder')}
          style={{
            flex: 1, background: '#0d0d1a', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 12px', fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
        <button className="btn btn-primary btn-sm" onClick={install} disabled={running || !cmd.trim()}
          style={{ whiteSpace: 'nowrap', minWidth: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 14px' }}>
          {running ? t('market.installing') : t('market.install')}
        </button>
      </div>
      {running && (
        <div style={{ marginTop: 10 }}>
          <div style={{
            height: 4, borderRadius: 2, background: 'var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: progress === 100 ? 'var(--green)' : 'var(--accent)',
              width: `${progress}%`,
              transition: 'width 0.2s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  )
}

function MCPTerminalRunner() {
  const addToast = useAppStore((s) => s.addToast)
  const { t } = useT()
  const [cmd, setCmd] = useState('')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const install = async () => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setRunning(true)
    setProgress(0)

    const timer = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15 + 5, 90))
    }, 300)

    try {
      const resp = await fetch('/api/v1/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed }),
      })
      const data = await resp.json()
      clearInterval(timer)

      if (data.ok) {
        setProgress(100)
        addToast(t('market.terminalSuccess'), 'success')
      } else {
        setProgress(0)
        addToast(data.output || t('market.terminalFail'), 'error')
      }
    } catch (e: unknown) {
      clearInterval(timer)
      setProgress(0)
      addToast((e as Error).message, 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{
      marginTop: 24, padding: '16px 20px', borderRadius: 10,
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      width: '100%', maxWidth: 600, textAlign: 'left',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t('market.mcpTerminalTitle')}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>$</span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') install() }}
          placeholder={t('market.mcpTerminalPlaceholder')}
          style={{
            flex: 1, background: '#0d0d1a', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 12px', fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
        <button className="btn btn-primary btn-sm" onClick={install} disabled={running || !cmd.trim()}
          style={{ whiteSpace: 'nowrap', minWidth: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 14px' }}>
          {running ? t('market.installing') : t('market.install')}
        </button>
      </div>
      {running && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: progress === 100 ? 'var(--green)' : 'var(--accent)',
              width: `${progress}%`,
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

function SkillsHub() {
  const { t } = useT()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 220px)', gap: 20, textAlign: 'center', padding: 40
    }}>
      <div style={{ fontSize: 56 }}>🛒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t('market.skillsTitle')}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.7, fontSize: 14, margin: 0 }}>
        {t('market.skillsDesc')}
      </p>
      <a href="https://skills.sh" target="_blank" rel="noopener"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 32px', borderRadius: 8,
          background: 'var(--accent)', color: '#fff',
          textDecoration: 'none', fontSize: 15, fontWeight: 600,
        }}>
        {t('market.openSkillsSh')}
      </a>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
        {t('market.skillsHint')}
      </p>

      <TerminalRunner />
    </div>
  )
}

function MCPMarketList() {
  const { t } = useT()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 220px)', gap: 20, textAlign: 'center', padding: 40
    }}>
      <div style={{ fontSize: 56 }}>🔌</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t('market.mcpTitle')}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.7, fontSize: 14, margin: 0 }}>
        {t('market.mcpDesc')}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="https://mcp.so" target="_blank" rel="noopener"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 32px', borderRadius: 8,
            background: 'var(--accent)', color: '#fff',
            textDecoration: 'none', fontSize: 15, fontWeight: 600,
          }}>
          mcp.so ↗
        </a>
        <a href="https://smithery.ai" target="_blank" rel="noopener"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 32px', borderRadius: 8,
            border: '1px solid var(--accent)', color: 'var(--accent)',
            textDecoration: 'none', fontSize: 15, fontWeight: 600,
          }}>
          smithery.ai ↗
        </a>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
        {t('market.mcpHint')}
      </p>

      <MCPTerminalRunner />
    </div>
  )
}

function PluginMarket() {
  const addToast = useAppStore((s) => s.addToast)
  const { t } = useT()
  const [items, setItems] = useState<MarketPlugin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPlugins()
      .then((d) => setItems(d.plugins.map((p: MarketPlugin) => ({ ...p, enabled: p.status === 'enabled' }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 20, color: 'var(--text-muted)' }}>{t('common.loading')}</p>

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: 'calc(100vh - 220px)', gap: 20, padding: 40
    }}>
      <div style={{ fontSize: 56 }}>🧩</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t('market.pluginsTitle')}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.7, fontSize: 14, margin: 0, textAlign: 'center' }}>
        {t('market.pluginsDesc')}
      </p>

      <div style={{ width: '100%', maxWidth: 500 }}>
        {items.map((p) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>
            </div>
            <button className="btn btn-sm btn-secondary"
              onClick={() => api.togglePlugin(p.name, !p.enabled)
                .then(() => {
                  setItems(prev => prev.map(i => i.name === p.name ? { ...i, enabled: !p.enabled } : i))
                  addToast(p.enabled ? t('common.disabled') : t('common.enabled'), 'success')
                })
                .catch((e: Error) => addToast(e.message, 'error'))}>
              {p.enabled ? t('common.enabled') : t('common.disabled')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
