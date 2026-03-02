'use client'

import type { VisualizationProps, TechItem } from '@/types'
import { CATEGORY_PALETTE } from '@/lib/tech-detector'

// ─── Layer Config ─────────────────────────────────────────────────────────────
// Presents the project as a layered tech "stack" from infra → UI

interface StackLayer {
  id: string
  label: string
  sublabel: string
  categories: Array<TechItem['category']>
  gradient: string
  border: string
  dot: string
}

const LAYERS: StackLayer[] = [
  {
    id: 'infra',
    label: '基础设施',
    sublabel: 'Infrastructure',
    categories: ['deployment'],
    gradient: 'from-cyan-950/80 to-slate-950',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
  },
  {
    id: 'data',
    label: '数据层',
    sublabel: 'Data Layer',
    categories: ['database'],
    gradient: 'from-emerald-950/80 to-slate-950',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  {
    id: 'core',
    label: '运行时 & 语言',
    sublabel: 'Runtime & Language',
    categories: ['language'],
    gradient: 'from-violet-950/80 to-slate-950',
    border: 'border-violet-500/25',
    dot: 'bg-violet-400',
  },
  {
    id: 'framework',
    label: '框架层',
    sublabel: 'Framework',
    categories: ['framework', 'state'],
    gradient: 'from-blue-950/80 to-slate-950',
    border: 'border-blue-500/25',
    dot: 'bg-blue-400',
  },
  {
    id: 'tooling',
    label: '工具链',
    sublabel: 'Toolchain & Testing',
    categories: ['tooling', 'testing'],
    gradient: 'from-amber-950/80 to-slate-950',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
  },
  {
    id: 'ui',
    label: '表现层',
    sublabel: 'UI & Design System',
    categories: ['ui'],
    gradient: 'from-pink-950/80 to-slate-950',
    border: 'border-pink-500/25',
    dot: 'bg-pink-400',
  },
]

export default function TimelineView({ result, className = '' }: VisualizationProps) {
  const { techStack, architectureHighlights, features, projectName, projectType, complexity } = result

  return (
    <div className={`w-full space-y-4 ${className}`}>

      {/* ── Project Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-slate-900/80 px-5 py-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{projectType}</p>
          <p className="mt-0.5 text-lg font-bold text-white">{projectName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Tech Layers</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {LAYERS.filter(l => l.categories.some(cat => techStack.some(t => t.category === cat))).length}
          </p>
        </div>
      </div>

      {/* ── Layer Stack ──────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/30 via-violet-500/20 to-pink-500/30" />

        <div className="space-y-2">
          {LAYERS.map((layer, layerIdx) => {
            const layerTech = techStack.filter(t => layer.categories.includes(t.category))
            if (layerTech.length === 0) return null

            return (
              <div
                key={layer.id}
                className={`relative overflow-hidden rounded-xl border ${layer.border} bg-gradient-to-r ${layer.gradient} p-4 pl-16 transition-all duration-300 hover:brightness-110`}
                style={{ animationDelay: `${layerIdx * 80}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center">
                  <div className={`h-3 w-3 rounded-full ${layer.dot} shadow-lg ring-2 ring-black/40`} />
                </div>

                {/* Layer number */}
                <div className="absolute left-7 top-2 text-[9px] font-bold text-slate-600 tabular-nums">
                  L{layerIdx + 1}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-bold text-white">{layer.label}</p>
                      <p className="text-[10px] text-slate-500">{layer.sublabel}</p>
                    </div>

                    {/* Tech pills */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {layerTech.map(tech => {
                        const palette = CATEGORY_PALETTE[tech.category]
                        return (
                          <div
                            key={tech.name}
                            className={`flex items-center gap-1.5 rounded-full border ${palette.border} ${palette.bg} px-2.5 py-1`}
                          >
                            <span className="text-sm leading-none">{tech.icon}</span>
                            <span className={`text-xs font-medium ${palette.text}`}>{tech.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Confidence average */}
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-slate-500">avg.</p>
                    <p className={`text-sm font-bold ${layer.dot.replace('bg-', 'text-')}`}>
                      {Math.round(layerTech.reduce((s, t) => s + t.confidence, 0) / layerTech.length)}%
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Feature Timeline ─────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">核心功能时间线</h3>
          <div className="relative">
            {/* Horizontal connector */}
            <div className="absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-transparent" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.id}
                  className="relative overflow-hidden rounded-xl border border-white/8 bg-slate-900/80 p-4 pt-10"
                >
                  {/* Step indicator */}
                  <div className="absolute top-3 left-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/10 text-[10px] font-bold text-violet-400">
                      {i + 1}
                    </div>
                    <div className="h-px flex-1 bg-violet-500/20" />
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{feature.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight">{feature.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400 line-clamp-2">{feature.description}</p>
                    </div>
                  </div>

                  {/* Importance bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${feature.importance * 10}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{feature.importance}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Architecture chips ───────────────────────────────────────────────── */}
      {architectureHighlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {architectureHighlights.map(arch => (
            <div
              key={arch.id}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-300">{arch.title}</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-slate-500">{arch.badge}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
