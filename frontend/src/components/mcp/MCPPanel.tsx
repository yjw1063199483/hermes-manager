import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'
import type { MCPServer } from '../../types/mcp'

const PAGE_SIZE = 10

export function MCPPanel() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const openDrawer = useAppStore((s) => s.openDrawer)
  const setStats = useAppStore((s) => s.setStats)

  const load = useCallback(async () => {
    const data = await api.getMCPServers(page, PAGE_SIZE)
    setServers(data.servers)
    setTotal(data.total)
    api.getStats().then((d) => setStats(d)).catch(() => {})
  }, [page, setStats])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <section className="panel active">
      <header className="panel-header">
        <div>
          <h1>MCP</h1>
          <p className="subtitle">配置 Model Context Protocol 服务器</p>
        </div>
        <button className="btn btn-primary" onClick={() => openDrawer('mcp', 'create')}>
          + 添加服务器
        </button>
      </header>

      <div className="mcp-list">
        {servers.map((m) => (
          <div key={m.name} className="mcp-card" onClick={() => openDrawer('mcp', 'view', m)}>
            <div className="mcp-info">
              <div className="mcp-info-header">
                <span className="mcp-name">{m.name}</span>
                <span className={`mcp-type-badge ${m.type}`}>{m.type}</span>
              </div>
              <div className="mcp-detail">{m.type === 'stdio' ? `${m.command} ${m.args?.join(' ') ?? ''}` : m.url}</div>
              <div className="mcp-meta">
                <span>{m.autoApprove?.length ?? 0} 个自动批准工具</span>
                {m.timeout ? <span>超时: {m.timeout}s</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button className="btn btn-secondary btn-sm" disabled={page <= 1}
          onClick={() => setPage(page - 1)}>上一页</button>
        <span className="pagination-info">{page} / {totalPages}（共 {total} 条）</span>
        <button className="btn btn-secondary btn-sm" disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}>下一页</button>
      </div>
    </section>
  )
}