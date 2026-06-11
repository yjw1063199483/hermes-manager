import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Lang = 'zh' | 'en'

type Translations = Record<string, string>

const zh: Translations = {
  // Sidebar
  'sidebar.skills': 'Skills',
  'sidebar.mcp': 'MCP',
  'sidebar.memory': 'Memory',
  'sidebar.history': 'History',
  'sidebar.toolsets': 'Toolsets',
  'sidebar.soul': '人设',
  'sidebar.market': '市场',
  'sidebar.export': '导出配置',
  'sidebar.import': '导入配置',
  'sidebar.model': 'Model',

  // Panels
  'panel.skills': 'Skills',
  'panel.mcp': 'MCP',
  'panel.memory': 'Memory',
  'panel.history': 'History',
  'panel.toolsets': 'Toolsets',
  'panel.market': '市场',

  // Common
  'common.search': '搜索...',
  'common.loading': '加载中...',
  'common.empty': '暂无数据',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.create': '新建',
  'common.edit': '编辑',
  'common.view': '查看',
  'common.confirm': '确认',
  'common.close': '关闭',
  'common.copy': '复制',
  'common.copied': '已复制',
  'common.copyFail': '复制失败',
  'common.export': '导出',
  'common.import': '导入',
  'common.list': '列表',
  'common.card': '卡片',
  'common.total': '共',
  'common.enabled': '已启用',
  'common.disabled': '已禁用',
  'common.success': '操作成功',
  'common.error': '操作失败',

  // History
  'history.total': '个会话',
  'history.tokens': 'tokens',
  'history.copyHint': '会话ID已复制，可用 hermes -r {id}... 打开',
  'history.prevPage': '上一页',
  'history.nextPage': '下一页',
  'history.selectAll': '全选',
  'history.deselectAll': '取消全选',
  'history.confirmDelete': '确定删除 {n} 个会话？不可撤销。',
  'history.selected': '已选',
  'history.batchDelete': '确认删除',

  // Skills
  'skills.create': '+ 新建技能',
  'skills.search': '搜索技能...',
  'skills.noContent': '暂无内容',
  'skills.preview': '预览',
  'skills.edit': '编辑',

  // MCP
  'mcp.add': '+ 添加 MCP',
  'mcp.export': '导出',

  // Memory
  'memory.agent': 'Agent',
  'memory.user': 'User',
  'memory.add': '添加',

  // Market
  'market.skillsHub': 'Skills Hub',
  'market.mcpCatalog': 'MCP Catalog',
  'market.plugins': 'Plugins',
  'market.install': '安装',
  'market.installing': '执行中',
  'market.skillsTitle': 'Agent 技能市场',
  'market.skillsDesc': 'skills.sh 是 AI Agent 技能的全球统一目录，聚合 9,600+ 技能。Hermes、Claude Code、Cursor 等所有主流 Agent 都通过它发现和安装技能。',
  'market.openSkillsSh': '打开 skills.sh ↗',
  'market.skillsHint': '在 skills.sh 复制安装命令，粘贴到下方终端执行',
  'market.mcpTitle': 'MCP 服务器市场',
  'market.mcpDesc': 'MCP 是 AI Agent 连接外部工具的标准协议。mcp.so 和 smithery.ai 是目前最主流的 MCP 服务器目录。',
  'market.mcpHint': '点进具体 MCP 服务器页面，复制 npx -y @xxx/server-xxx 命令粘贴执行',
  'market.pluginsTitle': '插件',
  'market.pluginsDesc': 'Hermes 内置插件，暂无外部市场。',
  'market.terminalTitle': '终端命令执行 · Hermes Agent',
  'market.terminalPlaceholder': 'npx skills add owner/repo  或直接粘贴安装命令',
  'market.terminalSuccess': '安装成功 — Skills 已刷新',
  'market.terminalFail': '安装失败',
  'market.mcpTerminalTitle': '快速安装 · 粘贴任意 MCP 安装命令',
  'market.mcpTerminalPlaceholder': 'npx -y @modelcontextprotocol/server-filesystem',

  // Import/Export
  'import.success': '导入完成',
  'import.fail': '导入失败',
  'import.selectZip': '请选择 .zip 文件',

  // SOUL
  'soul.edit': '编辑 SOUL.md',
  'soul.preview': '预览 SOUL.md',

  // Toolsets
  'toolsets.save': '保存配置',
}

const en: Translations = {
  // Sidebar
  'sidebar.skills': 'Skills',
  'sidebar.mcp': 'MCP',
  'sidebar.memory': 'Memory',
  'sidebar.history': 'History',
  'sidebar.toolsets': 'Toolsets',
  'sidebar.soul': 'SOUL',
  'sidebar.market': 'Market',
  'sidebar.export': 'Export Config',
  'sidebar.import': 'Import Config',
  'sidebar.model': 'Model',

  // Panels
  'panel.skills': 'Skills',
  'panel.mcp': 'MCP',
  'panel.memory': 'Memory',
  'panel.history': 'History',
  'panel.toolsets': 'Toolsets',
  'panel.market': 'Market',

  // Common
  'common.search': 'Search...',
  'common.loading': 'Loading...',
  'common.empty': 'No data',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.create': 'Create',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.copyFail': 'Copy failed',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.list': 'List',
  'common.card': 'Card',
  'common.total': 'Total',
  'common.enabled': 'Enabled',
  'common.disabled': 'Disabled',
  'common.success': 'Success',
  'common.error': 'Error',

  // History
  'history.total': 'sessions',
  'history.tokens': 'tokens',
  'history.prevPage': 'Previous',
  'history.nextPage': 'Next',
  'history.selectAll': 'Select All',
  'history.deselectAll': 'Deselect',
  'history.confirmDelete': 'Delete {n} sessions? This cannot be undone.',
  'history.selected': 'Selected',
  'history.batchDelete': 'Delete Selected',
  'history.copyHint': 'Session ID copied. Resume with: hermes -r {id}...',

  // Skills
  'skills.create': '+ New Skill',
  'skills.search': 'Search skills...',
  'skills.noContent': 'No content',
  'skills.preview': 'Preview',
  'skills.edit': 'Edit',

  // MCP
  'mcp.add': '+ Add MCP',
  'mcp.export': 'Export',

  // Memory
  'memory.agent': 'Agent',
  'memory.user': 'User',
  'memory.add': 'Add',

  // Market
  'market.skillsHub': 'Skills Hub',
  'market.mcpCatalog': 'MCP Catalog',
  'market.plugins': 'Plugins',
  'market.install': 'Install',
  'market.installing': 'Running',
  'market.skillsTitle': 'Agent Skills Market',
  'market.skillsDesc': 'skills.sh is the global directory for AI Agent skills, aggregating 9,600+ skills. Hermes, Claude Code, Cursor, and all major Agents discover and install skills through it.',
  'market.openSkillsSh': 'Open skills.sh ↗',
  'market.skillsHint': 'Copy the install command from skills.sh and paste below',
  'market.mcpTitle': 'MCP Server Market',
  'market.mcpDesc': 'MCP is the standard protocol for AI Agents to connect external tools. mcp.so and smithery.ai are the most popular MCP server directories.',
  'market.mcpHint': 'Click into an MCP server page, copy the npx -y @xxx/server-xxx command and paste below',
  'market.pluginsTitle': 'Plugins',
  'market.pluginsDesc': 'Hermes built-in plugins. No external marketplace available.',
  'market.terminalTitle': 'Terminal · Hermes Agent',
  'market.terminalPlaceholder': 'npx skills add owner/repo  or paste install command',
  'market.terminalSuccess': 'Install succeeded — Skills refreshed',
  'market.terminalFail': 'Install failed',
  'market.mcpTerminalTitle': 'Quick Install · Paste any MCP install command',
  'market.mcpTerminalPlaceholder': 'npx -y @modelcontextprotocol/server-filesystem',

  // Import/Export
  'import.success': 'Import successful',
  'import.fail': 'Import failed',
  'import.selectZip': 'Please select a .zip file',

  // SOUL
  'soul.edit': 'Edit SOUL.md',
  'soul.preview': 'Preview SOUL.md',

  // Toolsets
  'toolsets.save': 'Save Config',
}

const all: Record<Lang, Translations> = { zh, en }

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('hermes-lang') as Lang) || 'zh'
  })

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('hermes-lang', l)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text = all[lang][key] ?? all['zh'][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v))
        }
      }
      return text
    },
    [lang],
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
