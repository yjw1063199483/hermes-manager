import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { useAppStore } from '../../stores/appStore'

type Entry = { index: number; content: string }

export function MemoryViewer() {
  const [memoryType, setMemoryType] = useState<'memory' | 'user'>('memory')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const addToast = useAppStore((s) => s.addToast)

  const load = (type: string) => {
    setLoading(true)
    api.getMemory(type)
      .then((d) => setEntries(d.entries))
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(memoryType) }, [memoryType])

  const startEdit = (e: Entry) => {
    setEditingIdx(e.index)
    setEditText(e.content)
  }

  const saveEdit = async () => {
    if (editingIdx === null) return
    try {
      await api.updateMemoryEntry(memoryType, editingIdx, editText)
      entries[editingIdx] = { index: editingIdx, content: editText }
      setEntries([...entries])
      setEditingIdx(null)
      addToast('已保存', 'success')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  const handleAdd = async () => {
    if (!newText.trim()) return
    try {
      const r = await api.addMemoryEntry(memoryType, newText.trim())
      entries.splice(r.index, 0, { index: r.index, content: newText.trim() })
      setEntries(entries.map((e, i) => ({ ...e, index: i })))
      setNewText('')
      setAdding(false)
      addToast('已新增', 'success')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  const handleDelete = async (idx: number) => {
    if (!confirm('确定删除此条？')) return
    try {
      await api.deleteMemoryEntry(memoryType, idx)
      entries.splice(idx, 1)
      setEntries(entries.map((e, i) => ({ ...e, index: i })))
      addToast('已删除', 'success')
    } catch (e: unknown) {
      addToast((e as Error).message, 'error')
    }
  }

  return (
    <>
      <div className="drawer-header">
        <h2>Memory</h2>
        <div className="drawer-header-actions">
          <button className={`btn btn-sm ${memoryType === 'memory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMemoryType('memory')}>Agent</button>
          <button className={`btn btn-sm ${memoryType === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMemoryType('user')}>User</button>
        </div>
        <button className="btn-icon" onClick={closeDrawer}>✕</button>
      </div>
      <div className="drawer-body">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
        ) : (
          <>
            {/* 新增 */}
            {adding ? (
              <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <textarea
                  className="form-textarea"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="输入新条目..."
                  style={{ minHeight: 80, marginBottom: 8 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setAdding(false); setNewText('') }}>取消</button>
                  <button className="btn btn-primary btn-sm" onClick={handleAdd}>添加</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}
                style={{ marginBottom: 16 }}>+ 新增条目</button>
            )}

            {/* 条目列表 */}
            {entries.map((e) => (
              <div key={e.index} style={{
                marginBottom: 12, padding: 14, background: 'var(--bg-card)',
                borderRadius: 8, border: editingIdx === e.index ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'var(--transition)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>#{e.index + 1}</span>
                  {editingIdx !== e.index && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(e)}>编辑</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.index)}>删除</button>
                    </div>
                  )}
                </div>
                {editingIdx === e.index ? (
                  <>
                    <textarea className="form-textarea" value={editText}
                      onChange={(ev) => setEditText(ev.target.value)}
                      style={{ minHeight: 80, marginBottom: 8, fontSize: 13, lineHeight: 1.6 }}
                      autoFocus />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingIdx(null)}>取消</button>
                      <button className="btn btn-primary btn-sm" onClick={saveEdit}>保存</button>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {e.content}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <div className="drawer-footer">
        <span className="drawer-footer-hint">{entries.length} 条记录 · 按 <kbd>Esc</kbd> 关闭</span>
      </div>
    </>
  )
}
