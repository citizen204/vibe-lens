import type {
  AnalysisResult,
  ArchitectureHighlight,
  Feature,
  ParsedTree,
  TreeNode,
  ProjectComplexity,
} from '@/types'
import { detectTechStack } from './tech-detector'

// ─── GitHub API Types ─────────────────────────────────────────────────────────

interface GitHubTreeItem {
  path: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

interface GitHubTreeResponse {
  sha: string
  url: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

// ─── Tree Parser ──────────────────────────────────────────────────────────────
// Supports formats from: `tree`, `find`, GitHub file browser copy-paste, etc.
// e.g.:
//   my-project/
//   ├── src/
//   │   ├── app/
//   │   │   └── page.tsx
//   └── package.json

const TREE_CHARS = /^[│├└─\s]*/

// Files that have no extension but must be treated as files (not dirs)
const NO_EXT_FILES = new Set([
  'Dockerfile', 'Makefile', 'Gemfile', 'Rakefile', 'Procfile',
  'artisan', 'Brewfile', 'Pipfile', 'Taskfile', 'Justfile',
  'CHANGELOG', 'LICENSE', 'README', 'AUTHORS', 'CONTRIBUTING',
  'Cargo.lock', 'bun.lockb', 'yarn.lock',
])

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Detect the indentation unit (chars per depth level) from raw tree lines.
 * Standard `tree` output uses 4-char units; space-indented trees may use 2.
 */
function detectIndentUnit(lines: string[]): number {
  const lengths: number[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const prefix = line.match(TREE_CHARS)?.[0] ?? ''
    const len = prefix.replace(/[├└│─]/g, ' ').length
    if (len > 0) lengths.push(len)
  }
  if (lengths.length === 0) return 4
  const unit = lengths.reduce(gcd)
  return unit > 0 ? unit : 4
}

/**
 * Strip tree-drawing characters and leading whitespace from a line,
 * returning the actual file/dir name and its depth level.
 */
function parseLine(line: string, indentUnit: number): { name: string; depth: number; endsWithSlash: boolean } | null {
  if (!line.trim()) return null

  const endsWithSlash = line.trimEnd().endsWith('/')
  // Remove tree chars to get clean name
  const cleaned = line.replace(TREE_CHARS, '').replace(/\/$/, '').trim()
  if (!cleaned || cleaned.startsWith('#')) return null

  const prefix = line.match(TREE_CHARS)?.[0] ?? ''
  const depth = Math.floor(prefix.replace(/[├└─]/g, ' ').length / indentUnit)

  return { name: cleaned, depth, endsWithSlash }
}

export function parseTree(raw: string): ParsedTree {
  const lines = raw.split('\n').filter(l => l.trim())
  const allFiles: TreeNode[] = []
  const allDirs: TreeNode[] = []
  const filesByExt: Record<string, TreeNode[]> = {}

  // Dynamically detect the indent unit so non-standard indentation (e.g. 2-space)
  // is handled correctly instead of hardcoding 4.
  const indentUnit = detectIndentUnit(lines.slice(1))

  // Stack tracks current path at each depth level
  const pathStack: string[] = []

  // Detect root project name from first line
  let rootName = 'project'
  const firstLine = lines[0]?.trim().replace(/\/$/, '') ?? 'project'
  if (firstLine && !firstLine.match(/[│├└─]/)) {
    rootName = firstLine
  }

  const root: TreeNode = { name: rootName, path: rootName, type: 'dir', depth: 0 }
  allDirs.push(root)

  for (let i = 1; i < lines.length; i++) {
    const parsed = parseLine(lines[i], indentUnit)
    if (!parsed) continue

    const { name, depth, endsWithSlash } = parsed

    // Determine node type robustly:
    //  1. Trailing slash  → directory (most reliable signal from `tree` output)
    //  2. Has a dot       → file (has extension, or is a dotfile like .gitignore)
    //  3. Known no-ext file (Dockerfile, Makefile, …) → file
    //  4. Fallback        → directory (bare names like `src`, `components`)
    const type: 'file' | 'dir' = endsWithSlash
      ? 'dir'
      : name.includes('.')
        ? 'file'
        : NO_EXT_FILES.has(name) ? 'file' : 'dir'

    // Trim the stack to current depth
    pathStack.length = depth
    pathStack[depth - 1] = name
    const fullPath = [rootName, ...pathStack.filter(Boolean)].join('/')

    // For dotfiles like .gitignore: ext = '.gitignore'; for .env: ext = '.env'
    const ext = name.includes('.')
      ? '.' + name.split('.').pop()!.toLowerCase()
      : undefined

    const node: TreeNode = { name, path: fullPath, type, ext, depth }

    if (type === 'dir') {
      allDirs.push(node)
    } else {
      allFiles.push(node)
      if (ext) {
        filesByExt[ext] = filesByExt[ext] ?? []
        filesByExt[ext].push(node)
      }
    }
  }

  return { root, allFiles, allDirs, filesByExt }
}

// ─── Architecture Analyzer ────────────────────────────────────────────────────

function analyzeArchitecture(tree: ParsedTree): ArchitectureHighlight[] {
  const highlights: ArchitectureHighlight[] = []
  const { allDirs, allFiles } = tree
  const dirNames = allDirs.map(d => d.name)
  const filePaths = allFiles.map(f => f.path)

  // ── App Router / Pages Router ──────────────────────────────────────────────
  const hasAppDir = dirNames.some(d => d === 'app')
  const hasPagesDir = dirNames.some(d => d === 'pages')
  if (hasAppDir) {
    highlights.push({
      id: 'app-router',
      title: 'App Router 架构',
      description: '使用 Next.js App Router，支持 Server Components、嵌套布局与流式渲染',
      pattern: 'component-based',
      badge: 'App Router',
      relatedPaths: allDirs.filter(d => d.name === 'app').map(d => d.path).slice(0, 2),
    })
  } else if (hasPagesDir) {
    highlights.push({
      id: 'pages-router',
      title: 'Pages Router 架构',
      description: '采用传统 Next.js Pages Router，文件即路由，适合 SSR/SSG 场景',
      pattern: 'mvc',
      badge: 'Pages Router',
      relatedPaths: allDirs.filter(d => d.name === 'pages').map(d => d.path).slice(0, 2),
    })
  }

  // ── Monorepo ───────────────────────────────────────────────────────────────
  const hasPackagesDir = dirNames.some(d => d === 'packages')
  const hasAppsDir = dirNames.some(d => d === 'apps')
  const hasTurboJson = filePaths.some(f => f.endsWith('turbo.json'))
  const hasLernaJson = filePaths.some(f => f.endsWith('lerna.json'))
  if (hasPackagesDir && (hasAppsDir || hasTurboJson || hasLernaJson)) {
    highlights.push({
      id: 'monorepo',
      title: 'Monorepo 架构',
      description: '多包仓库结构，统一管理代码共享、依赖与构建流水线',
      pattern: 'monorepo',
      badge: 'Monorepo',
      relatedPaths: [
        ...allDirs.filter(d => d.name === 'packages' || d.name === 'apps').map(d => d.path).slice(0, 2),
      ],
    })
  }

  // ── Feature-Sliced Design / Domain-Driven ─────────────────────────────────
  const fsdDirs = ['features', 'entities', 'widgets', 'shared', 'processes']
  const matchedFsd = dirNames.filter(d => fsdDirs.includes(d))
  if (matchedFsd.length >= 3) {
    highlights.push({
      id: 'fsd',
      title: 'Feature-Sliced Design',
      description: '采用 FSD 架构分层：features / entities / widgets / shared，职责清晰',
      pattern: 'feature-sliced',
      badge: 'FSD',
      relatedPaths: allDirs.filter(d => fsdDirs.includes(d.name)).map(d => d.path).slice(0, 4),
    })
  }

  // ── Component Library ──────────────────────────────────────────────────────
  const hasComponentsDir = dirNames.some(d => d === 'components' || d === 'ui')
  const componentCount = allDirs.filter(d => d.name === 'components').length
  if (hasComponentsDir) {
    highlights.push({
      id: 'component-library',
      title: '组件化设计',
      description: '拥有独立的 UI 组件层，组件可复用，便于设计系统落地',
      pattern: 'component-based',
      badge: 'Components',
      relatedPaths: allDirs.filter(d => d.name === 'components' || d.name === 'ui').map(d => d.path).slice(0, 3),
    })
  }

  // ── API Layer ──────────────────────────────────────────────────────────────
  const hasApiDir = dirNames.some(d => d === 'api' || d === 'routes' || d === 'controllers')
  if (hasApiDir) {
    highlights.push({
      id: 'api-layer',
      title: 'API 服务层',
      description: '内置 API 路由 / 控制器层，前后端一体化或 RESTful 服务设计',
      pattern: 'layered',
      badge: 'API Layer',
      relatedPaths: allDirs
        .filter(d => ['api', 'routes', 'controllers'].includes(d.name))
        .map(d => d.path)
        .slice(0, 3),
    })
  }

  // ── Database / ORM ─────────────────────────────────────────────────────────
  const hasPrismaDir = dirNames.some(d => d === 'prisma')
  const hasMigrationsDir = dirNames.some(d => d === 'migrations' || d === 'migrate')
  if (hasPrismaDir || hasMigrationsDir) {
    highlights.push({
      id: 'db-layer',
      title: '数据库 Schema 管理',
      description: '使用 ORM + Migration 管理数据库结构，类型安全的数据访问层',
      pattern: 'layered',
      badge: 'DB + ORM',
      relatedPaths: allDirs
        .filter(d => ['prisma', 'migrations', 'migrate', 'db'].includes(d.name))
        .map(d => d.path)
        .slice(0, 3),
    })
  }

  // ── CI/CD Pipeline ─────────────────────────────────────────────────────────
  const hasGithubWorkflows = dirNames.some(d => d === '.github') ||
    filePaths.some(f => f.includes('.github/workflows'))
  const hasDockerFile = filePaths.some(f => f.endsWith('Dockerfile') || f.endsWith('docker-compose.yml'))
  if (hasGithubWorkflows || hasDockerFile) {
    highlights.push({
      id: 'cicd',
      title: 'CI/CD 自动化',
      description: 'GitHub Actions 工作流 + 容器化部署，代码推送自动触发构建与测试',
      pattern: 'serverless',
      badge: 'CI/CD',
      relatedPaths: [
        ...allDirs.filter(d => d.name === '.github').map(d => d.path),
        ...allFiles.filter(f => f.name === 'Dockerfile' || f.name === 'docker-compose.yml').map(f => f.path),
      ].slice(0, 3),
    })
  }

  // ── Testing Setup ──────────────────────────────────────────────────────────
  const hasTestDir = dirNames.some(d => ['tests', 'test', '__tests__', 'e2e', 'spec'].includes(d))
  const hasTestFiles = allFiles.some(f => f.name.includes('.test.') || f.name.includes('.spec.'))
  if (hasTestDir || hasTestFiles) {
    highlights.push({
      id: 'testing',
      title: '完善的测试体系',
      description: '包含单元测试 / 集成测试 / E2E 测试，代码质量有保障',
      pattern: 'layered',
      badge: 'Testing',
      relatedPaths: allDirs
        .filter(d => ['tests', 'test', '__tests__', 'e2e', 'spec'].includes(d.name))
        .map(d => d.path)
        .slice(0, 3),
    })
  }

  return highlights.slice(0, 6) // top 6
}

// ─── Feature Extractor ────────────────────────────────────────────────────────

interface FeatureRule {
  id: string
  title: string
  description: string
  icon: string
  importance: number
  signals: {
    files?: RegExp[]
    dirs?: string[]
    exts?: string[]
  }
}

const FEATURE_RULES: FeatureRule[] = [
  {
    id: 'auth',
    title: '身份认证系统',
    description: '完整的用户登录 / 注册 / 权限管理，保障应用安全',
    icon: '🔐',
    importance: 9,
    signals: {
      files: [/auth/, /login/, /signin/, /session/, /jwt/, /oauth/],
      dirs: ['auth', 'authentication', 'session'],
    },
  },
  {
    id: 'api',
    title: 'RESTful / RPC API',
    description: '对外暴露标准化 API 接口，支持多端接入与第三方集成',
    icon: '🔌',
    importance: 8,
    signals: {
      dirs: ['api', 'routes', 'controllers', 'handlers'],
      files: [/route\.(ts|js)$/, /controller\.(ts|js)$/],
    },
  },
  {
    id: 'dashboard',
    title: '数据仪表盘',
    description: '可视化展示关键指标与数据，支持实时监控与决策',
    icon: '📊',
    importance: 8,
    signals: {
      dirs: ['dashboard', 'analytics', 'charts'],
      files: [/dashboard/, /chart/, /analytics/, /metric/],
    },
  },
  {
    id: 'i18n',
    title: '国际化 (i18n)',
    description: '多语言支持，轻松适配全球市场',
    icon: '🌍',
    importance: 7,
    signals: {
      dirs: ['locales', 'i18n', 'translations', 'lang'],
      files: [/i18n/, /locale/, /(i18n|locale|lang|translation).*\.json$/, /translation/],
      exts: ['.po', '.pot'],
    },
  },
  {
    id: 'realtime',
    title: '实时通信',
    description: '基于 WebSocket / SSE 的实时数据推送，打造流畅的协作体验',
    icon: '⚡',
    importance: 9,
    signals: {
      files: [/socket/, /websocket/, /ws\./, /realtime/, /sse/, /stream/],
      dirs: ['socket', 'ws', 'realtime'],
    },
  },
  {
    id: 'payments',
    title: '支付系统',
    description: '集成主流支付网关，处理订单与交易结算',
    icon: '💳',
    importance: 9,
    signals: {
      files: [/stripe/, /payment/, /checkout/, /billing/, /invoice/],
      dirs: ['payments', 'billing', 'checkout'],
    },
  },
  {
    id: 'file-upload',
    title: '文件上传与存储',
    description: '支持图片 / 文件上传，对接云存储服务（S3 / R2 等）',
    icon: '📁',
    importance: 7,
    signals: {
      files: [/upload/, /storage/, /s3/, /cloudinary/, /r2\./],
      dirs: ['upload', 'storage', 'media'],
    },
  },
  {
    id: 'email',
    title: '邮件服务',
    description: '事务邮件发送、模板管理，用于注册验证 / 通知 / 营销',
    icon: '📧',
    importance: 6,
    signals: {
      files: [/email/, /mail/, /smtp/, /resend/, /sendgrid/, /nodemailer/],
      dirs: ['emails', 'mail', 'templates'],
    },
  },
  {
    id: 'search',
    title: '全文搜索',
    description: '高效的内容索引与搜索，快速定位信息',
    icon: '🔍',
    importance: 7,
    signals: {
      files: [/search/, /algolia/, /elastic/, /meilisearch/, /typesense/],
      dirs: ['search'],
    },
  },
  {
    id: 'ai',
    title: 'AI / LLM 集成',
    description: '内置 AI 能力，利用大语言模型增强核心功能',
    icon: '🤖',
    importance: 10,
    signals: {
      files: [/openai/, /anthropic/, /llm/, /gpt/, /ai\./, /langchain/, /ollama/],
      dirs: ['ai', 'llm'],
    },
  },
  {
    id: 'cache',
    title: '缓存策略',
    description: '多层缓存架构（Redis / 内存缓存），大幅提升响应速度',
    icon: '⚡',
    importance: 7,
    signals: {
      files: [/redis/, /cache/, /memcache/],
      dirs: ['cache'],
    },
  },
  {
    id: 'cli',
    title: 'CLI 工具',
    description: '命令行工具支持，开发者友好，脚本化自动化流程',
    icon: '💻',
    importance: 7,
    signals: {
      files: [/cli\.(ts|js)$/, /bin\//, /commander/, /yargs/, /chalk/],
      dirs: ['cli', 'bin'],
    },
  },
  {
    id: 'testing-suite',
    title: '测试套件',
    description: '完整的测试覆盖：单元 → 集成 → E2E，持续保障代码质量',
    icon: '✅',
    importance: 8,
    signals: {
      files: [/\.test\.(ts|js|tsx|jsx)$/, /\.spec\.(ts|js|tsx|jsx)$/],
      dirs: ['tests', '__tests__', 'e2e', 'spec'],
    },
  },
  {
    id: 'docs',
    title: '文档体系',
    description: '内置文档站点 / Storybook，降低协作成本',
    icon: '📚',
    importance: 6,
    signals: {
      files: [/storybook/, /\.stories\./, /\.mdx$/],
      dirs: ['docs', 'storybook', '.storybook'],
    },
  },
]

function extractFeatures(tree: ParsedTree): Feature[] {
  const { allFiles, allDirs } = tree
  const filePaths = allFiles.map(f => f.path)
  const dirNames = allDirs.map(d => d.name)
  const extensions = allFiles.map(f => f.ext).filter(Boolean) as string[]

  const scored: Array<Feature & { score: number }> = []

  for (const rule of FEATURE_RULES) {
    let score = 0
    const relatedFiles: string[] = []

    if (rule.signals.files) {
      for (const pattern of rule.signals.files) {
        const matches = allFiles.filter(f => pattern.test(f.path))
        if (matches.length > 0) {
          score += matches.length * 2
          relatedFiles.push(...matches.slice(0, 3).map(f => f.path))
        }
      }
    }

    if (rule.signals.dirs) {
      for (const dir of rule.signals.dirs) {
        if (dirNames.includes(dir)) {
          score += 5
          const matchedDir = allDirs.find(d => d.name === dir)
          if (matchedDir) relatedFiles.push(matchedDir.path)
        }
      }
    }

    if (rule.signals.exts) {
      for (const ext of rule.signals.exts) {
        if (extensions.includes(ext)) {
          score += 3
        }
      }
    }

    if (score > 0) {
      scored.push({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        icon: rule.icon,
        importance: rule.importance,
        relatedFiles: [...new Set(relatedFiles)],
        score: score * rule.importance,
      })
    }
  }

  // Sort by weighted score and return top 3
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score: _score, ...feature }) => feature)
}

// ─── Complexity Estimator ─────────────────────────────────────────────────────

function estimateComplexity(tree: ParsedTree): ProjectComplexity {
  const totalFiles = tree.allFiles.length
  const totalDirs = tree.allDirs.length
  const uniqueExts = Object.keys(tree.filesByExt).length

  if (totalFiles < 20 && totalDirs < 10) return 'simple'
  if (totalFiles > 100 || uniqueExts > 8 || totalDirs > 30) return 'complex'
  return 'medium'
}

// ─── Project Type Classifier ──────────────────────────────────────────────────

function classifyProjectType(tree: ParsedTree, techNames: string[]): string {
  const dirNames = tree.allDirs.map(d => d.name)
  const extensions = Object.keys(tree.filesByExt)

  if (techNames.includes('React Native') || extensions.includes('.xcodeproj')) return '📱 移动端应用'
  if (techNames.some(t => ['Next.js', 'Nuxt', 'SvelteKit', 'Astro'].includes(t))) return '🌐 全栈 Web 应用'
  if (techNames.includes('React') || techNames.includes('Vue') || techNames.includes('Svelte')) return '🖼 前端 SPA'
  if (techNames.some(t => ['FastAPI', 'Django', 'Flask', 'Express', 'Spring Boot', 'Laravel'].includes(t))) return '🔧 后端服务'
  if (dirNames.includes('packages') && dirNames.includes('apps')) return '📦 Monorepo 项目'
  if (extensions.includes('.go') || extensions.includes('.rs')) return '⚙️ 系统 / CLI 工具'
  if (extensions.includes('.py') && dirNames.some(d => ['notebooks', 'data', 'models'].includes(d))) return '🧠 机器学习项目'
  if (techNames.includes('TypeScript') || techNames.includes('JavaScript')) return '🟨 Node.js 项目'
  return '📁 通用项目'
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function analyzeProject(rawTree: string): AnalysisResult {
  const tree = parseTree(rawTree)

  const techStack = detectTechStack(tree.allFiles, tree.allDirs)
  const architectureHighlights = analyzeArchitecture(tree)
  const features = extractFeatures(tree)
  const complexity = estimateComplexity(tree)
  const projectType = classifyProjectType(tree, techStack.map(t => t.name))

  // Extract project name from the first line of the tree
  const firstLine = rawTree.split('\n')[0]?.trim().replace(/\/$/, '') ?? 'project'
  const projectName = firstLine.split(/[/\\]/).pop() ?? 'project'

  return {
    projectName,
    projectType,
    complexity,
    techStack,
    architectureHighlights,
    features,
    rawTree,
    analyzedAt: new Date(),
  }
}

// ─── GitHub URL Entry Point ───────────────────────────────────────────────────

function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/\.git$/, '').replace(/\/$/, '')
  const match = cleaned.match(
    /(?:https?:\/\/)?(?:github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/,
  )
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function fetchGitHubApiTree(
  owner: string,
  repo: string,
  signal?: AbortSignal,
): Promise<{ tree: ParsedTree; truncated: boolean }> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: { Accept: 'application/vnd.github.v3+json' }, signal },
  )

  if (!response.ok) {
    if (response.status === 403) throw new Error('GitHub API 请求频率超限（60次/小时），请稍后重试')
    if (response.status === 404) throw new Error('仓库不存在或为私有仓库，请确认 URL 是否正确')
    throw new Error(`GitHub API 错误：${response.status}`)
  }

  const data: GitHubTreeResponse = await response.json()

  const allFiles: TreeNode[] = []
  const allDirs: TreeNode[] = []
  const filesByExt: Record<string, TreeNode[]> = {}

  const root: TreeNode = { name: repo, path: repo, type: 'dir', depth: 0 }
  allDirs.push(root)

  for (const item of data.tree) {
    const parts = item.path.split('/')
    const name = parts[parts.length - 1]
    const depth = parts.length
    const fullPath = `${repo}/${item.path}`
    const ext = name.includes('.') ? '.' + name.split('.').pop()!.toLowerCase() : undefined

    if (item.type === 'tree') {
      allDirs.push({ name, path: fullPath, type: 'dir', depth })
    } else {
      const node: TreeNode = { name, path: fullPath, type: 'file', ext, depth }
      allFiles.push(node)
      if (ext) {
        filesByExt[ext] = filesByExt[ext] ?? []
        filesByExt[ext].push(node)
      }
    }
  }

  return { tree: { root, allFiles, allDirs, filesByExt }, truncated: data.truncated }
}

export async function analyzeFromGitHubUrl(input: string, signal?: AbortSignal): Promise<AnalysisResult> {
  const parsed = parseGitHubUrl(input)
  if (!parsed) {
    throw new Error('无效的仓库地址，支持格式：https://github.com/owner/repo 或 owner/repo')
  }

  const { owner, repo } = parsed
  const { tree, truncated } = await fetchGitHubApiTree(owner, repo, signal)

  const techStack = detectTechStack(tree.allFiles, tree.allDirs)
  const architectureHighlights = analyzeArchitecture(tree)
  const features = extractFeatures(tree)
  const complexity = estimateComplexity(tree)
  const projectType = classifyProjectType(tree, techStack.map(t => t.name))

  return {
    projectName: repo,
    projectType,
    complexity,
    techStack,
    architectureHighlights,
    features,
    rawTree: `${owner}/${repo}`,
    analyzedAt: new Date(),
    warning: truncated
      ? `该仓库文件数超过 GitHub API 限制（10万），返回的文件树不完整，分析结果可能不完整。`
      : undefined,
  }
}
