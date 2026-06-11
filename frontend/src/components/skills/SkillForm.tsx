import { useState, useEffect } from 'react'
import { useT } from '../../i18n'
import { useAppStore } from '../../stores/appStore'
import { api } from '../../api/client'
import type { SkillSummary } from '../../types/skill'

export function SkillForm() {
  const data = useAppStore((s) => s.drawerData) as SkillSummary | null
  const mode = useAppStore((s) => s.drawerMode)
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)
  const { t } = useT()
  const isEdit = mode === 'edit'

  const [name, setName] = useState(data?.name ?? '')
  const [category, setCategory] = useState(data?.category ?? 'custom')
  const [dirName, setDirName] = useState(data?.dir_name ?? '')
  const [description, setDesc] = useState(data?.description ?? '')
  const [tags, setTags] = useState(data?.tags?.join(', ') ?? '')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && data) {
      api.getSkill(data.category, data.dir_name).then((d) => setBody(d.body)).catch(() => {})
    }
  }, [isEdit, data])

  const handleSave = async () => {
    if (!name.trim()) return addToast('名称为必填项', 'error')
    setSaving(true)
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      if (isEdit && data) {
        await api.updateSkill(data.category, data.dir_name, {
          frontmatter: { name, description, version: data.version, author: data.author, tags: tagList },
          body,
        })
        addToast('Skill 已更新 — 请执行 /reload-skills 生效', 'success')
      } else {
        if (!dirName.trim()) return addToast('目录名称为必填项', 'error')
        await api.createSkill({ category, dir_name: dirName, name, description, tags: tagList, body })
        addToast('Skill 已创建 — 请执行 /reload-skills 生效', 'success')
      }
      closeDrawer()
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>{isEdit ? t('skills.editSkill') : t('skills.createSkill')}</h2>
        <button className="btn-icon" onClick={closeDrawer}>✕</button>
      </div>
      <div className="drawer-body">
        <div className="form-group">
          <label className="form-label">{t('skills.category')}</label>
          <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}
            readOnly={isEdit} />
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">{t('skills.dirname')}</label>
            <input className="form-input" value={dirName} onChange={(e) => setDirName(e.target.value)}
              placeholder="my-skill" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">{t('skills.name')}</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('skills.description')}</label>
          <input className="form-input" value={description} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('skills.tags')}</label>
          <input className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('skills.content')}</label>
          <textarea className="form-textarea" value={body} onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: 300 }} />
        </div>
      </div>
      <div className="drawer-footer">
        <span></span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={closeDrawer}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : isEdit ? t('common.save') : t('skills.createBtn')}
          </button>
        </div>
      </div>
    </>
  )
}
