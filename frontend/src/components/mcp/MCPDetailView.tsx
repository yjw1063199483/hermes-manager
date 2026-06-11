import { useT } from '../../i18n'
import { useAppStore } from '../../stores/appStore'
import { api } from '../../api/client'
import type { MCPServer } from '../../types/mcp'

export function MCPDetailView() {
  const m = useAppStore((s) => s.drawerData) as MCPServer | null
  const { t } = useT()
  const close = useAppStore((s) => s.closeDrawer)
  const openDrawer = useAppStore((s) => s.openDrawer)
  const addToast = useAppStore((s) => s.addToast)
  if (!m) return null

  const envStr = m.env ? Object.entries(m.env).map(([k, v]) => `${k}=${v}`).join('\n') : ''

  const handleDelete = async () => {
    if (!confirm(t('detail.confirmDeleteMcp', { name: m.name }))) return
    try {
      await api.deleteMCP(m.name)
      addToast('MCP 已移除 — 请执行 /reload-mcp 生效', 'success')
      close()
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>MCP: {m.name}</h2>
        <div className="drawer-header-actions">
          <a className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}
            href={`/api/v1/mcp/${m.name}/export`}
            download={`${m.name}.yaml`}>{t('common.export')}</a>
          <button className="btn btn-secondary btn-sm" onClick={() => openDrawer('mcp', 'edit', m)}>{t('common.edit')}</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>{t('common.remove')}</button>
        </div>
        <button className="btn-icon" onClick={close}>✕</button>
      </div>
      <div className="drawer-body">
        <div className="detail-section">
          <h4>{t('detail.basicInfo')}</h4>
          <div className="detail-meta-grid">
            <div className="detail-meta-item"><div className="label">{t('common.name')}</div><div className="value">{m.name}</div></div>
            <div className="detail-meta-item"><div className="label">{t('common.type')}</div><div className="value"><span className={`mcp-type-badge ${m.type}`}>{m.type}</span></div></div>
          </div>
        </div>
        <div className="detail-section">
          <h4>{m.type === 'stdio' ? t('common.command') : 'URL'}</h4>
          <pre className="code-block">{m.type === 'stdio' ? `${m.command} ${(m.args ?? []).join(' ')}` : m.url}</pre>
        </div>
        {envStr && (
          <div className="detail-section">
            <h4>{t('common.env')}</h4>
            <pre className="code-block">{envStr}</pre>
          </div>
        )}
        <div className="detail-section">
          <h4>{t('common.autoApprove')} ({m.autoApprove?.length ?? 0})</h4>
          <pre className="code-block">{(m.autoApprove ?? []).join('\n') || t('common.none')}</pre>
        </div>
      </div>
      <div className="drawer-footer">
        <span className="drawer-footer-hint">{t('common.key')}</span>
      </div>
    </>
  )
}
