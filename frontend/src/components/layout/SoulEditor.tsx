import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'

export function SoulEditor() {
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(true)  // 默认预览
  const [saving, setSaving] = useState(false)
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)

  useEffect(() => {
    api.getSoul()
      .then((d) => { setContent(d.content); setOriginal(d.content) })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateSoul(content)
      setOriginal(content)
      addToast('SOUL.md 已保存 — 下次对话即刻生效', 'success')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const changed = content !== original

  return (
    <>
      <div className="drawer-header">
        <h2>人设 · SOUL.md</h2>
        <div className="drawer-header-actions">
          <button className="btn btn-secondary btn-sm"
            onClick={() => setPreview(!preview)}>
            {preview ? '编辑' : '预览'}
          </button>
        </div>
        <button className="btn-icon" onClick={closeDrawer}>✕</button>
      </div>
      <div className="drawer-body">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
        ) : preview ? (
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          <textarea
            className="form-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: 'calc(100vh - 200px)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6 }}
          />
        )}
      </div>
      <div className="drawer-footer">
        <span className="drawer-footer-hint">
          {changed ? '⚠ 有未保存的更改' : 'SOUL.md 在每次对话开始时加载'}
        </span>
        <button className="btn btn-primary" onClick={handleSave} disabled={!changed || saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </>
  )
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/(?:^\|.+\|\s*$\n?)+/gm, (block) => {
    const lines = block.trim().split('\n')
    if (lines.length < 2) return block
    let result = '<table>'; let inHead = true
    for (const line of lines) {
      const cells = line.split('|').map((c) => c.trim()).filter((c) => c !== '')
      if (cells.every((c) => /^[-:]+$/.test(c))) { inHead = false; result += '</thead><tbody>'; continue }
      result += '<tr>' + cells.map((c) => `<${inHead ? 'th' : 'td'}>${c}</${inHead ? 'th' : 'td'}>`).join('') + '</tr>'
    }
    return result + '</tbody></table>'
  })
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>')
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  return '<p>' + html + '</p>'
}
