import { useEffect, useState, useCallback } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'
import { useT } from '../../i18n'
import type { SkillSummary } from '../../types/skill'

const PAGE_SIZE = 10

export function SkillsPanel() {
  const [skills, setSkills] = useState<SkillSummary[]>([])         // 列表模式当前页
  const [allSkills, setAllSkills] = useState<SkillSummary[] | null>(null)  // 卡片模式全量（null=未加载）
  const { t } = useT()
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list')
  const [page, setPage] = useState(1)
  const openDrawer = useAppStore((s) => s.openDrawer)
  const setStats = useAppStore((s) => s.setStats)
  const refreshKey = useAppStore((s) => s.refreshKey)

  // 列表模式：分页加载
  const loadPage = useCallback(async (p: number) => {
    const data = await api.getSkills(p, PAGE_SIZE)
    setSkills(data.skills)
    setTotal(data.total)
    api.getStats().then((d) => setStats(d)).catch(() => {})
  }, [setStats])

  useEffect(() => { loadPage(1) }, [loadPage, refreshKey])
  const loadAll = useCallback(async () => {
    const data = await api.getSkills(1, 200)
    setAllSkills(data.skills)
  }, [])

  // 首次加载首页
  useEffect(() => { loadPage(1) }, [loadPage])

  // 翻页时加载对应页
  const goPage = (p: number) => { setPage(p); loadPage(p) }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const allCategories = allSkills
    ? ['all', ...new Set(allSkills.map((s) => s.category))]
    : []

  const filtered = (allSkills ?? skills).filter((s) => {
    if (category !== 'all' && s.category !== category) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())
      && !s.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <section className="panel active">
      <header className="panel-header">
        <div>
          <h1>{t('panel.skills')}</h1>
          <p className="subtitle">{t('panel.skills.subtitle')}</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}>{t('common.list')}</button>
            <button className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setViewMode('card'); if (!allSkills) loadAll() }}>{t('common.card')}</button>
          </div>
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder={t('skills.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <button className="btn btn-primary" onClick={() => openDrawer('skill', 'create')}>
            {t('skills.create')}
          </button>
        </div>
      </header>

      {viewMode === 'card' && allCategories.length > 0 && (
        <div className="category-filter">
          {allCategories.map((c) => (
            <span key={c} className={`cat-chip ${category === c ? 'active' : ''}`}
              onClick={() => { setCategory(c); setPage(1) }}>
              {c}
            </span>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state"><p>{t('common.noMatch')}</p></div>
      ) : viewMode === 'card' ? (
        <div className="skill-grid">
          {filtered.map((s) => (
            <div key={`${s.category}/${s.dir_name}`} className="skill-card"
              onClick={() => openDrawer('skill', 'view', s)}>
              <div className="skill-card-header">
                <span className="skill-name">{s.name}</span>
                <span className="skill-category">{s.category}</span>
              </div>
              <div className="skill-desc">{s.description || t('common.noDesc')}</div>
              <div className="skill-meta">
                <div className="skill-tags">
                  {s.tags?.slice(0, 4).map((t) => <span key={t} className="skill-tag">{t}</span>)}
                </div>
                <span className="skill-size">{formatSize(s.size)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mcp-list">
            {filtered.map((s) => (
              <div key={`${s.category}/${s.dir_name}`} className="mcp-card"
                onClick={() => openDrawer('skill', 'view', s)}>
                <div className="mcp-info">
                  <div className="mcp-info-header">
                    <span className="mcp-name">{s.name}</span>
                    <span className="skill-category" style={{ fontSize: 10 }}>{s.category}</span>
                  </div>
                  <div className="mcp-detail">{s.description || t('common.noDesc')}</div>
                  <div className="mcp-meta">
                    <span>{s.tags?.slice(0, 4).join(', ') || '-'}</span>
                    <span>{formatSize(s.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1}
                onClick={() => goPage(page - 1)}>{t('history.prevPage')}</button>
              <span className="pagination-info">{page} / {totalPages}（{t('common.total')} {total} 条）</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages}
                onClick={() => goPage(page + 1)}>{t('history.nextPage')}</button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
