import { useState, useEffect, useMemo } from 'react'
import { marked } from 'marked'
import { api } from '../../api/client'
import { useT } from '../../i18n'
import { useAppStore } from '../../stores/appStore'

export function MarketSkillDetail() {
  const data = useAppStore((s) => s.drawerData) as { owner: string; repo: string; skillId: string; name: string } | null
  const { t } = useT()
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)
  const [detail, setDetail] = useState<{ description: string; body: string; url: string; is_official: boolean; installs: number; source: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [translatedDesc, setTranslatedDesc] = useState('')
  const [translatedBody, setTranslatedBody] = useState('')
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    if (!data) return
    api.getMarketSkillDetail(data.owner, data.repo, data.skillId)
      .then((d) => setDetail(d))
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [data, addToast])

  const bodyHtml = useMemo(() => {
    if (!detail?.body) return ''
    const src = translatedBody || detail.body
    return marked(src, { breaks: true, gfm: true }) as string
  }, [detail?.body, translatedBody])

  const doTranslate = async () => {
    if (!detail) return
    setTranslating(true)
    try {
      const resp = await fetch('/api/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: detail.description + '\n\n---BODY---\n\n' + detail.body }),
      })
      const data = await resp.json()
      const parts = data.text.split('---BODY---')
      setTranslatedDesc(parts[0]?.trim() || '')
      setTranslatedBody(parts[1]?.trim() || '')
    } catch {
      addToast('翻译失败', 'error')
    } finally {
      setTranslating(false)
    }
  }

  if (!data) return null

  const install = async () => {
    try {
      await api.installMarketSkill(`${data.owner}/${data.repo}/${data.skillId}`)
      addToast('安装成功 — /reload-skills 生效', 'success')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>{detail?.name || data.name}</h2>
        <div className="drawer-header-actions">
          <button className="btn btn-primary btn-sm" onClick={install}>{t('market.install')}</button>
          <button className="btn-icon" onClick={closeDrawer}>✕</button>
        </div>
      </div>
      <div className="drawer-body" style={{ paddingBottom: 60 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</p>
        ) : detail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 统计栏 */}
            <div style={{
              display: 'flex', gap: 24, flexWrap: 'wrap',
              padding: '14px 16px', borderRadius: 10,
              background: 'var(--bg-input)', border: '1px solid var(--border)',
            }}>
              <Stat label={t('detail.source')} value={detail.source} />
              <Stat label={t('detail.category')} value={detail.is_official ? t('market.official') : t('market.community')} />
              {detail.installs > 0 && <Stat label={t('detail.installs')} value={fmtInstalls(detail.installs)} />}
              <Stat label={t('detail.page')} value={<a href={detail.url} target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none' }}>skills.sh →</a>} />
              <button className="btn btn-sm btn-secondary"
                onClick={doTranslate} disabled={translating}
                style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                {translating ? t('market.translating') : translatedBody ? t('market.translated') : t('market.translate')}
              </button>
            </div>

            {/* 简介 */}
            {detail.description && (
              <div>
                <SectionTitle>{t('detail.content')}</SectionTitle>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>
                  {translatedDesc || detail.description}
                </p>
              </div>
            )}

            {/* 正文 — marked 渲染 */}
            {bodyHtml && (
              <div>
                <SectionTitle>{t('detail.metadata')}</SectionTitle>
                <div
                  className="skill-markdown-body"
                  style={{
                    fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)',
                  }}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state"><p>{t('common.error')}</p></div>
        )}
      </div>
    </>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <h4 style={{
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    color: 'var(--text-muted)', letterSpacing: '0.5px',
    marginBottom: 8, paddingBottom: 8,
    borderBottom: '1px solid var(--border)',
  }}>{children}</h4>
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function fmtInstalls(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
