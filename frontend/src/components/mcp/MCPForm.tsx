import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { api } from '../../api/client'
import type { MCPServer } from '../../types/mcp'

export function MCPForm() {
  const data = useAppStore((s) => s.drawerData) as MCPServer | null
  const mode = useAppStore((s) => s.drawerMode)
  const close = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)
  const isEdit = mode === 'edit'

  const [name, setName] = useState(data?.name ?? '')
  const [type, setType] = useState<'stdio' | 'http'>(data?.type ?? 'stdio')
  const [command, setCmd] = useState(data?.command ?? '')
  const [args, setArgs] = useState(data?.args?.join(' ') ?? '')
  const [url, setUrl] = useState(data?.url ?? '')
  const [env, setEnv] = useState(data?.env ? Object.entries(data.env).map(([k, v]) => `${k}=${v}`).join('\n') : '')
  const [autoApprove, setAA] = useState(data?.autoApprove?.join('\n') ?? '')
  const [timeout, setTimeout_] = useState(data?.timeout ?? 60)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return addToast('名称为必填项', 'error')
    setSaving(true)
    try {
      const envObj: Record<string, string> = {}
      if (type === 'stdio' && env.trim()) {
        env.split('\n').forEach((line) => {
          const idx = line.indexOf('=')
          if (idx > 0) envObj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
        })
      }
      const aa = autoApprove.split('\n').map((s) => s.trim()).filter(Boolean)

      if (isEdit && data) {
        await api.updateMCP(data.name, { config: { command, args: args.split(/\s+/).filter(Boolean), env: envObj, autoApprove: aa, timeout } })
        addToast('MCP 已更新 — 请执行 /reload-mcp 生效', 'success')
      } else {
        await api.createMCP({ name, type, command, args: args.split(/\s+/).filter(Boolean), url, env: envObj, autoApprove: aa, timeout })
        addToast('MCP 已添加 — 请执行 /reload-mcp 生效', 'success')
      }
      close()
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>{isEdit ? '编辑 MCP' : '添加 MCP 服务器'}</h2>
        <button className="btn-icon" onClick={close}>✕</button>
      </div>
      <div className="drawer-body">
        <div className="form-group">
          <label className="form-label">名称 *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)}
            readOnly={isEdit} />
        </div>
        <div className="form-group">
          <label className="form-label">类型</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value as 'stdio' | 'http')}
            disabled={isEdit}>
            <option value="stdio">stdio (Command)</option>
            <option value="http">HTTP (URL)</option>
          </select>
        </div>
        {type === 'stdio' ? (
          <>
            <div className="form-group">
              <label className="form-label">命令 *</label>
              <input className="form-input" value={command} onChange={(e) => setCmd(e.target.value)} placeholder="python" />
            </div>
            <div className="form-group">
              <label className="form-label">参数（空格分隔）</label>
              <input className="form-input" value={args} onChange={(e) => setArgs(e.target.value)} placeholder="-m my_mcp" />
            </div>
            <div className="form-group">
              <label className="form-label">环境变量（KEY=VALUE，每行一个）</label>
              <textarea className="form-textarea" value={env} onChange={(e) => setEnv(e.target.value)}
                style={{ minHeight: 80 }} />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label">URL *</label>
            <input className="form-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:8080" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">自动批准工具（每行一个）</label>
          <textarea className="form-textarea" value={autoApprove} onChange={(e) => setAA(e.target.value)}
            style={{ minHeight: 80 }} />
        </div>
        <div className="form-group">
          <label className="form-label">超时 (秒)</label>
          <input className="form-input" type="number" value={timeout} onChange={(e) => setTimeout_(Number(e.target.value))} />
        </div>
      </div>
      <div className="drawer-footer">
        <span></span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={close}>取消</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : isEdit ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </>
  )
}
