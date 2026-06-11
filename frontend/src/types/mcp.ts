export interface MCPServer {
  name: string
  type: 'stdio' | 'http'
  command: string
  args: string[]
  url: string
  env: Record<string, string>
  timeout: number
  autoApprove: string[]
}

export interface MCPServerCreate {
  name: string
  type: string
  command: string
  args: string[]
  url: string
  env: Record<string, string>
  timeout: number
  autoApprove: string[]
}

export interface MCPServerUpdate {
  config: Record<string, unknown>
}
