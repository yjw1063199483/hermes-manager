export interface SkillSummary {
  name: string
  dir_name: string
  category: string
  description: string
  version: string
  author: string
  tags: string[]
  path: string
  size: number
  modified: string
  source?: string  // "user" | "market"
}

export interface SkillDetail {
  category: string
  dir_name: string
  frontmatter: SkillMeta
  body: string
  path: string
}

export interface SkillMeta {
  name: string
  description: string
  version: string
  author: string
  tags: string[]
}

export interface SkillCreate {
  category: string
  dir_name: string
  name: string
  description: string
  tags: string[]
  body: string
}

export interface SkillUpdate {
  frontmatter: SkillMeta
  body: string
}
