'use client'

import { useState, useCallback } from 'react'

const PLACEHOLDER = `my-awesome-project/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── features/
│   ├── lib/
│   │   └── db.ts
│   └── styles/
│       └── globals.css
├── prisma/
│   └── schema.prisma
├── tests/
├── .github/
│   └── workflows/
│       └── ci.yml
├── Dockerfile
├── package.json
└── tailwind.config.ts`

const EXAMPLES: Array<{ name: string; tree: string }> = [
  {
    name: 'Next.js SaaS',
    tree: `my-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   └── api/
│   │       └── stripe/
│   ├── components/
│   ├── lib/
│   └── store/
├── prisma/
│   └── schema.prisma
├── .github/
├── Dockerfile
├── tailwind.config.ts
└── package.json`,
  },
  {
    name: 'FastAPI + AI',
    tree: `ai-backend/
├── app/
│   ├── api/
│   │   └── routes/
│   ├── core/
│   ├── models/
│   └── main.py
├── ai/
│   ├── llm.py
│   └── embeddings.py
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── pyproject.toml`,
  },
  {
    name: 'Rust CLI',
    tree: `rusty-tool/
├── src/
│   ├── main.rs
│   ├── cli.rs
│   └── commands/
├── tests/
├── .github/
│   └── workflows/
├── Cargo.toml
└── README.md`,
  },
]

// GitHub URL 示例
const GITHUB_EXAMPLES = [
  { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
  { name: 'supabase/supabase', url: 'https://github.com/supabase/supabase' },
  { name: 'shadcn-ui/ui', url: 'https://github.com/shadcn-ui/ui' },
]

type InputMode = 'tree' | 'github'

interface InputPanelProps {
  onAnalyze: (input: string, mode: InputMode) => void
  isLoading: boolean
}

export default function InputPanel({ onAnalyze, isLoading }: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>('tree')
  const [treeValue, setTreeValue] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = useCallback(() => {
    if (mode === 'tree') {
      const trimmed = treeValue.trim()
      if (trimmed) onAnalyze(trimmed, 'tree')
    } else {
      const trimmed = githubUrl.trim()
      if (trimmed) onAnalyze(trimmed, 'github')
    }
  }, [mode, treeValue, githubUrl, onAnalyze])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
    },
    [handleSubmit],
  )

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const text = e.dataTransfer.getData('text/plain')
    if (text) setTreeValue(text)
  }, [])

  const canSubmit = mode === 'tree' ? !!treeValue.trim() : !!githubUrl.trim()

  return (
    <div className="w-full space-y-4">

      {/* ── Mode toggle ──────────────────────────────────────────────────────── */}
      <div role="tablist" aria-label="输入模式" className="flex gap-1 rounded-lg border border-white/8 bg-slate-900/60 p-1">
        {([
          { id: 'tree', label: '目录树', icon: '🌲' },
          { id: 'github', label: 'GitHub URL', icon: '🐙' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              mode === tab.id
                ? 'bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {mode === 'tree' ? (
        <>
          {/* Example presets */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">快速体验 →</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex.name}
                  onClick={() => setTreeValue(ex.tree)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div
            className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
              isDragging
                ? 'border-violet-500/60 bg-violet-500/5'
                : 'border-white/10 bg-slate-900/80 focus-within:border-violet-500/40'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {/* Corner decoration */}
            <div className="pointer-events-none absolute top-3 right-3 flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500/40" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/40" />
              <div className="h-2 w-2 rounded-full bg-green-500/40" />
            </div>

            {/* Line numbers gutter */}
            <div className="flex">
              <div
                aria-hidden
                className="select-none border-r border-white/5 bg-slate-950/50 px-3 pt-4 pb-4 text-right font-mono text-[11px] leading-6 text-slate-600 min-w-[36px]"
              >
                {(treeValue || PLACEHOLDER).split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={treeValue}
                onChange={e => setTreeValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER}
                spellCheck={false}
                aria-label="粘贴目录树"
                className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 placeholder:text-slate-600 focus:outline-none min-h-[280px]"
              />
            </div>

            {/* Drag hint */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-violet-500/10 backdrop-blur-sm">
                <p className="text-sm font-medium text-violet-300">松开以粘贴目录树</p>
              </div>
            )}
          </div>

          {/* Footer: char count + submit */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {treeValue.split('\n').filter(Boolean).length} 行 · ⌘ Enter 分析
            </p>
            <SubmitButton canSubmit={canSubmit} isLoading={isLoading} onSubmit={handleSubmit} />
          </div>
        </>
      ) : (
        <>
          {/* GitHub URL examples */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">热门示例 →</p>
            <div className="flex flex-wrap gap-2">
              {GITHUB_EXAMPLES.map(ex => (
                <button
                  key={ex.name}
                  onClick={() => setGithubUrl(ex.url)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 focus-within:border-violet-500/40 transition-all duration-200">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/owner/repo"
                spellCheck={false}
                className="flex-1 bg-transparent font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <div className="px-4 py-2.5 text-[11px] text-slate-600 leading-relaxed space-y-0.5">
              <p>支持格式：<code className="text-slate-500">https://github.com/owner/repo</code> 或 <code className="text-slate-500">owner/repo</code></p>
              <p>⚠ 仅支持公开仓库 · GitHub API 60次/小时（未登录）</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end">
            <SubmitButton canSubmit={canSubmit} isLoading={isLoading} onSubmit={handleSubmit} label="拉取并分析" icon="🐙" />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Shared Submit Button ─────────────────────────────────────────────────────

function SubmitButton({
  canSubmit,
  isLoading,
  onSubmit,
  label = '开始分析',
  icon = '🔬',
}: {
  canSubmit: boolean
  isLoading: boolean
  onSubmit: () => void
  label?: string
  icon?: string
}) {
  return (
    <button
      onClick={onSubmit}
      disabled={!canSubmit || isLoading}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {/* Shimmer */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {label === '拉取并分析' ? '拉取中…' : '分析中…'}
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">{icon}</span>
          {label}
        </span>
      )}
    </button>
  )
}
