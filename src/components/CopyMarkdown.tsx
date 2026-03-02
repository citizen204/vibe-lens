'use client'

import { useState, useCallback } from 'react'
import type { AnalysisResult } from '@/types'
import { generateMarkdown } from '@/lib/markdown-generator'

interface CopyMarkdownProps {
  result: AnalysisResult
}

export default function CopyMarkdown({ result }: CopyMarkdownProps) {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const markdown = generateMarkdown(result)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = markdown
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [markdown])

  return (
    <div className="w-full space-y-3">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs font-medium text-slate-400">README Markdown 已就绪</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white"
          >
            {showPreview ? '隐藏预览' : '预览'}
          </button>
          <button
            onClick={handleCopy}
            className={`relative overflow-hidden rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
              copied
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/50'
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                已复制！
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                一键复制 Markdown
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Preview panel */}
      {showPreview && (
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-slate-950">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs font-mono text-slate-500">README.md</span>
            <div className="ml-auto text-[10px] text-slate-600">{markdown.length} chars</div>
          </div>
          <pre className="max-h-64 overflow-y-auto p-4 font-mono text-[11px] leading-5 text-slate-400 whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      )}

      <p className="text-[10px] text-slate-600">
        将以上 Markdown 粘贴到你的 README.md 底部，即可展示项目可视化摘要。
      </p>
    </div>
  )
}
