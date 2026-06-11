import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

type Session = {
  id: string; title: string | null; model: string | null; started_at: string | null
  message_count: number; input_tokens: number; output_tokens: number
  estimated_cost_usd: number | null; source: string | null
}

const PAGE_SIZE = 20

export function SessionsPanel() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const openDrawer = useAppStore((s) => s.openDrawer)
  const addToast = useAppStore((s) => s.addToast)

  const copySessionId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id).then(() => {
      addToast('会话ID已复制，可用 hermes -r ' + id.slice(0, 12) + '... 打开', 'success')
    }).catch(() => {
      addToast('复制失败', 'error')
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api.getSessions(page, PAGE_SIZE, search)
      setSessions(d.sessions)
      setTotal(d.total)
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const enterSelect = () => { setSelectMode(true); setSelected(new Set()) }
  const cancelSelect = () => { setSelectMode(false); setSelected(new Set()) }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === sessions.length) setSelected(new Set())
    else setSelected(new Set(sessions.map((s) => s.id)))
  }

  const batchDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`确定删除 ${selected.size} 个会话？不可撤销。`)) return
    try {
      await api.batchDeleteSessions([...selected])
      cancelSelect()
      load()
    } catch (e: unknown) { alert((e as Error).message) }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const totalTokens = sessions.reduce((a, s) => a + s.input_tokens + s.output_tokens, 0)

  return (
    <section className="panel active">
      <header className="panel-header">
        <div>
          <h1>History</h1>
          <p className="subtitle">共 {total} 个会话，{totalTokens.toLocaleString()} tokens</p>
        </div>
        <div className="header-actions" style={{ gap: 8 }}>
          {selectMode ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>已选 {selected.size}</span>
              <button className="btn btn-secondary btn-sm" onClick={toggleAll}>
                {selected.size === sessions.length ? '取消全选' : '全选'}
              </button>
              <button className="btn btn-danger btn-sm" disabled={selected.size === 0}
                onClick={batchDelete}>确认删除</button>
              <button className="btn btn-secondary btn-sm" onClick={cancelSelect}>取消</button>
            </>
          ) : (
            <>
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input placeholder="搜索..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <button className="btn btn-danger btn-sm" onClick={enterSelect}>删除</button>
            </>
          )}
        </div>
      </header>

      <div className="mcp-list">
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: 20 }}>加载中...</p>
        ) : sessions.length === 0 ? (
          <div className="empty-state"><p>暂无会话</p></div>
        ) : (
          sessions.map((s) => {
            const isSel = selected.has(s.id)
            const isSelectMode = selectMode
            return (
              <div key={s.id} className="mcp-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (isSelectMode) toggleSelect(s.id)
                  else openDrawer('session', 'view', { session_id: s.id, title: s.title })
                }}>
                <div className="mcp-info" style={{ display: 'flex', gap: isSelectMode ? 10 : 0, alignItems: 'flex-start' }}>
                  {isSelectMode && (
                    <input type="checkbox" checked={isSel} readOnly
                      style={{ marginTop: 4, accentColor: 'var(--accent)', width: 16, height: 16, pointerEvents: 'none' }} />
                  )}
                  <div style={{ flex: 1, borderColor: isSelectMode && isSel ? 'var(--accent)' : undefined }}>
                    <div className="mcp-info-header">
                      <span className="mcp-name">{s.title || s.id.slice(0, 8)}</span>
                      <span className="skill-category" style={{ fontSize: 10 }}>{s.model || '-'}</span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                      fontSize: 11, color: 'var(--text-muted)',
                    }}>
                      <code style={{
                        fontSize: 11, padding: '1px 6px', borderRadius: 3,
                        background: 'var(--bg-raised)', color: 'var(--text-secondary)',
                      }}>{s.id}</code>
                      <button
                        onClick={(e) => copySessionId(s.id, e)}
                        title="复制"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, border: 'none', borderRadius: 4,
                          background: 'transparent', color: 'var(--text-muted)',
                          cursor: 'pointer', padding: 0,
                        }}
                      >
                        <CopyIcon />
                      </button>
                    </div>
                    <div className="mcp-meta" style={{ gap: 14 }}>
                      <span>💬 {s.message_count}</span>
                      <span>📥 {s.input_tokens.toLocaleString()}</span>
                      <span>📤 {s.output_tokens.toLocaleString()}</span>
                      {s.estimated_cost_usd != null && (
                        <span>💲 ${s.estimated_cost_usd.toFixed(4)}</span>
                      )}
                      <span>🕐 {s.started_at || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {totalPages > 1 && !selectMode && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}
            onClick={() => setPage(page - 1)}>上一页</button>
          <span className="pagination-info">{page} / {totalPages}（共 {total} 条）</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}>下一页</button>
        </div>
      )}
    </section>
  )
}
