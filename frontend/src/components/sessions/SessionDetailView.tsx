import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { useT } from '../../i18n'
import { useAppStore } from '../../stores/appStore'

type Message = { id: number; role: string; content: string | null; tool_name: string | null; timestamp: string | null }

export function SessionDetailView() {
  const data = useAppStore((s) => s.drawerData) as { session_id: string; title: string | null } | null
  const { t } = useT()
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    if (!data) return
    setLoading(true)
    api.getSessionMessages(data.session_id, search)
      .then((d) => setMessages(d.messages))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [data, search])

  if (!data) return null

  return (
    <>
      <div className="drawer-header">
        <h2>{data.title || data.session_id.slice(0, 12)}</h2>
        <button className="btn-icon" onClick={closeDrawer}>✕</button>
      </div>
      <div className="drawer-body">
        <div style={{ marginBottom: 14 }}>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder={t('detail.search')} value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</p>
        ) : messages.length === 0 ? (
          <div className="empty-state"><p>{search ? t('detail.noMatchMsg') : t('detail.noMsg')}</p></div>
        ) : (
          <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {messages.map((m) => (
              <div key={m.id} style={{
                padding: '8px 12px', marginBottom: 6, borderRadius: 6,
                background: m.role === 'user' ? 'var(--accent-glow)' : 'var(--bg-input)',
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{
                    fontWeight: 600, fontSize: 10, textTransform: 'uppercase',
                    color: m.role === 'user' ? 'var(--accent)' : 'var(--green)',
                  }}>{m.role}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10 }}>{m.timestamp}</span>
                </div>
                {m.content && (
                  <div style={{
                    color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5,
                    maxHeight: 300, overflowY: 'auto', fontSize: 13,
                  }}>
                    {m.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="drawer-footer">
        <span className="drawer-footer-hint">
          {t('detail.messages', { n: messages.length })}{search ? ` · 搜索: "${search}"` : ''}
        </span>
      </div>
    </>
  )
}
