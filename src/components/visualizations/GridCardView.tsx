'use client'

/**
 * GridCardView — "Apple 精细网格" 可视化
 *
 * 特性：
 *  - TechCard 子组件：每张卡片自管理动画状态
 *  - useCountUp：RAF + ease-out-expo 曲线计数动画
 *  - 进度条：cubic-bezier 填充 + 填满后 bar-shimmer 扫光（CSS keyframe）
 *  - 信号强度格：4 格可视化置信度
 *  - 重要度指示灯：10 个 HSL 插值颜色圆点
 *  - 悬浮 Glow：每类别对应的霓虹色 box-shadow + border
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { VisualizationProps, TechItem } from '@/types'
import { CATEGORY_PALETTE } from '@/lib/tech-detector'

// ─── 配置 ─────────────────────────────────────────────────────────────────────

const COMPLEXITY = {
  simple:  { label: '轻量级', tw: 'text-emerald-400', dot: 'bg-emerald-400', hex: '#34d399' },
  medium:  { label: '中等规模', tw: 'text-amber-400',  dot: 'bg-amber-400',   hex: '#fbbf24' },
  complex: { label: '大型复杂', tw: 'text-rose-400',   dot: 'bg-rose-400',    hex: '#fb7185' },
}

/** 各类别对应的霓虹 Glow 颜色（比 Tailwind 类名解析更可靠） */
const CAT_GLOW: Record<string, string> = {
  language:   '#7c3aed',
  framework:  '#2563eb',
  ui:         '#db2777',
  database:   '#059669',
  tooling:    '#d97706',
  deployment: '#0891b2',
  testing:    '#e11d48',
  state:      '#ea580c',
}

// ─── 信号强度格组件 ───────────────────────────────────────────────────────────

function SignalBars({ pct, color }: { pct: number; color: string }) {
  // 4 bars 阈值：25 / 50 / 75 / 100
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: 14 }}>
      {[25, 50, 75, 100].map((threshold, i) => {
        const lit = pct >= threshold
        return (
          <div
            key={i}
            className="w-[3.5px] rounded-sm transition-all duration-700"
            style={{
              height: `${38 + i * 21}%`,
              backgroundColor: lit ? color : 'rgba(255,255,255,0.07)',
              boxShadow:       lit ? `0 0 5px ${color}99` : 'none',
              transitionDelay: `${i * 60}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── useCountUp hook ──────────────────────────────────────────────────────────

function useCountUp(target: number, active: boolean, delayMs: number) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) { setValue(0); return }

    const timer = setTimeout(() => {
      const DURATION = 1100
      const t0 = Date.now()

      const tick = () => {
        const elapsed = Date.now() - t0
        const progress = Math.min(elapsed / DURATION, 1)
        // ease-out-expo: deceleration curve that overshoots slightly at end
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        setValue(Math.round(eased * target))
        if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    }, delayMs)

    return () => {
      clearTimeout(timer)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [active, target, delayMs])

  return value
}

// ─── TechCard 子组件 ──────────────────────────────────────────────────────────

interface TechCardProps {
  tech: TechItem
  index: number
  mounted: boolean   // 全局 mount 信号（触发动画）
}

function TechCard({ tech, index, mounted }: TechCardProps) {
  const palette  = CATEGORY_PALETTE[tech.category] ?? CATEGORY_PALETTE.tooling
  const glowHex  = CAT_GLOW[tech.category] ?? '#2563eb'
  const count    = useCountUp(tech.confidence, mounted, index * 90)
  const barDelay = index * 90     // ms — 与 count 同步
  const shimmerDelay = barDelay + 1200  // ms — 填满后触发扫光

  return (
    <div
      className={`card-enter relative overflow-hidden rounded-xl border p-4 cursor-default ${palette.border} ${palette.bg}`}
      style={{
        animationDelay: `${index * 65}ms`,
        transition: 'box-shadow .3s ease, transform .3s ease, border-color .3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow    = `0 0 22px ${glowHex}33, 0 4px 20px ${glowHex}1a`
        el.style.transform    = 'translateY(-3px) scale(1.025)'
        el.style.borderColor  = `${glowHex}55`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow   = ''
        el.style.transform   = ''
        el.style.borderColor = ''
      }}
    >
      {/* 右上角环境光晕 */}
      <div
        className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-20 blur-xl"
        style={{ background: glowHex }}
      />

      {/* 第一行：emoji + 信号格 */}
      <div className="relative flex items-start justify-between">
        <span className="text-[22px] leading-none select-none">{tech.icon}</span>
        <SignalBars pct={count} color={glowHex} />
      </div>

      {/* 名称 + 类别 */}
      <p className={`relative mt-2.5 text-sm font-bold leading-tight ${palette.text}`}>
        {tech.name}
      </p>
      <p className="mt-0.5 text-[10px] capitalize text-slate-500">{tech.category}</p>

      {/* 置信度区域 */}
      <div className="relative mt-3.5 space-y-1.5">
        {/* 数字 + 标签 */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-600">confidence</span>
          <span className={`text-xs font-bold tabular-nums font-mono ${palette.text}`}>
            {count}%
          </span>
        </div>

        {/* 进度条 track */}
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/5">

          {/* 填充 bar（cubic-bezier 弹性曲线） */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width:      mounted ? `${tech.confidence}%` : '0%',
              background: `linear-gradient(90deg, ${glowHex}88, ${glowHex})`,
              boxShadow:  `0 0 7px ${glowHex}`,
              transition: `width 1.15s cubic-bezier(0.22, 1, 0.36, 1) ${barDelay}ms`,
            }}
          />

          {/* 扫光（填满后一次性穿越，通过 animation-delay 控制） */}
          {mounted && (
            <div
              className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12"
              style={{
                background:        'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)',
                animation:         `bar-shimmer .85s ease-out ${shimmerDelay}ms 1 forwards`,
                opacity:            0,
                transform:         'translateX(-160%) skewX(-12deg)',
              }}
            />
          )}
        </div>
      </div>

      {/* Detected-from（hover 展开） */}
      {tech.detectedFrom.length > 0 && (
        <div className="overflow-hidden" style={{ maxHeight: 0, transition: 'max-height .3s ease' }}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.maxHeight = '40px')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.maxHeight = '0px')}
        >
          <p className="mt-1.5 truncate text-[9px] font-mono text-slate-600">
            {tech.detectedFrom[0].split('/').slice(-2).join('/')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function GridCardView({ result, className = '' }: VisualizationProps) {
  const { techStack, architectureHighlights, features, projectName, projectType, complexity } = result
  const cfg = COMPLEXITY[complexity]

  // 全局挂载信号 — 80ms 后触发，让 React 先完成 DOM 渲染
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(false)   // 每次 result 变化先重置为 false
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [result])

  const CARD_LIMIT = 8
  const [showAll, setShowAll] = useState(false)
  const toggleShowAll = useCallback(() => setShowAll(v => !v), [])
  const visibleStack = showAll ? techStack : techStack.slice(0, CARD_LIMIT)
  const overflow = techStack.length - CARD_LIMIT

  return (
    <div className={`w-full space-y-6 ${className}`}>

      {/* ── 头部卡片 ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0c1220] to-slate-900 p-6">

        {/* 环境光晕球 */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-blue-600/12 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {projectType}
            </p>
            <h2 className="text-2xl font-bold text-white">{projectName}</h2>
          </div>
          <div
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            style={{ boxShadow: `0 0 14px ${cfg.hex}22` }}
          >
            <span className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`}
              style={{ boxShadow: `0 0 7px ${cfg.hex}` }} />
            <span className={`text-xs font-semibold ${cfg.tw}`}>{cfg.label}</span>
          </div>
        </div>

        {/* 统计数字行 */}
        <div className="relative mt-5 flex gap-8">
          {[
            { label: '技术', v: techStack.length },
            { label: '架构亮点', v: architectureHighlights.length },
            { label: '核心功能', v: features.length },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white tabular-nums">{s.v}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 类别分布胶囊 */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {(Object.keys(CAT_GLOW) as Array<keyof typeof CAT_GLOW>)
            .filter(cat => techStack.some(t => t.category === cat))
            .map(cat => {
              const p     = CATEGORY_PALETTE[cat]
              const count = techStack.filter(t => t.category === cat).length
              return (
                <div key={cat}
                  className={`flex items-center gap-1.5 rounded-full border ${p.border} ${p.bg} px-2.5 py-1`}>
                  <span className={`text-[10px] font-semibold capitalize ${p.text}`}>{cat}</span>
                  <span className={`text-[9px] tabular-nums opacity-60 ${p.text}`}>{count}</span>
                </div>
              )
            })}
        </div>

        {/* 底部渐变分割线 */}
        <div className="relative mt-5 h-px w-full overflow-hidden rounded-full bg-gradient-to-r from-transparent via-violet-500/35 to-transparent" />
      </div>

      {/* ── 技术栈网格 ───────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            技术栈 · {techStack.length} detected
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleStack.map((tech, i) => (
            <TechCard key={tech.name} tech={tech} index={i} mounted={mounted} />
          ))}
          {!showAll && overflow > 0 && (
            <button
              onClick={toggleShowAll}
              className="card-enter flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/12 bg-white/3 p-4 text-center transition-all hover:border-white/25 hover:bg-white/6"
              style={{ animationDelay: `${CARD_LIMIT * 55}ms` }}
            >
              <span className="text-xl font-bold text-slate-400">+{overflow}</span>
              <span className="text-[10px] text-slate-600">展开全部</span>
            </button>
          )}
          {showAll && overflow > 0 && (
            <button
              onClick={toggleShowAll}
              className="col-span-full mt-1 rounded-xl border border-white/8 bg-white/3 py-2 text-[11px] text-slate-500 transition-all hover:border-white/15 hover:text-slate-300"
            >
              收起
            </button>
          )}
        </div>
      </section>

      {/* ── 架构亮点 ─────────────────────────────────────────────────────────── */}
      {architectureHighlights.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">架构亮点</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {architectureHighlights.slice(0, 4).map((arch, i) => (
              <div key={arch.id}
                className="card-enter group relative overflow-hidden rounded-xl border border-white/6 bg-gradient-to-br from-slate-800/65 to-slate-900/65 p-5 transition-all duration-300 hover:border-white/15 hover:shadow-md"
                style={{ animationDelay: `${i * 70 + 220}ms` }}>

                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-white/6 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {arch.badge}
                  </span>
                  <span className="text-[9px] font-mono capitalize text-slate-600">{arch.pattern}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug text-white">{arch.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{arch.description}</p>
                {arch.relatedPaths[0] && (
                  <p className="mt-2.5 truncate font-mono text-[10px] text-slate-600">
                    · {arch.relatedPaths[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 核心功能 ─────────────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">核心功能</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          </div>
          <div className="space-y-2.5">
            {features.map((feature, i) => (
              <div key={feature.id}
                className="card-enter group flex items-start gap-4 rounded-xl border border-white/6 bg-gradient-to-r from-slate-800/45 to-transparent p-4 transition-all duration-300 hover:border-white/12 hover:from-slate-800/75 hover:shadow-md"
                style={{ animationDelay: `${i * 80 + 370}ms` }}>

                {/* 图标圈 */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl ring-1 ring-white/8 transition-all group-hover:ring-white/18 group-hover:bg-white/8">
                  {feature.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{feature.title}</p>

                    {/* ── 10 个 HSL 重要度指示灯 ── */}
                    <div className="flex items-center gap-[3px]">
                      {Array.from({ length: 10 }).map((_, j) => {
                        const lit = j < feature.importance
                        // 从紫(260°)渐变到橙红(20°) 随重要度降低
                        const hue = 260 - j * 24
                        return (
                          <div
                            key={j}
                            className="h-[5px] w-[5px] rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: lit
                                ? `hsl(${hue}, 82%, 66%)`
                                : 'rgba(255,255,255,0.06)',
                              boxShadow: lit
                                ? `0 0 4px hsl(${hue}, 82%, 66%)`
                                : 'none',
                              transitionDelay: `${j * 40 + i * 80 + 420}ms`,
                              opacity: mounted ? 1 : 0,
                              transform: mounted ? 'scale(1)' : 'scale(0)',
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {feature.description}
                  </p>

                  {feature.relatedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {feature.relatedFiles.slice(0, 3).map(f => (
                        <span key={f}
                          className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-500 transition-colors hover:text-slate-300">
                          {f.split('/').slice(-2).join('/')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 排名徽章 */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-600">#{i + 1}</span>
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: `hsl(${260 - i * 30}, 70%, 20%)`,
                      color:      `hsl(${260 - i * 30}, 85%, 72%)`,
                      border:     `1px solid hsl(${260 - i * 30}, 60%, 35%)`,
                    }}>
                    {feature.importance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
