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
  'panel.skills.subtitle': '管理可复用的 Agent 技能',
  'panel.mcp.subtitle': '配置 Model Context Protocol 服务器',
  'panel.memory.subtitle': '管理 Agent 和 User 持久记忆',
  'panel.toolsets.subtitle': '按平台启用或禁用工具组',
  'panel.market.subtitle': '发现和安装技能、MCP 服务器、插件',

  // Common
  'common.search': '搜索...',
  'common.loading': '加载中...',
  'common.empty': '暂无数据',
  'common.noMatch': '暂无匹配',
  'common.noDesc': '无描述',
  'common.save': '保存',
  'common.saving': '保存中...',
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
  'common.remove': '移除',
  'common.add': '添加',
  'common.addNew': '+ 新增',
  'common.name': '名称',
  'common.type': '类型',
  'common.command': '命令',
  'common.args': '参数（空格分隔）',
  'common.env': '环境变量（KEY=VALUE，每行一个）',
  'common.timeout': '超时 (秒)',
  'common.autoApprove': '自动批准工具（每行一个）',
  'common.none': '无',
  'common.key': '按 Esc 关闭',

  // Detail
  'detail.confirmDelete': '确定永久删除 "{name}"？',
  'detail.confirmDeleteMcp': '确定移除 MCP "{name}"？',
  'detail.confirmDeleteMemory': '确定删除此条？',
  'detail.basicInfo': '基本信息',
  'detail.metadata': '元数据',
  'detail.category': '分类',
  'detail.version': '版本',
  'detail.author': '作者',
  'detail.size': '大小',
  'detail.tags': '标签',
  'detail.content': '内容',
  'detail.noContent': '无内容',
  'detail.source': '来源',
  'detail.installs': '安装量',
  'detail.page': '页面',
  'detail.records': '{n} 条记录',
  'detail.search': '搜索消息内容...',
  'detail.noMsg': '无消息',
  'detail.noMatchMsg': '无匹配消息',
  'detail.messages': '{n} 条消息',

  // History
  'history.total': '个会话',
  'history.tokens': 'tokens',
  'history.prevPage': '上一页',
  'history.nextPage': '下一页',
  'history.selectAll': '全选',
  'history.deselectAll': '取消全选',
  'history.confirmDelete': '确定删除 {n} 个会话？不可撤销。',
  'history.selected': '已选',
  'history.batchDelete': '确认删除',
  'history.copyHint': '会话ID已复制，可用 hermes -r {id}... 打开',

  // Skills
  'skills.create': '+ 新建技能',
  'skills.search': '搜索技能...',
  'skills.noContent': '暂无内容',
  'skills.preview': '预览',
  'skills.edit': '编辑',
  'skills.editSkill': '编辑技能',
  'skills.createSkill': '新建技能',
  'skills.content': '内容 (Markdown)',
  'skills.description': '描述',
  'skills.tags': '标签（逗号分隔）',
  'skills.category': '分类',
  'skills.dirname': '目录名',
  'skills.name': '名称 *',
  'skills.createBtn': '创建',

  // MCP
  'mcp.add': '+ 添加 MCP',
  'mcp.export': '导出',
  'mcp.editMCP': '编辑 MCP',
  'mcp.addMCP': '添加 MCP 服务器',
  'mcp.name': '名称 *',
  'mcp.command': '命令 *',
  'mcp.autoTools': '{n} 个自动批准工具',
  'mcp.timeoutFmt': '超时: {n}s',
  'mcp.prev': '上一页',
  'mcp.next': '下一页',
  'mcp.perPage': '条',

  // Memory
  'memory.agent': 'Agent',
  'memory.user': 'User',
  'memory.add': '添加',
  'memory.placeholder': '输入新条目...',
  'memory.sofia': 'SOUL.md',

  // Soul
  'soul.title': '人设 · SOUL.md',
  'soul.edit': '编辑',
  'soul.preview': '预览',
  'soul.unsaved': '⚠ 有未保存的更改',
  'soul.loadHint': 'SOUL.md 在每次对话开始时加载',

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
  'market.translating': '翻译中...',
  'market.translated': '✓ 已翻译',
  'market.translate': '🌐 翻译中文',
  'market.official': '🏛 官方',
  'market.community': '🌐 社区',

  // Import/Export
  'import.success': '导入完成',
  'import.fail': '导入失败',
  'import.selectZip': '请选择 .zip 文件',

  // SOUL
  'soul.editSoul': '编辑 SOUL.md',
  'soul.previewSoul': '预览 SOUL.md',

  // Toolsets
  'toolsets.save': '保存配置',
  'toolsets.disabledGlobal': '全局禁用',
}

const en: Translations = {
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

  'panel.skills': 'Skills',
  'panel.mcp': 'MCP',
  'panel.memory': 'Memory',
  'panel.history': 'History',
  'panel.toolsets': 'Toolsets',
  'panel.market': 'Market',
  'panel.skills.subtitle': 'Manage reusable Agent skills',
  'panel.mcp.subtitle': 'Configure Model Context Protocol servers',
  'panel.memory.subtitle': 'Manage Agent and User persistent memory',
  'panel.toolsets.subtitle': 'Enable or disable toolsets per platform',
  'panel.market.subtitle': 'Discover and install skills, MCP servers, plugins',

  'common.search': 'Search...',
  'common.loading': 'Loading...',
  'common.empty': 'No data',
  'common.noMatch': 'No match',
  'common.noDesc': 'No description',
  'common.save': 'Save',
  'common.saving': 'Saving...',
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
  'common.remove': 'Remove',
  'common.add': 'Add',
  'common.addNew': '+ Add New',
  'common.name': 'Name',
  'common.type': 'Type',
  'common.command': 'Command',
  'common.args': 'Args (space-separated)',
  'common.env': 'Environment (KEY=VALUE, one per line)',
  'common.timeout': 'Timeout (seconds)',
  'common.autoApprove': 'Auto-approve tools (one per line)',
  'common.none': 'None',
  'common.key': 'Press Esc to close',

  'detail.confirmDelete': 'Permanently delete "{name}"?',
  'detail.confirmDeleteMcp': 'Remove MCP "{name}"?',
  'detail.confirmDeleteMemory': 'Delete this entry?',
  'detail.basicInfo': 'Basic Info',
  'detail.metadata': 'Metadata',
  'detail.category': 'Category',
  'detail.version': 'Version',
  'detail.author': 'Author',
  'detail.size': 'Size',
  'detail.tags': 'Tags',
  'detail.content': 'Content',
  'detail.noContent': 'No content',
  'detail.source': 'Source',
  'detail.installs': 'Installs',
  'detail.page': 'Page',
  'detail.records': '{n} records',
  'detail.search': 'Search messages...',
  'detail.noMsg': 'No messages',
  'detail.noMatchMsg': 'No matching messages',
  'detail.messages': '{n} messages',

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

  'skills.create': '+ New Skill',
  'skills.search': 'Search skills...',
  'skills.noContent': 'No content',
  'skills.preview': 'Preview',
  'skills.edit': 'Edit',
  'skills.editSkill': 'Edit Skill',
  'skills.createSkill': 'New Skill',
  'skills.content': 'Content (Markdown)',
  'skills.description': 'Description',
  'skills.tags': 'Tags (comma-separated)',
  'skills.category': 'Category',
  'skills.dirname': 'Directory',
  'skills.name': 'Name *',
  'skills.createBtn': 'Create',

  'mcp.add': '+ Add MCP',
  'mcp.export': 'Export',
  'mcp.editMCP': 'Edit MCP',
  'mcp.addMCP': 'Add MCP Server',
  'mcp.name': 'Name *',
  'mcp.command': 'Command *',
  'mcp.autoTools': '{n} auto-approved tools',
  'mcp.timeoutFmt': 'Timeout: {n}s',
  'mcp.prev': 'Previous',
  'mcp.next': 'Next',
  'mcp.perPage': 'items',

  'memory.agent': 'Agent',
  'memory.user': 'User',
  'memory.add': 'Add',
  'memory.placeholder': 'Enter new entry...',
  'memory.sofia': 'SOUL.md',

  'soul.title': 'SOUL.md',
  'soul.edit': 'Edit',
  'soul.preview': 'Preview',
  'soul.unsaved': '⚠ Unsaved changes',
  'soul.loadHint': 'SOUL.md is loaded at the start of each conversation',

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
  'market.translating': 'Translating...',
  'market.translated': '✓ Translated',
  'market.translate': '🌐 Translate to EN',
  'market.official': '🏛 Official',
  'market.community': '🌐 Community',

  'import.success': 'Import successful',
  'import.fail': 'Import failed',
  'import.selectZip': 'Please select a .zip file',

  'soul.editSoul': 'Edit SOUL.md',
  'soul.previewSoul': 'Preview SOUL.md',

  'toolsets.save': 'Save Config',
  'toolsets.disabledGlobal': 'Global Disabled',
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
