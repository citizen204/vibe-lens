// ─── Tech Stack ──────────────────────────────────────────────────────────────

export type TechCategory =
  | 'language'
  | 'framework'
  | 'ui'
  | 'database'
  | 'tooling'
  | 'deployment'
  | 'testing'
  | 'state'

export interface TechItem {
  name: string
  category: TechCategory
  icon: string        // emoji or SVG key
  color: string       // tailwind color class
  confidence: number  // 0–100, detection certainty
  detectedFrom: string[]  // which files triggered this
}

// ─── Architecture ─────────────────────────────────────────────────────────────

export type ArchPattern =
  | 'monorepo'
  | 'monolith'
  | 'microservices'
  | 'feature-sliced'
  | 'mvc'
  | 'layered'
  | 'component-based'
  | 'serverless'
  | 'unknown'

export interface ArchitectureHighlight {
  id: string
  title: string
  description: string
  pattern: ArchPattern
  relatedPaths: string[]
  badge: string  // short label, e.g. "API Routes"
}

// ─── Features ─────────────────────────────────────────────────────────────────

export interface Feature {
  id: string
  title: string
  description: string
  relatedFiles: string[]
  importance: number  // 1–10
  icon: string
}

// ─── Full Analysis Result ─────────────────────────────────────────────────────

export type ProjectComplexity = 'simple' | 'medium' | 'complex'

export interface AnalysisResult {
  projectName: string
  projectType: string
  complexity: ProjectComplexity
  techStack: TechItem[]
  architectureHighlights: ArchitectureHighlight[]
  features: Feature[]
  rawTree: string
  analyzedAt: Date
}

// ─── Visualization Modes ──────────────────────────────────────────────────────

export type VisualizationMode = 'grid' | 'constellation' | 'timeline'

export interface VisualizationProps {
  result: AnalysisResult
  className?: string
}

// ─── Parser Internals ─────────────────────────────────────────────────────────

export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  ext?: string
  depth: number
  children?: TreeNode[]
}

export interface ParsedTree {
  root: TreeNode
  allFiles: TreeNode[]
  allDirs: TreeNode[]
  filesByExt: Record<string, TreeNode[]>
}
