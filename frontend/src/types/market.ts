export interface MarketSkill {
  name: string
  description: string
  source: string
  trust: string
  identifier: string
  installed: boolean
}

export interface MarketMCP {
  name: string
  status: string
  description: string
  installed: boolean
  is_custom: boolean
}

export interface MarketPlugin {
  name: string
  status: string
  version: string
  description: string
  source: string
  enabled: boolean  // derived from status
}

export interface AppStats {
  skills_count: number
  mcp_count: number
  categories_count: number
  model: string
  hermes_home: string
}
