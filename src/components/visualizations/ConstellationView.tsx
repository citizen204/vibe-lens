'use client'

/**
 * ConstellationView — "深空赛博" 可视化
 *
 * 动画策略（关键）：
 *  - SVG 内的 CSS <style> 仅用于 opacity / stroke-dashoffset（无 transform，避免
 *    SVG 坐标系与 CSS transform-origin 的兼容性问题）
 *  - 所有旋转 / 位移使用 SMIL animateTransform / animate（跨浏览器最可靠）
 *  - 粒子流 使用 <animateMotion path="...">（沿指定路径运动）
 */

import { useMemo, useId } from 'react'
import type { VisualizationProps, TechItem } from '@/types'

// ─── 赛博朋克色板 ──────────────────────────────────────────────────────────────

const CYBER: Record<string, { stroke: string; glow: string; fill: string; pt: string }> = {
  language:   { stroke: '#b44dff', glow: '#7700cc', fill: '#0c0019', pt: '#cc77ff' },
  framework:  { stroke: '#00d4ff', glow: '#0099bb', fill: '#00111a', pt: '#44ddff' },
  ui:         { stroke: '#ff2d78', glow: '#bb0044', fill: '#190007', pt: '#ff6699' },
  database:   { stroke: '#00ffb4', glow: '#00bb80', fill: '#001910', pt: '#44ffcc' },
  tooling:    { stroke: '#ffaa00', glow: '#bb7700', fill: '#191100', pt: '#ffcc44' },
  deployment: { stroke: '#00aaff', glow: '#0077bb', fill: '#00111a', pt: '#44bbff' },
  testing:    { stroke: '#ff6677', glow: '#bb2233', fill: '#190005', pt: '#ff8899' },
  state:      { stroke: '#ff7700', glow: '#bb4400', fill: '#190900', pt: '#ff9944' },
}
const FB = CYBER.framework // fallback

// ─── 布局常量 ─────────────────────────────────────────────────────────────────

const W = 600, H = 600, CX = 300, CY = 300
const R1 = 138, R2 = 228        // inner / outer ring radii
const RADAR_ANGLE_DEG = 22      // radar sweep sector width

// ─── 确定性伪随机 (LCG) ───────────────────────────────────────────────────────

function lcg(seed: number) {
  let s = seed
  return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0xffffffff }
}

// ─── 55 颗星（编译时生成，不在每次渲染重算）─────────────────────────────────

const STARS = (() => {
  const rng = lcg(0x7f3a)
  return Array.from({ length: 55 }, (_, i) => ({
    x:     Math.round(rng() * W * 10) / 10,
    y:     Math.round(rng() * H * 10) / 10,
    r:     0.35 + rng() * 1.3,
    base:  0.12 + rng() * 0.55,
    cls:   ['tw-a', 'tw-b', 'tw-c'][i % 3] as string,
    delay: `${(rng() * 3.5).toFixed(2)}s`,
  }))
})()

// ─── 节点布局算法 ─────────────────────────────────────────────────────────────

interface NodeLayout { tech: TechItem; x: number; y: number; ring: number }

function layoutNodes(stack: TechItem[]): NodeLayout[] {
  const top = stack.slice(0, 10)
  return top.map((tech, i) => {
    if (i === 0) return { tech, x: CX, y: CY, ring: 0 }
    const inner   = i <= 4
    const ring    = inner ? 1 : 2
    const radius  = inner ? R1 : R2
    const count   = inner ? Math.min(top.length - 1, 4) : top.length - 5
    const offset  = inner ? 1 : 5
    const angle   = ((i - offset) / count) * Math.PI * 2 - Math.PI / 2
    return { tech, x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius, ring }
  })
}

// ─── SVG <style>（仅安全属性：opacity + stroke-dashoffset）────────────────────

const SVG_CSS = `
  /* ── Star twinkle: 3 speed groups ─ */
  @keyframes tw-a { 0%,100%{opacity:.48} 50%{opacity:.03} }
  @keyframes tw-b { 0%,100%{opacity:.30} 50%{opacity:.03} }
  @keyframes tw-c { 0%,100%{opacity:.68} 50%{opacity:.07} }
  .tw-a { animation: tw-a 3.2s ease-in-out infinite; }
  .tw-b { animation: tw-b 2.1s ease-in-out infinite; }
  .tw-c { animation: tw-c 1.7s ease-in-out infinite; }

  /* ── Dash-flow on connection lines ─ */
  @keyframes df { to { stroke-dashoffset: -28; } }
  .dl  { stroke-dasharray:8 6; animation: df 2s   linear infinite; }
  .dls { stroke-dasharray:6 8; animation: df 3.2s linear infinite; }
`

// ─── 辅助：雷达扇形路径 ───────────────────────────────────────────────────────

function radarPath(r: number, angleDeg: number): string {
  const a = (angleDeg * Math.PI) / 180
  const ex = CX + r * Math.sin(a)
  const ey = CY - r * Math.cos(a)
  return `M ${CX} ${CY} L ${CX} ${CY - r} A ${r} ${r} 0 0 1 ${ex} ${ey} Z`
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function ConstellationView({ result, className = '' }: VisualizationProps) {
  const { techStack, projectName, projectType, features } = result
  const uid   = useId().replace(/:/g, 'u')
  const nodes = useMemo(() => layoutNodes(techStack), [techStack])

  const gf = (cat: string) => `url(#${uid}-g-${cat})`   // node glow filter ref
  const pf  = `url(#${uid}-gp)`                           // particle glow filter ref

  return (
    <div className={`w-full space-y-4 ${className}`}>

      {/* ── Canvas wrapper ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ border: '1px solid rgba(0,212,255,.14)', background: '#00000e' }}
      >
        {/* ── HUD Corner brackets ──────────────────────────────────────────── */}
        {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
          <svg key={i} className={`pointer-events-none absolute ${pos} h-5 w-5 opacity-50`} viewBox="0 0 20 20" fill="none">
            <path d="M2 12 L2 2 L12 2" stroke="#00d4ff" strokeWidth="1.2" />
          </svg>
        ))}

        {/* ── SVG canvas ───────────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full max-w-[600px] mx-auto"
          aria-label="技术星座图"
          style={{ background: `radial-gradient(ellipse 72% 68% at 50% 50%, #01061e 0%, #00000e 100%)` }}
        >
          <defs>
            {/* CSS 动画（仅 opacity + stroke-dashoffset，安全的 SVG CSS 属性） */}
            <style>{SVG_CSS}</style>

            {/* 每类别发光滤镜（双层模糊叠加源图） */}
            {Object.entries(CYBER).map(([cat, c]) => (
              <filter key={cat} id={`${uid}-g-${cat}`} x="-55%" y="-55%" width="210%" height="210%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2" />
                <feMerge>
                  <feMergeNode in="b1" />
                  <feMergeNode in="b2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* 粒子紧密发光滤镜 */}
            <filter id={`${uid}-gp`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* 中心节点大光晕 */}
            <filter id={`${uid}-gc`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
              <feMerge>
                <feMergeNode in="b" /><feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 中心节点径向渐变 */}
            <radialGradient id={`${uid}-cg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#5500cc" stopOpacity=".95" />
              <stop offset="55%"  stopColor="#001244" stopOpacity="1" />
              <stop offset="100%" stopColor="#000820" stopOpacity="1" />
            </radialGradient>

            {/* 雷达扇形渐变（从中心向外衰减） */}
            <radialGradient id={`${uid}-rg`} cx="0%" cy="100%" r="100%">
              <stop offset="0%"  stopColor="#00d4ff" stopOpacity=".4" />
              <stop offset="55%" stopColor="#00d4ff" stopOpacity=".1" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </radialGradient>

            {/* 扫描线渐变（中心强，两端淡） */}
            <linearGradient id={`${uid}-sg`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0" />
              <stop offset="18%"  stopColor="#00d4ff" stopOpacity=".7" />
              <stop offset="50%"  stopColor="#00d4ff" stopOpacity="1" />
              <stop offset="82%"  stopColor="#00d4ff" stopOpacity=".7" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>

            {/* 点阵网格 pattern */}
            <pattern id={`${uid}-dot`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="0.7" fill="#002244" opacity=".55" />
            </pattern>
          </defs>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 0 — Background                                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* 点阵网格 */}
          <rect width={W} height={H} fill={`url(#${uid}-dot)`} />

          {/* 星云光晕：紫、蓝、绿 */}
          {[
            { cx: '0%',  cy: '0%',   r: '55%', c: '#220055', o: .16 },
            { cx: '100%', cy: '100%', r: '50%', c: '#003366', o: .14 },
            { cx: '85%', cy: '8%',   r: '42%', c: '#004422', o: .11 },
          ].map((n, i) => (
            <ellipse
              key={i}
              cx={n.cx === '0%' ? 0 : n.cx === '85%' ? W * .85 : W}
              cy={n.cy === '0%' ? 0 : n.cy === '8%'  ? H * .08  : H}
              rx={W * .5} ry={H * .45}
              fill={n.c} opacity={n.o}
            />
          ))}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 1 — Star field (55 stars, 3 CSS twinkle groups)         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <g>
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.x} cy={s.y} r={s.r}
                fill="white"
                className={s.cls}
                style={{ animationDelay: s.delay, opacity: s.base }}
              />
            ))}
          </g>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 2 — Scan line (SMIL: y + opacity)                       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <rect x="0" y="-3" width={W} height="3" fill={`url(#${uid}-sg)`} opacity="0">
            <animate attributeName="y"       values="-3;603"   dur="7s" begin="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;.03;.5;.95;1" dur="7s" begin="1.8s" repeatCount="indefinite" />
          </rect>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 3 — Orbit rings (SMIL animateTransform, correct!)       */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* 静态参考环（不旋转）*/}
          <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#001133" strokeWidth=".5" />
          <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#001133" strokeWidth=".5" />

          {/* 轨道环 1 — 顺时针虚线旋转 */}
          <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#00d4ff" strokeOpacity=".15" strokeWidth="1" strokeDasharray="5 9">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
              dur="28s" repeatCount="indefinite" />
          </circle>

          {/* 轨道环 2 — 逆时针虚线旋转 */}
          <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#0051ff" strokeOpacity=".09" strokeWidth="1" strokeDasharray="3 13">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`}
              dur="18s" repeatCount="indefinite" />
          </circle>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 4 — Radar sweep (SMIL animateTransform)                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <path d={radarPath(R2, RADAR_ANGLE_DEG)} fill={`url(#${uid}-rg)`}>
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
              dur="5s" repeatCount="indefinite" />
          </path>

          {/* 雷达扫描留余辉（更窄的半透明扇形，稍滞后） */}
          <path d={radarPath(R2, 8)} fill="#00d4ff" opacity=".06">
            <animateTransform attributeName="transform" type="rotate"
              from={`${-RADAR_ANGLE_DEG} ${CX} ${CY}`}
              to={`${360 - RADAR_ANGLE_DEG} ${CX} ${CY}`}
              dur="5s" repeatCount="indefinite" />
          </path>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 5 — Connections + flowing particles                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {nodes.slice(1).map((node, idx) => {
            const c    = CYBER[node.tech.category] ?? FB
            const path = `M ${CX} ${CY} L ${node.x.toFixed(1)} ${node.y.toFixed(1)}`
            const dur1 = `${(1.55 + idx * 0.14).toFixed(2)}s`
            const half = `${((1.55 + idx * 0.14) / 2).toFixed(2)}s`

            return (
              <g key={`conn-${node.tech.name}`}>
                {/* 静态底线 */}
                <line x1={CX} y1={CY} x2={node.x} y2={node.y}
                  stroke={c.stroke} strokeOpacity=".06" strokeWidth="1" />

                {/* 流动动画线（CSS dash-flow） */}
                <line x1={CX} y1={CY} x2={node.x} y2={node.y}
                  stroke={c.stroke} strokeOpacity=".55" strokeWidth="1.1"
                  className="dl"
                  style={{ animationDuration: dur1, animationDelay: `${(idx * 0.16).toFixed(2)}s` }} />

                {/* 粒子 1 */}
                <circle r="2.5" fill={c.pt} filter={pf}>
                  <animateMotion dur={dur1} begin={`${(idx * 0.16).toFixed(2)}s`}
                    repeatCount="indefinite" path={path} />
                </circle>

                {/* 粒子 2（相位偏移半周期） */}
                <circle r="1.6" fill={c.pt} opacity=".6" filter={pf}>
                  <animateMotion dur={dur1} begin={`-${half}`}
                    repeatCount="indefinite" path={path} />
                </circle>
              </g>
            )
          })}

          {/* 内环节点之间的交叉连线（极淡） */}
          {nodes.slice(1, 5).map((a, ai) =>
            nodes.slice(ai + 2, 5).map(b => (
              <line key={`x-${a.tech.name}-${b.tech.name}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#00d4ff" strokeOpacity=".04" strokeWidth=".6" strokeDasharray="2 9" />
            ))
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 6 — Nodes                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {nodes.map((node, i) => {
            const c        = CYBER[node.tech.category] ?? FB
            const isCenter = i === 0
            const r        = isCenter ? 50 : node.ring === 1 ? 36 : 27
            const nx       = node.x, ny = node.y

            return (
              <g key={node.tech.name} filter={isCenter ? `url(#${uid}-gc)` : gf(node.tech.category)}>

                {/* ── 节点入场动画（SMIL opacity） */}
                <animate attributeName="opacity"
                  from="0" to="1" dur=".5s"
                  begin={`${(i * 0.08).toFixed(2)}s`} fill="freeze" />

                {/* ── 普通节点：2 圈外扩脉冲环 */}
                {!isCenter && [0, 1].map(pi => (
                  <circle key={pi} cx={nx} cy={ny} r={r} fill="none" stroke={c.stroke} strokeWidth="1.5" opacity="0">
                    <animate attributeName="r"
                      values={`${r};${r + 30};${r + 30}`}
                      dur="2.6s" begin={`${(i * 0.22 + pi * 1.3).toFixed(2)}s`}
                      repeatCount="indefinite"
                      calcMode="spline" keySplines=".4 0 .6 1; 0 0 1 1" />
                    <animate attributeName="opacity"
                      values="0.75;0;0"
                      dur="2.6s" begin={`${(i * 0.22 + pi * 1.3).toFixed(2)}s`}
                      repeatCount="indefinite"
                      calcMode="spline" keySplines=".15 0 1 1; 0 0 1 1" />
                  </circle>
                ))}

                {/* ── 中心节点：双旋转外环 + 3 圈脉冲 */}
                {isCenter && (
                  <>
                    {/* 外环 1 — 顺时针慢转 */}
                    <circle cx={CX} cy={CY} r={r + 19} fill="none"
                      stroke="#b44dff" strokeOpacity=".55" strokeWidth="1" strokeDasharray="6 4">
                      <animateTransform attributeName="transform" type="rotate"
                        from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="9s" repeatCount="indefinite" />
                    </circle>
                    {/* 外环 2 — 逆时针中速转 */}
                    <circle cx={CX} cy={CY} r={r + 11} fill="none"
                      stroke="#00d4ff" strokeOpacity=".3" strokeWidth="1" strokeDasharray="3 8">
                      <animateTransform attributeName="transform" type="rotate"
                        from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="14s" repeatCount="indefinite" />
                    </circle>
                    {/* 3 圈错开脉冲 */}
                    {[0, 1, 2].map(pi => (
                      <circle key={pi} cx={CX} cy={CY} r={r} fill="none" stroke="#b44dff" strokeWidth="2" opacity="0">
                        <animate attributeName="r"
                          values={`${r};${r + 56};${r + 56}`}
                          dur="3.2s" begin={`${pi * 1.07}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity"
                          values=".65;0;0" dur="3.2s" begin={`${pi * 1.07}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                  </>
                )}

                {/* 节点本体 */}
                <circle cx={nx} cy={ny} r={r}
                  fill={isCenter ? `url(#${uid}-cg)` : c.fill}
                  stroke={c.stroke} strokeWidth={isCenter ? 2 : 1.5} />

                {/* emoji 图标 */}
                <text x={nx} y={ny - (isCenter ? 8 : 5)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isCenter ? 24 : node.ring === 1 ? 17 : 13}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {node.tech.icon}
                </text>

                {/* 技术名称 */}
                <text x={nx} y={ny + (isCenter ? 16 : 12)}
                  textAnchor="middle"
                  fontSize={isCenter ? 8.5 : 7.5}
                  fill={c.stroke}
                  fontFamily="'SF Mono','Fira Code',monospace"
                  fontWeight="700"
                  letterSpacing=".5">
                  {node.tech.name.length > 10 ? `${node.tech.name.slice(0, 9)}…` : node.tech.name}
                </text>

                {/* 置信度小标（内环节点） */}
                {!isCenter && node.ring === 1 && (
                  <text x={nx + r} y={ny - r + 4}
                    textAnchor="end" fontSize="6"
                    fill={c.pt} fontFamily="monospace" fontWeight="700" opacity=".8">
                    {node.tech.confidence}
                  </text>
                )}

                <title>{node.tech.name} · {node.tech.category} · {node.tech.confidence}%</title>
              </g>
            )
          })}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* Layer 7 — HUD overlay                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* 信号格（右上） */}
          <g opacity=".45">
            {[.3, .5, .75, 1].map((h, i) => (
              <rect key={i}
                x={W - 16 - (3 - i) * 7} y={10 - h * 10}
                width="5" height={h * 10} rx="0.8"
                fill="#00d4ff" />
            ))}
          </g>

          {/* 项目标识（左上） */}
          <text x="14" y="19" fontSize="9" fill="#00d4ff" opacity=".45" fontFamily="monospace">
            {projectName}
          </text>
          <text x="14" y="30" fontSize="7.5" fill="#00d4ff" opacity=".25" fontFamily="monospace">
            {projectType}
          </text>

          {/* 扫描状态（左下） */}
          <text x="14" y={H - 22} fontSize="7" fill="#00d4ff" opacity=".35" fontFamily="monospace">
            ◉ SCANNING · {nodes.length} NODES DETECTED
          </text>

          {/* 底部细分隔线 */}
          <line x1="14" y1={H - 14} x2={W - 14} y2={H - 14}
            stroke="#00d4ff" strokeOpacity=".08" strokeWidth=".5" />
          <text x={W / 2} y={H - 5} textAnchor="middle"
            fontSize="7" fill="#002244" fontFamily="monospace">
            VIBE · LENS · CONSTELLATION
          </text>
        </svg>
      </div>

      {/* ── 图例 ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {Object.entries(CYBER)
          .filter(([cat]) => techStack.some(t => t.category === cat))
          .map(([cat, c]) => (
            <div key={cat}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: `${c.stroke}08`, border: `1px solid ${c.stroke}20` }}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.stroke, boxShadow: `0 0 6px ${c.glow}` }} />
              <span className="text-xs capitalize" style={{ color: `${c.stroke}cc` }}>{cat}</span>
            </div>
          ))}
      </div>

      {/* ── 功能标签 ─────────────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {features.map(f => (
            <div key={f.id}
              className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ background: '#00d4ff0c', border: '1px solid #00d4ff20' }}>
              <span className="text-sm">{f.icon}</span>
              <span className="text-xs font-medium" style={{ color: '#00d4ffbb' }}>{f.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
