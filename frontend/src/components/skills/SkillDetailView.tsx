import { useState, useEffect } from 'react'
import { useT } from '../../i18n'
import { useAppStore } from '../../stores/appStore'
import { api } from '../../api/client'
import type { SkillSummary } from '../../types/skill'

export function SkillDetailView() {
  const data = useAppStore((s) => s.drawerData) as SkillSummary
  const { t } = useT()
  const openDrawer = useAppStore((s) => s.openDrawer)
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!data) return
    setLoading(true)
    api.getSkill(data.category, data.dir_name)
      .then((d) => setBody(d.body))
      .catch(() => setBody(''))
      .finally(() => setLoading(false))
  }, [data])

  if (!data) return null

  const handleDelete = async () => {
    if (!confirm(t('detail.confirmDelete', { name: data.name }))) return
    try {
      await api.deleteSkill(data.category, data.dir_name)
      addToast('Skill 已删除 — 请执行 /reload-skills 生效', 'success')
      closeDrawer()
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>{data.name}</h2>
        <div className="drawer-header-actions">
          <a className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}
            href={`/api/v1/skills/${data.category}/${data.dir_name}/export`}
            download={`${data.name}.md`}>{t('common.export')}</a>
          <button className="btn btn-secondary btn-sm"
            onClick={() => openDrawer('skill', 'edit', data)}>{t('common.edit')}</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>{t('common.delete')}</button>
        </div>
        <button className="btn-icon" onClick={closeDrawer}>✕</button>
      </div>
      <div className="drawer-body">
        <div className="detail-section">
          <h4>{t('detail.metadata')}</h4>
          <div className="detail-meta-grid">
            <div className="detail-meta-item"><div className="label">{t('detail.category')}</div><div className="value">{data.category}</div></div>
            <div className="detail-meta-item"><div className="label">{t('detail.version')}</div><div className="value">{data.version}</div></div>
            <div className="detail-meta-item"><div className="label">{t('detail.author')}</div><div className="value">{data.author}</div></div>
            <div className="detail-meta-item"><div className="label">{t('detail.size')}</div><div className="value">{formatSize(data.size)}</div></div>
          </div>
        </div>
        {data.tags?.length > 0 && (
          <div className="detail-section">
            <h4>{t('detail.tags')}</h4>
            <div className="skill-tags">
              {data.tags.map((t) => <span key={t} className="skill-tag">{t}</span>)}
            </div>
          </div>
        )}
        <div className="detail-section">
          <h4>{t('detail.content')}</h4>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</p>
          ) : body ? (
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('detail.noContent')}</p>
          )}
        </div>
      </div>
      <div className="drawer-footer">
        <span className="drawer-footer-hint">{t('common.key')}</span>
      </div>
    </>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Tables
  html = html.replace(/(?:^\|.+\|\s*$\n?)+/gm, (block) => {
    const lines = block.trim().split('\n')
    if (lines.length < 2) return block
    let result = '<table>'
    let inHead = true
    for (const line of lines) {
      const cells = line.split('|').map((c) => c.trim()).filter((c) => c !== '')
      if (cells.every((c) => /^[-:]+$/.test(c))) { inHead = false; result += '</thead><tbody>'; continue }
      const tag = inHead ? 'th' : 'td'
      result += '<tr>' + cells.map((c) => `<${tag}>${c}</${tag}>`).join('') + '</tr>'
    }
    return result + '</tbody></table>'
  })

  // Bold, headers, lists
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = '<p>' + html + '</p>'
  html = html.replace(/<p><\/p>/g, '')

  return html
}
