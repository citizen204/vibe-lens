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

interface InputPanelProps {
  onAnalyze: (tree: string) => void
  isLoading: boolean
}

export default function InputPanel({ onAnalyze, isLoading }: InputPanelProps) {
  const [value, setValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed) onAnalyze(trimmed)
  }, [value, onAnalyze])

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
    if (text) setValue(text)
  }, [])

  return (
    <div className="w-full space-y-4">
      {/* Example presets */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">快速体验 →</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.name}
              onClick={() => setValue(ex.tree)}
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
            {(value || PLACEHOLDER).split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER}
            spellCheck={false}
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
          {value.split('\n').filter(Boolean).length} 行 · ⌘ Enter 分析
        </p>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {/* Shimmer */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              分析中…
            </span>
          ) : (
            '🔬 开始分析'
          )}
        </button>
      </div>
    </div>
  )
}
