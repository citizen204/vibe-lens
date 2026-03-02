import type { TechItem, TechCategory, TreeNode } from '@/types'

// ─── Detection Rules ──────────────────────────────────────────────────────────

interface DetectionRule {
  name: string
  category: TechCategory
  icon: string
  color: string
  // Match against file names, paths, or extensions
  filePatterns?: RegExp[]
  // Match against directory names
  dirPatterns?: RegExp[]
  // Must have these extensions present in the repo
  extensions?: string[]
  // Minimum confidence granted when matched
  baseConfidence?: number
}

const TECH_RULES: DetectionRule[] = [
  // ── Languages ──────────────────────────────────────────────────────────────
  {
    name: 'TypeScript',
    category: 'language',
    icon: '𝕋',
    color: 'blue',
    filePatterns: [/tsconfig\.json$/, /\.tsx?$/],
    extensions: ['.ts', '.tsx'],
    baseConfidence: 90,
  },
  {
    name: 'JavaScript',
    category: 'language',
    icon: 'JS',
    color: 'yellow',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    baseConfidence: 80,
  },
  {
    name: 'Python',
    category: 'language',
    icon: '🐍',
    color: 'green',
    filePatterns: [/requirements\.txt$/, /pyproject\.toml$/, /setup\.py$/, /\.py$/],
    extensions: ['.py'],
    baseConfidence: 90,
  },
  {
    name: 'Rust',
    category: 'language',
    icon: '🦀',
    color: 'orange',
    filePatterns: [/Cargo\.toml$/, /\.rs$/],
    extensions: ['.rs'],
    baseConfidence: 95,
  },
  {
    name: 'Go',
    category: 'language',
    icon: '🐹',
    color: 'cyan',
    filePatterns: [/go\.mod$/, /go\.sum$/, /\.go$/],
    extensions: ['.go'],
    baseConfidence: 95,
  },
  {
    name: 'Java',
    category: 'language',
    icon: '☕',
    color: 'red',
    filePatterns: [/pom\.xml$/, /build\.gradle$/, /\.java$/],
    extensions: ['.java'],
    baseConfidence: 90,
  },
  {
    name: 'Ruby',
    category: 'language',
    icon: '💎',
    color: 'red',
    filePatterns: [/Gemfile$/, /\.rb$/],
    extensions: ['.rb'],
    baseConfidence: 90,
  },
  {
    name: 'PHP',
    category: 'language',
    icon: '🐘',
    color: 'purple',
    filePatterns: [/composer\.json$/, /\.php$/],
    extensions: ['.php'],
    baseConfidence: 90,
  },
  {
    name: 'Swift',
    category: 'language',
    icon: '🐦',
    color: 'orange',
    filePatterns: [/Package\.swift$/, /\.swift$/],
    extensions: ['.swift'],
    baseConfidence: 95,
  },
  {
    name: 'Kotlin',
    category: 'language',
    icon: '🟣',
    color: 'purple',
    extensions: ['.kt', '.kts'],
    baseConfidence: 90,
  },
  {
    name: 'C#',
    category: 'language',
    icon: '#',
    color: 'purple',
    filePatterns: [/\.csproj$/, /\.cs$/],
    extensions: ['.cs'],
    baseConfidence: 90,
  },
  {
    name: 'C++',
    category: 'language',
    icon: '⚙️',
    color: 'gray',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp'],
    baseConfidence: 85,
  },

  // ── Frameworks ─────────────────────────────────────────────────────────────
  {
    name: 'Next.js',
    category: 'framework',
    icon: '▲',
    color: 'slate',
    filePatterns: [/next\.config\.(js|ts|mjs)$/, /next-env\.d\.ts$/],
    dirPatterns: [/^app$/, /^pages$/],
    baseConfidence: 95,
  },
  {
    name: 'React',
    category: 'framework',
    icon: '⚛',
    color: 'cyan',
    extensions: ['.tsx', '.jsx'],
    filePatterns: [/react/],
    baseConfidence: 80,
  },
  {
    name: 'Vue',
    category: 'framework',
    icon: '💚',
    color: 'green',
    extensions: ['.vue'],
    filePatterns: [/vue\.config\.(js|ts)$/],
    baseConfidence: 95,
  },
  {
    name: 'Nuxt',
    category: 'framework',
    icon: '💚',
    color: 'emerald',
    filePatterns: [/nuxt\.config\.(js|ts)$/],
    baseConfidence: 98,
  },
  {
    name: 'SvelteKit',
    category: 'framework',
    icon: '🔥',
    color: 'orange',
    extensions: ['.svelte'],
    filePatterns: [/svelte\.config\.(js|ts)$/],
    baseConfidence: 95,
  },
  {
    name: 'Remix',
    category: 'framework',
    icon: '💿',
    color: 'blue',
    filePatterns: [/remix\.config\.(js|ts)$/, /vite\.config\.(js|ts)$/],
    dirPatterns: [/^app$/, /^routes$/],
    baseConfidence: 85,
  },
  {
    name: 'Astro',
    category: 'framework',
    icon: '🚀',
    color: 'purple',
    extensions: ['.astro'],
    filePatterns: [/astro\.config\.(js|ts|mjs)$/],
    baseConfidence: 95,
  },
  {
    name: 'Express',
    category: 'framework',
    icon: '🚂',
    color: 'gray',
    filePatterns: [/express/],
    baseConfidence: 75,
  },
  {
    name: 'FastAPI',
    category: 'framework',
    icon: '⚡',
    color: 'green',
    filePatterns: [/fastapi/, /main\.py$/],
    baseConfidence: 80,
  },
  {
    name: 'Django',
    category: 'framework',
    icon: '🎸',
    color: 'green',
    filePatterns: [/manage\.py$/, /settings\.py$/, /wsgi\.py$/],
    baseConfidence: 90,
  },
  {
    name: 'Flask',
    category: 'framework',
    icon: '🌶',
    color: 'gray',
    filePatterns: [/app\.py$/, /flask/],
    baseConfidence: 75,
  },
  {
    name: 'Laravel',
    category: 'framework',
    icon: '🎩',
    color: 'red',
    dirPatterns: [/^artisan$/, /^bootstrap$/],
    filePatterns: [/artisan$/],
    baseConfidence: 90,
  },
  {
    name: 'Spring Boot',
    category: 'framework',
    icon: '🍃',
    color: 'green',
    filePatterns: [/application\.properties$/, /application\.yml$/],
    baseConfidence: 85,
  },

  // ── UI Libraries ───────────────────────────────────────────────────────────
  {
    name: 'Tailwind CSS',
    category: 'ui',
    icon: '🎨',
    color: 'sky',
    filePatterns: [/tailwind\.config\.(js|ts|mjs|cjs)$/],
    baseConfidence: 98,
  },
  {
    name: 'shadcn/ui',
    category: 'ui',
    icon: '🧩',
    color: 'slate',
    filePatterns: [/components\.json$/],
    dirPatterns: [/^ui$/],
    baseConfidence: 90,
  },
  {
    name: 'Material UI',
    category: 'ui',
    icon: '📦',
    color: 'blue',
    filePatterns: [/@mui/, /material-ui/],
    baseConfidence: 80,
  },
  {
    name: 'Chakra UI',
    category: 'ui',
    icon: '⚡',
    color: 'teal',
    filePatterns: [/chakra/],
    baseConfidence: 80,
  },
  {
    name: 'Framer Motion',
    category: 'ui',
    icon: '🎬',
    color: 'pink',
    filePatterns: [/framer-motion/],
    baseConfidence: 80,
  },

  // ── Databases ──────────────────────────────────────────────────────────────
  {
    name: 'Prisma',
    category: 'database',
    icon: '🔷',
    color: 'blue',
    dirPatterns: [/^prisma$/],
    filePatterns: [/\.prisma$/],
    baseConfidence: 95,
  },
  {
    name: 'Drizzle ORM',
    category: 'database',
    icon: '💧',
    color: 'green',
    filePatterns: [/drizzle\.config\.(js|ts)$/, /drizzle/],
    baseConfidence: 90,
  },
  {
    name: 'MongoDB',
    category: 'database',
    icon: '🍃',
    color: 'green',
    filePatterns: [/mongoose/, /mongodb/],
    baseConfidence: 75,
  },
  {
    name: 'Supabase',
    category: 'database',
    icon: '⚡',
    color: 'emerald',
    filePatterns: [/supabase/, /\.env.*supabase/i],
    dirPatterns: [/^supabase$/],
    baseConfidence: 90,
  },
  {
    name: 'PostgreSQL',
    category: 'database',
    icon: '🐘',
    color: 'blue',
    filePatterns: [/postgres/, /pg\./],
    baseConfidence: 75,
  },

  // ── Tooling ────────────────────────────────────────────────────────────────
  {
    name: 'Vite',
    category: 'tooling',
    icon: '⚡',
    color: 'violet',
    filePatterns: [/vite\.config\.(js|ts|mjs)$/],
    baseConfidence: 98,
  },
  {
    name: 'Webpack',
    category: 'tooling',
    icon: '📦',
    color: 'blue',
    filePatterns: [/webpack\.config\.(js|ts)$/],
    baseConfidence: 98,
  },
  {
    name: 'Turbopack',
    category: 'tooling',
    icon: '🚀',
    color: 'red',
    filePatterns: [/turbo\.json$/],
    dirPatterns: [/^packages$/],
    baseConfidence: 90,
  },
  {
    name: 'ESLint',
    category: 'tooling',
    icon: '🔍',
    color: 'purple',
    filePatterns: [/\.eslintrc\.(js|json|yml|cjs|mjs)$/, /eslint\.config\.(js|mjs)$/],
    baseConfidence: 95,
  },
  {
    name: 'Biome',
    category: 'tooling',
    icon: '🌿',
    color: 'green',
    filePatterns: [/biome\.json$/],
    baseConfidence: 98,
  },
  {
    name: 'Docker',
    category: 'deployment',
    icon: '🐳',
    color: 'blue',
    filePatterns: [/Dockerfile/, /docker-compose\.(yml|yaml)$/],
    baseConfidence: 98,
  },
  {
    name: 'GitHub Actions',
    category: 'deployment',
    icon: '⚙️',
    color: 'slate',
    dirPatterns: [/^\.github$/],
    filePatterns: [/\.github\/workflows/],
    baseConfidence: 95,
  },
  {
    name: 'Kubernetes',
    category: 'deployment',
    icon: '☸️',
    color: 'blue',
    filePatterns: [/k8s/, /kubernetes/, /helm/],
    dirPatterns: [/^k8s$/, /^helm$/],
    baseConfidence: 90,
  },

  // ── Testing ────────────────────────────────────────────────────────────────
  {
    name: 'Vitest',
    category: 'testing',
    icon: '✅',
    color: 'green',
    filePatterns: [/vitest\.config\.(js|ts)$/, /\.test\.(ts|tsx|js|jsx)$/],
    baseConfidence: 90,
  },
  {
    name: 'Jest',
    category: 'testing',
    icon: '🃏',
    color: 'red',
    filePatterns: [/jest\.config\.(js|ts|cjs|mjs)$/, /\.test\.(ts|tsx|js|jsx)$/],
    baseConfidence: 85,
  },
  {
    name: 'Playwright',
    category: 'testing',
    icon: '🎭',
    color: 'green',
    filePatterns: [/playwright\.config\.(js|ts)$/],
    dirPatterns: [/^e2e$/, /^tests$/],
    baseConfidence: 98,
  },
  {
    name: 'Cypress',
    category: 'testing',
    icon: '🌲',
    color: 'emerald',
    filePatterns: [/cypress\.config\.(js|ts)$/],
    dirPatterns: [/^cypress$/],
    baseConfidence: 98,
  },

  // ── State Management ──────────────────────────────────────────────────────
  {
    name: 'Zustand',
    category: 'state',
    icon: '🐻',
    color: 'orange',
    filePatterns: [/store\.(ts|js)$/, /zustand/],
    dirPatterns: [/^stores?$/],
    baseConfidence: 75,
  },
  {
    name: 'Redux',
    category: 'state',
    icon: '🔴',
    color: 'purple',
    filePatterns: [/redux/, /store\.(ts|js)$/],
    dirPatterns: [/^redux$/, /^slices?$/],
    baseConfidence: 80,
  },
  {
    name: 'Jotai',
    category: 'state',
    icon: '⚛',
    color: 'blue',
    filePatterns: [/jotai/, /atoms?\.(ts|js)$/],
    dirPatterns: [/^atoms?$/],
    baseConfidence: 80,
  },
]

// ─── Color Palette per Category ───────────────────────────────────────────────

export const CATEGORY_PALETTE: Record<string, { bg: string; text: string; border: string }> = {
  language:   { bg: 'bg-violet-500/10',  text: 'text-violet-300',  border: 'border-violet-500/30' },
  framework:  { bg: 'bg-blue-500/10',    text: 'text-blue-300',    border: 'border-blue-500/30' },
  ui:         { bg: 'bg-pink-500/10',    text: 'text-pink-300',    border: 'border-pink-500/30' },
  database:   { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  tooling:    { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/30' },
  deployment: { bg: 'bg-cyan-500/10',    text: 'text-cyan-300',    border: 'border-cyan-500/30' },
  testing:    { bg: 'bg-rose-500/10',    text: 'text-rose-300',    border: 'border-rose-500/30' },
  state:      { bg: 'bg-orange-500/10',  text: 'text-orange-300',  border: 'border-orange-500/30' },
}

// ─── Core Detection Function ──────────────────────────────────────────────────

export function detectTechStack(
  allFiles: TreeNode[],
  allDirs: TreeNode[],
): TechItem[] {
  const results: TechItem[] = []
  const filePaths = allFiles.map(f => f.path.toLowerCase())
  const dirNames = allDirs.map(d => d.name.toLowerCase())
  const extensions = new Set(allFiles.map(f => f.ext).filter(Boolean) as string[])

  for (const rule of TECH_RULES) {
    const detectedFrom: string[] = []
    let confidence = 0

    // Check file patterns
    if (rule.filePatterns) {
      for (const pattern of rule.filePatterns) {
        const matched = allFiles
          .filter(f => pattern.test(f.path))
          .map(f => f.path)
        if (matched.length > 0) {
          detectedFrom.push(...matched.slice(0, 3))
          confidence = Math.max(confidence, rule.baseConfidence ?? 80)
        }
      }
    }

    // Check dir patterns
    if (rule.dirPatterns) {
      for (const pattern of rule.dirPatterns) {
        const matched = allDirs
          .filter(d => pattern.test(d.name))
          .map(d => d.path)
        if (matched.length > 0) {
          detectedFrom.push(...matched.slice(0, 2))
          confidence = Math.max(confidence, (rule.baseConfidence ?? 80) - 10)
        }
      }
    }

    // Check extensions
    if (rule.extensions) {
      const matchedExts = rule.extensions.filter(ext => extensions.has(ext))
      if (matchedExts.length > 0) {
        const sample = allFiles
          .filter(f => rule.extensions!.includes(f.ext ?? ''))
          .slice(0, 3)
          .map(f => f.path)
        detectedFrom.push(...sample)
        confidence = Math.max(confidence, (rule.baseConfidence ?? 80) - 5)
      }
    }

    if (confidence > 0 && detectedFrom.length > 0) {
      // Deduplicate detectedFrom
      const uniqueDetectedFrom = [...new Set(detectedFrom)]

      results.push({
        name: rule.name,
        category: rule.category,
        icon: rule.icon,
        color: rule.color,
        confidence,
        detectedFrom: uniqueDetectedFrom,
      })
    }
  }

  // Deduplicate: if both React and Next.js detected, boost Next.js confidence
  const hasNextJs = results.find(r => r.name === 'Next.js')
  const hasReact = results.find(r => r.name === 'React')
  if (hasNextJs && hasReact) {
    hasReact.confidence = Math.min(hasReact.confidence, 70)
  }

  // Sort: by confidence desc, then alphabetically
  return results.sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name))
}
