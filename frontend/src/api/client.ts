const BASE = '/api/v1'

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Stats
  getStats: () => request<import('../types/market').AppStats>('/stats'),

  // Skills
  getSkills: (page = 1, pageSize = 10) =>
    request<{ skills: import('../types/skill').SkillSummary[]; total: number }>(`/skills?page=${page}&page_size=${pageSize}`),
  getSkill: (cat: string, name: string) =>
    request<import('../types/skill').SkillDetail>(`/skills/${cat}/${name}`),
  createSkill: (data: import('../types/skill').SkillCreate) =>
    request<{ path: string }>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (cat: string, name: string, data: import('../types/skill').SkillUpdate) =>
    request<{ ok: boolean }>(`/skills/${cat}/${name}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkill: (cat: string, name: string) =>
    request<{ ok: boolean }>(`/skills/${cat}/${name}`, { method: 'DELETE' }),

  // MCP
  getMCPServers: (page = 1, pageSize = 10) =>
    request<{ servers: import('../types/mcp').MCPServer[]; total: number }>(`/mcp?page=${page}&page_size=${pageSize}`),
  createMCP: (data: import('../types/mcp').MCPServerCreate) =>
    request<{ ok: boolean; name: string }>('/mcp', { method: 'POST', body: JSON.stringify(data) }),
  updateMCP: (name: string, data: import('../types/mcp').MCPServerUpdate) =>
    request<{ ok: boolean }>(`/mcp/${name}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMCP: (name: string) =>
    request<{ ok: boolean }>(`/mcp/${name}`, { method: 'DELETE' }),

  // Market
  searchMarketSkills: (q = '', filterType = '', page = 1, pageSize = 30) =>
    request<{ skills: import('../types/market').MarketSkill[]; total: number; page: number; page_size: number }>(`/market/skills?search=${encodeURIComponent(q)}&filter_type=${filterType}&page=${page}&page_size=${pageSize}`),
  getMarketSkillDetail: (owner: string, repo: string, skillId: string) =>
    request<{ name: string; source: string; description: string; body: string; url: string; installs: number; is_official: boolean }>(`/market/skill/${owner}/${repo}/${skillId}`),
  installMarketSkill: (identifier: string) =>
    request<{ ok: boolean }>('/market/skills/install', { method: 'POST', body: JSON.stringify({ identifier }) }),
  getMarketMCP: () =>
    request<{ servers: import('../types/market').MarketMCP[] }>('/market/mcp'),
  installMarketMCP: (name: string) =>
    request<{ ok: boolean }>('/market/mcp/install', { method: 'POST', body: JSON.stringify({ name }) }),
  getPlugins: () =>
    request<{ plugins: import('../types/market').MarketPlugin[] }>('/market/plugins'),
  togglePlugin: (name: string, enable: boolean) =>
    request<{ ok: boolean }>('/market/plugins/toggle', { method: 'POST', body: JSON.stringify({ name, enable }) }),

  // Toolsets
  getToolsets: () => request<{ platform_toolsets: Record<string, string[]>; disabled_toolsets: string[] }>('/toolsets'),
  saveToolsets: (data: { platform_toolsets?: Record<string, string[]>; disabled_toolsets?: string[] }) =>
    request<{ ok: boolean }>('/toolsets', { method: 'PUT', body: JSON.stringify(data) }),

  // SOUL.md
  getSoul: () => request<{ content: string; path: string; size: number }>('/soul'),
  updateSoul: (content: string) => request<{ ok: boolean }>('/soul', { method: 'PUT', body: JSON.stringify({ content }) }),

  // Memory
  getMemory: (type: string) => request<{ entries: Array<{ index: number; content: string }>; path: string }>(`/memory/${type}`),
  updateMemoryEntry: (type: string, index: number, content: string) =>
    request<{ ok: boolean }>(`/memory/${type}/${index}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  addMemoryEntry: (type: string, content: string, position?: number) =>
    request<{ ok: boolean; index: number }>(`/memory/${type}`, { method: 'POST', body: JSON.stringify({ content, position }) }),
  deleteMemoryEntry: (type: string, index: number) =>
    request<{ ok: boolean }>(`/memory/${type}/${index}`, { method: 'DELETE' }),

  // Sessions
  getSessions: (page = 1, pageSize = 20, search = '') =>
    request<{ sessions: Array<{ id: string; title: string | null; model: string | null; started_at: string | null; message_count: number; input_tokens: number; output_tokens: number; estimated_cost_usd: number | null; source: string | null }>; total: number }>(`/sessions?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`),
  getSessionMessages: (id: string, search = '') =>
    request<{ messages: Array<{ id: number; role: string; content: string | null; tool_name: string | null; timestamp: string | null }>; session: Record<string, unknown> | null }>(`/sessions/${id}?search=${encodeURIComponent(search)}`),
  deleteSession: (id: string) => request<{ ok: boolean }>(`/sessions/${id}`, { method: 'DELETE' }),
  batchDeleteSessions: (ids: string[]) => request<{ ok: boolean; deleted: number }>('/sessions/batch-delete', { method: 'POST', body: JSON.stringify(ids) }),
}
