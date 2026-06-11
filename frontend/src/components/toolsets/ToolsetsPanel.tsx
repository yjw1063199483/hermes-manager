import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'

export function ToolsetsPanel() {
  const [platformToolsets, setPT] = useState<Record<string, string[]>>({})
  const [disabledToolsets, setDT] = useState<string[]>([])
  const addToast = useAppStore((s) => s.addToast)

  const load = useCallback(async () => {
    const data = await api.getToolsets()
    setPT(data.platform_toolsets ?? {})
    setDT(data.disabled_toolsets ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = (platform: string, tool: string) => {
    setPT((prev) => {
      const current = prev[platform] ?? []
      if (current.includes(tool)) {
        return { ...prev, [platform]: current.filter((t) => t !== tool) }
      }
      return { ...prev, [platform]: [...current, tool] }
    })
  }

  const save = async () => {
    try {
      await api.saveToolsets({ platform_toolsets: platformToolsets, disabled_toolsets: disabledToolsets })
      addToast('工具集已保存 — 需 /reset 新会话生效', 'info')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <section className="panel active">
      <header className="panel-header">
        <div>
          <h1>Toolsets</h1>
          <p className="subtitle">按平台启用或禁用工具组</p>
        </div>
        <button className="btn btn-primary" onClick={save}>💾 保存更改</button>
      </header>

      {Object.entries(platformToolsets).map(([platform, tools]) => (
        <div key={platform} className="toolset-platform">
          <h3>{platform}</h3>
          <div className="toolset-grid">
            {tools.map((tool) => {
              const enabled = platformToolsets[platform]?.includes(tool) ?? false
              return (
                <div key={tool} className={`toolset-item ${enabled ? 'enabled' : ''}`}
                  onClick={() => toggle(platform, tool)}>
                  <div className="toggle-switch" />
                  <span>{tool}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {disabledToolsets.length > 0 && (
        <div className="toolset-platform">
          <h3>全局禁用</h3>
          <div className="toolset-grid">
            {disabledToolsets.map((tool) => (
              <div key={tool} className="toolset-item"
                onClick={() => setDT((prev) => prev.filter((t) => t !== tool))}>
                <div className="toggle-switch" />
                <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>{tool}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
