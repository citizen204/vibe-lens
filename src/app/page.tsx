'use client'

import { useState, useCallback, useRef } from 'react'
import type { AnalysisResult, VisualizationMode } from '@/types'
import { analyzeProject, analyzeFromGitHubUrl } from '@/lib/analyzer'
import InputPanel from '@/components/InputPanel'
import GridCardView from '@/components/visualizations/GridCardView'
import ConstellationView from '@/components/visualizations/ConstellationView'
import TimelineView from '@/components/visualizations/TimelineView'
import CopyMarkdown from '@/components/CopyMarkdown'

// ─── Visualization Mode Tabs ──────────────────────────────────────────────────

const VIZ_MODES: Array<{ id: VisualizationMode; label: string; desc: string; icon: string }> = [
  { id: 'grid',          label: 'Grid Cards',    desc: 'Apple 风格卡片流',  icon: '⊞' },
  { id: 'constellation', label: 'Constellation', desc: '科技感星图',        icon: '✦' },
  { id: 'timeline',      label: 'Layer Stack',   desc: '分层架构时间线',    icon: '≡' },
]

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMode, setLoadingMode] = useState<'tree' | 'github'>('tree')
  const [error, setError] = useState<string | null>(null)
  const [vizMode, setVizMode] = useState<VisualizationMode>('grid')
  const resultRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
    setError(null)
  }, [])

  const handleAnalyze = useCallback((input: string, mode: 'tree' | 'github' = 'tree') => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(true)
    setLoadingMode(mode)
    setError(null)

    const finish = (analysis: AnalysisResult | null, err?: string) => {
      setIsLoading(false)
      if (err || !analysis) {
        if (err === 'The user aborted a request.' || err?.includes('aborted')) return
        setError(err ?? '未知错误')
        setResult(null)
        return
      }
      if (analysis.techStack.length === 0 && analysis.architectureHighlights.length === 0) {
        setError(
          mode === 'github'
            ? '未能识别到任何技术栈，该仓库文件可能较少或使用了冷门语言。'
            : '未能识别到任何技术栈。请检查输入格式是否正确，或点击示例快速体验。',
        )
        return
      }
      setResult(analysis)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    if (mode === 'github') {
      const controller = new AbortController()
      abortRef.current = controller
      analyzeFromGitHubUrl(input, controller.signal)
        .then(analysis => finish(analysis))
        .catch((err: Error) => finish(null, err.message))
    } else {
      // Small async tick so loading state renders before synchronous analysis blocks
      setTimeout(() => {
        try {
          finish(analyzeProject(input))
        } catch {
          finish(null, '解析失败，请确认输入是有效的目录树格式。')
        }
      }, 30)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* ── Ambient Background ──────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-700/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 h-[600px] w-[600px] rounded-full bg-blue-700/6 blur-[140px]" />
        <div className="absolute -bottom-60 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-700/6 blur-[100px]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/20">
              <span className="text-sm" aria-hidden="true">🔬</span>
            </div>
            <span className="text-sm font-bold text-white">Vibe-Lens</span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              alpha
            </span>
          </div>
          <a
            href="https://github.com/citizen204/vibe-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-medium text-violet-300">开源 · 纯前端 · 无需 API Key</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            让你的项目结构
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              开口说话
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            粘贴任意 GitHub 仓库的目录树，Vibe-Lens 自动分析技术栈、架构亮点与核心功能，
            生成 3 种惊艳可视化，一键复制 Markdown 到你的 README。
          </p>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-slate-300">
                粘贴目录树
              </h2>
              <p className="text-xs text-slate-500">
                支持 <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[11px]">tree</code> 命令输出、GitHub 文件浏览器复制、或手动输入
              </p>
            </div>
            <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* How it works */}
            <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">工作原理</p>
              <div className="space-y-2.5">
                {[
                  { step: '01', text: '基于规则引擎，从文件名 / 路径识别 60+ 技术' },
                  { step: '02', text: '模式匹配提取架构亮点与目录结构语义' },
                  { step: '03', text: '加权评分算法筛选 Top 3 核心功能' },
                  { step: '04', text: '生成 shields.io 徽章 + Markdown 摘要' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                      {item.step}
                    </span>
                    <p className="text-xs text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div ref={resultRef} className="space-y-5">
            {/* Empty state */}
            {!result && !isLoading && !error && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 px-8 text-center">
                <div className="text-5xl opacity-20">🔬</div>
                <div>
                  <p className="text-sm font-medium text-slate-400">分析结果将在这里展示</p>
                  <p className="mt-1 text-xs text-slate-600">在左侧粘贴目录树，或点击示例快速体验</p>
                </div>
                <div className="mt-2 rounded-lg border border-white/5 bg-white/3 px-4 py-3 text-left">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">快速生成目录树</p>
                  <code className="block font-mono text-[11px] leading-5 text-slate-500">
                    tree -I &apos;node_modules|.git|.next&apos; --dirsfirst
                  </code>
                </div>
              </div>
            )}

            {/* Error state */}
            {!result && !isLoading && error && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl">
                  ⚠️
                </div>
                <div>
                  <p className="text-sm font-medium text-red-300">识别失败</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white"
                >
                  重新输入
                </button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/3">
                <div className="h-10 w-10">
                  <svg className="animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-sm text-violet-300">
                  {loadingMode === 'github' ? '正在从 GitHub 拉取文件树…' : '正在解析目录树…'}
                </p>
                {loadingMode === 'github' && (
                  <>
                    <p className="text-xs text-slate-600">调用 GitHub API，通常需要 1–3 秒</p>
                    <button
                      onClick={handleCancel}
                      className="mt-1 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            )}

            {result && !isLoading && (
              <div className="animate-float-up space-y-5">
                {/* Truncated warning */}
                {result.warning && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/8 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-yellow-400" aria-hidden="true">⚠️</span>
                    <p className="text-xs leading-relaxed text-yellow-300">{result.warning}</p>
                  </div>
                )}

                {/* Viz mode tabs */}
                <div
                  role="tablist"
                  aria-label="可视化模式"
                  className="flex gap-1.5 rounded-xl border border-white/8 bg-slate-900/60 p-1.5"
                >
                  {VIZ_MODES.map(mode => (
                    <button
                      key={mode.id}
                      role="tab"
                      aria-selected={vizMode === mode.id}
                      aria-controls="viz-panel"
                      onClick={() => setVizMode(mode.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-center transition-all ${
                        vizMode === mode.id
                          ? 'bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-base leading-none" aria-hidden="true">{mode.icon}</div>
                      <div className="mt-1 text-[10px] font-medium">{mode.label}</div>
                      <div className="text-[9px] opacity-60">{mode.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Visualization output */}
                <div id="viz-panel" role="tabpanel" className="transition-all duration-300">
                  {vizMode === 'grid'          && <GridCardView result={result} />}
                  {vizMode === 'constellation' && <ConstellationView result={result} />}
                  {vizMode === 'timeline'      && <TimelineView result={result} />}
                </div>

                {/* Markdown copy */}
                <div className="border-t border-white/5 pt-5">
                  <CopyMarkdown result={result} />
                </div>

                {/* Re-analyze button */}
                <button
                  onClick={() => { setResult(null); setError(null) }}
                  className="w-full rounded-xl border border-white/8 py-2.5 text-xs text-slate-500 transition-all hover:border-white/15 hover:text-slate-300"
                >
                  重新分析
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-slate-600">
          Vibe-Lens · 开源项目 · MIT License ·{' '}
          <a href="https://github.com/citizen204/vibe-lens" className="hover:text-slate-400 transition-colors">
            在 GitHub 上查看
          </a>
        </p>
      </footer>
    </div>
  )
}
