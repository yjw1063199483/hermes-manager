import { useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { SkillDetailView } from '../skills/SkillDetailView'
import { SkillForm } from '../skills/SkillForm'
import { MCPDetailView } from '../mcp/MCPDetailView'
import { MCPForm } from '../mcp/MCPForm'
import { SoulEditor } from './SoulEditor'
import { SessionDetailView } from '../sessions/SessionDetailView'
import { MarketSkillDetail } from '../market/MarketSkillDetail'
import { MemoryViewer } from './MemoryViewer'

export function Drawer() {
  const open = useAppStore((s) => s.drawerOpen)
  const type = useAppStore((s) => s.drawerType)
  const mode = useAppStore((s) => s.drawerMode)
  const close = useAppStore((s) => s.closeDrawer)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={close} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        {type === 'skill' && mode === 'view' && <SkillDetailView />}
        {type === 'skill' && (mode === 'edit' || mode === 'create') && <SkillForm />}
        {type === 'mcp' && mode === 'view' && <MCPDetailView />}
        {type === 'mcp' && (mode === 'edit' || mode === 'create') && <MCPForm />}
        {type === 'soul' && <SoulEditor />}
        {type === 'session' && <SessionDetailView />}
        {type === 'market-skill' && <MarketSkillDetail />}
        {type === 'memory' && <MemoryViewer />}
      </aside>
    </>
  )
}
