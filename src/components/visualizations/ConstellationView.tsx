'use client'

import { useMemo, useId, useRef, useCallback, useState } from 'react'
import type { VisualizationProps, TechItem } from '@/types'

// ─── PNG 导出工具 ─────────────────────────────────────────────────────────────

async function exportSvgAsPng(svgEl: SVGSVGElement, filename: string): Promise<void> {
  const vb = svgEl.viewBox.baseVal
  const scale = 2
  const w = (vb.width  || 600) * scale
  const h = (vb.height || 600) * scale
  const serializer = new XMLSerializer()
  const svgBlob = new Blob([serializer.serializeToString(svgEl)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  img.src = url
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject })
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  const link = document.createElement('a')
  link.download = filename; link.href = canvas.toDataURL('image/png'); link.click()
}

// ─── 色板 ─────────────────────────────────────────────────────────────────────

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

// 极简/轨道风格用更柔和的颜色
const SOFT: Record<string, { stroke: string; text: string; bg: string }> = {
  language:   { stroke: '#9b6dff', text: '#c4a0ff', bg: '#1a0f2e' },
  framework:  { stroke: '#38bdf8', text: '#7dd3fc', bg: '#0c1f2d' },
  ui:         { stroke: '#f472b6', text: '#f9a8d4', bg: '#2d0f1d' },
  database:   { stroke: '#34d399', text: '#6ee7b7', bg: '#0d2922' },
  tooling:    { stroke: '#fbbf24', text: '#fcd34d', bg: '#2d1f0a' },
  deployment: { stroke: '#60a5fa', text: '#93c5fd', bg: '#0f1e33' },
  testing:    { stroke: '#fb7185', text: '#fda4af', bg: '#2d0f14' },
  state:      { stroke: '#fb923c', text: '#fdba74', bg: '#2d1508' },
}

const FB_CYBER = CYBER.framework
const FB_SOFT  = SOFT.framework

// ─── 布局 ─────────────────────────────────────────────────────────────────────

const W = 600, H = 600, CX = 300, CY = 300
const R1 = 138, R2 = 228
const RADAR_ANGLE_DEG = 22

interface NodeLayout { tech: TechItem; x: number; y: number; ring: number }

function layoutNodes(stack: TechItem[]): NodeLayout[] {
  const top = stack.slice(0, 10)
  return top.map((tech, i) => {
    if (i === 0) return { tech, x: CX, y: CY, ring: 0 }
    const inner  = i <= 4
    const ring   = inner ? 1 : 2
    const radius = inner ? R1 : R2
    const count  = inner ? Math.min(top.length - 1, 4) : top.length - 5
    const offset = inner ? 1 : 5
    const angle  = ((i - offset) / count) * Math.PI * 2 - Math.PI / 2
    return { tech, x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius, ring }
  })
}

// ─── LCG 确定性伪随机 ─────────────────────────────────────────────────────────

function lcg(seed: number) {
  let s = seed
  return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0xffffffff }
}

const STARS_CYBER = (() => {
  const rng = lcg(0x7f3a)
  return Array.from({ length: 55 }, (_, i) => ({
    x: Math.round(rng() * W * 10) / 10, y: Math.round(rng() * H * 10) / 10,
    r: 0.35 + rng() * 1.3, base: 0.12 + rng() * 0.55,
    cls: ['tw-a', 'tw-b', 'tw-c'][i % 3] as string,
    delay: `${(rng() * 3.5).toFixed(2)}s`,
  }))
})()

const STARS_ORBITAL = (() => {
  const rng = lcg(0xab12)
  return Array.from({ length: 22 }, () => ({
    x: Math.round(rng() * W * 10) / 10, y: Math.round(rng() * H * 10) / 10,
    r: 0.4 + rng() * 1.1, opacity: 0.08 + rng() * 0.22,
  }))
})()

// ─── 辅助 ─────────────────────────────────────────────────────────────────────

function radarPath(r: number, angleDeg: number): string {
  const a = (angleDeg * Math.PI) / 180
  return `M ${CX} ${CY} L ${CX} ${CY - r} A ${r} ${r} 0 0 1 ${CX + r * Math.sin(a)} ${CY - r * Math.cos(a)} Z`
}

// ─── 风格类型 ─────────────────────────────────────────────────────────────────

type StarStyle = 'cyber' | 'minimal' | 'orbital'

const STYLE_OPTIONS: Array<{ id: StarStyle; label: string; desc: string }> = [
  { id: 'cyber',   label: '赛博',  desc: '深空扫描风' },
  { id: 'minimal', label: '极简',  desc: '轻量线图风' },
  { id: 'orbital', label: '轨道',  desc: '行星轨道风' },
]

// ═════════════════════════════════════════════════════════════════════════════
// STYLE 1 — CYBER（原始风格）
// ═════════════════════════════════════════════════════════════════════════════

const CYBER_CSS = `
  @keyframes tw-a { 0%,100%{opacity:.48} 50%{opacity:.03} }
  @keyframes tw-b { 0%,100%{opacity:.30} 50%{opacity:.03} }
  @keyframes tw-c { 0%,100%{opacity:.68} 50%{opacity:.07} }
  .tw-a { animation: tw-a 3.2s ease-in-out infinite; }
  .tw-b { animation: tw-b 2.1s ease-in-out infinite; }
  .tw-c { animation: tw-c 1.7s ease-in-out infinite; }
  @keyframes df { to { stroke-dashoffset: -28; } }
  .dl  { stroke-dasharray:8 6; animation: df 2s   linear infinite; }
  .dls { stroke-dasharray:6 8; animation: df 3.2s linear infinite; }
`

function CyberCanvas({ nodes, uid, projectName, projectType }: {
  nodes: NodeLayout[]; uid: string; projectName: string; projectType: string
}) {
  const gf = (cat: string) => `url(#${uid}-g-${cat})`
  const pf  = `url(#${uid}-gp)`
  return (
    <svg ref={undefined} viewBox={`0 0 ${W} ${H}`}
      className="block w-full max-w-[600px] mx-auto"
      aria-label="技术星座图（赛博风格）"
      style={{ background: 'radial-gradient(ellipse 72% 68% at 50% 50%, #01061e 0%, #00000e 100%)' }}
    >
      <defs>
        <style>{CYBER_CSS}</style>
        {Object.entries(CYBER).map(([cat]) => (
          <filter key={cat} id={`${uid}-g-${cat}`} x="-55%" y="-55%" width="210%" height="210%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2" />
            <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <filter id={`${uid}-gp`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}-gc`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={`${uid}-cg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#5500cc" stopOpacity=".95" />
          <stop offset="55%"  stopColor="#001244" stopOpacity="1" />
          <stop offset="100%" stopColor="#000820" stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`${uid}-rg`} cx="0%" cy="100%" r="100%">
          <stop offset="0%"   stopColor="#00d4ff" stopOpacity=".4" />
          <stop offset="55%"  stopColor="#00d4ff" stopOpacity=".1" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-sg`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="18%"  stopColor="#00d4ff" stopOpacity=".7" />
          <stop offset="50%"  stopColor="#00d4ff" stopOpacity="1" />
          <stop offset="82%"  stopColor="#00d4ff" stopOpacity=".7" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${uid}-dot`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.7" fill="#002244" opacity=".55" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill={`url(#${uid}-dot)`} />
      {[
        { cx: 0,       cy: 0,      c: '#220055', o: .16 },
        { cx: W,       cy: H,      c: '#003366', o: .14 },
        { cx: W * .85, cy: H * .08, c: '#004422', o: .11 },
      ].map((n, i) => (
        <ellipse key={i} cx={n.cx} cy={n.cy} rx={W * .5} ry={H * .45} fill={n.c} opacity={n.o} />
      ))}
      <g>
        {STARS_CYBER.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white"
            className={s.cls} style={{ animationDelay: s.delay, opacity: s.base }} />
        ))}
      </g>
      <rect x="0" y="-3" width={W} height="3" fill={`url(#${uid}-sg)`} opacity="0">
        <animate attributeName="y"       values="-3;603"    dur="7s" begin="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;.03;.5;.95;1" dur="7s" begin="1.8s" repeatCount="indefinite" />
      </rect>
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#001133" strokeWidth=".5" />
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#001133" strokeWidth=".5" />
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#00d4ff" strokeOpacity=".15" strokeWidth="1" strokeDasharray="5 9">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="28s" repeatCount="indefinite" />
      </circle>
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#0051ff" strokeOpacity=".09" strokeWidth="1" strokeDasharray="3 13">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="18s" repeatCount="indefinite" />
      </circle>
      <path d={radarPath(R2, RADAR_ANGLE_DEG)} fill={`url(#${uid}-rg)`}>
        <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="5s" repeatCount="indefinite" />
      </path>
      <path d={radarPath(R2, 8)} fill="#00d4ff" opacity=".06">
        <animateTransform attributeName="transform" type="rotate" from={`${-RADAR_ANGLE_DEG} ${CX} ${CY}`} to={`${360 - RADAR_ANGLE_DEG} ${CX} ${CY}`} dur="5s" repeatCount="indefinite" />
      </path>
      {nodes.slice(1).map((node, idx) => {
        const c    = CYBER[node.tech.category] ?? FB_CYBER
        const path = `M ${CX} ${CY} L ${node.x.toFixed(1)} ${node.y.toFixed(1)}`
        const dur1 = `${(1.55 + idx * 0.14).toFixed(2)}s`
        const half = `${((1.55 + idx * 0.14) / 2).toFixed(2)}s`
        return (
          <g key={`conn-${node.tech.name}`}>
            <line x1={CX} y1={CY} x2={node.x} y2={node.y} stroke={c.stroke} strokeOpacity=".06" strokeWidth="1" />
            <line x1={CX} y1={CY} x2={node.x} y2={node.y} stroke={c.stroke} strokeOpacity=".55" strokeWidth="1.1" className="dl" style={{ animationDuration: dur1, animationDelay: `${(idx * 0.16).toFixed(2)}s` }} />
            <circle r="2.5" fill={c.pt} filter={pf}><animateMotion dur={dur1} begin={`${(idx * 0.16).toFixed(2)}s`} repeatCount="indefinite" path={path} /></circle>
            <circle r="1.6" fill={c.pt} opacity=".6" filter={pf}><animateMotion dur={dur1} begin={`-${half}`} repeatCount="indefinite" path={path} /></circle>
          </g>
        )
      })}
      {nodes.slice(1, 5).map((a, ai) =>
        nodes.slice(ai + 2, 5).map(b => (
          <line key={`x-${a.tech.name}-${b.tech.name}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#00d4ff" strokeOpacity=".04" strokeWidth=".6" strokeDasharray="2 9" />
        ))
      )}
      {nodes.map((node, i) => {
        const c = CYBER[node.tech.category] ?? FB_CYBER
        const isCenter = i === 0
        const r = isCenter ? 50 : node.ring === 1 ? 36 : 27
        const nx = node.x, ny = node.y
        return (
          <g key={node.tech.name} filter={isCenter ? `url(#${uid}-gc)` : gf(node.tech.category)}>
            <animate attributeName="opacity" from="0" to="1" dur=".5s" begin={`${(i * 0.08).toFixed(2)}s`} fill="freeze" />
            {!isCenter && [0, 1].map(pi => (
              <circle key={pi} cx={nx} cy={ny} r={r} fill="none" stroke={c.stroke} strokeWidth="1.5" opacity="0">
                <animate attributeName="r" values={`${r};${r + 30};${r + 30}`} dur="2.6s" begin={`${(i * 0.22 + pi * 1.3).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1; 0 0 1 1" />
                <animate attributeName="opacity" values="0.75;0;0" dur="2.6s" begin={`${(i * 0.22 + pi * 1.3).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keySplines=".15 0 1 1; 0 0 1 1" />
              </circle>
            ))}
            {isCenter && <>
              <circle cx={CX} cy={CY} r={r + 19} fill="none" stroke="#b44dff" strokeOpacity=".55" strokeWidth="1" strokeDasharray="6 4">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="9s" repeatCount="indefinite" />
              </circle>
              <circle cx={CX} cy={CY} r={r + 11} fill="none" stroke="#00d4ff" strokeOpacity=".3" strokeWidth="1" strokeDasharray="3 8">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="14s" repeatCount="indefinite" />
              </circle>
              {[0, 1, 2].map(pi => (
                <circle key={pi} cx={CX} cy={CY} r={r} fill="none" stroke="#b44dff" strokeWidth="2" opacity="0">
                  <animate attributeName="r" values={`${r};${r + 56};${r + 56}`} dur="3.2s" begin={`${pi * 1.07}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values=".65;0;0" dur="3.2s" begin={`${pi * 1.07}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </>}
            <circle cx={nx} cy={ny} r={r} fill={isCenter ? `url(#${uid}-cg)` : c.fill} stroke={c.stroke} strokeWidth={isCenter ? 2 : 1.5} />
            <text x={nx} y={ny - (isCenter ? 8 : 5)} textAnchor="middle" dominantBaseline="middle" fontSize={isCenter ? 24 : node.ring === 1 ? 17 : 13} style={{ userSelect: 'none', pointerEvents: 'none' }}>{node.tech.icon}</text>
            <text x={nx} y={ny + (isCenter ? 16 : 12)} textAnchor="middle" fontSize={isCenter ? 8.5 : 7.5} fill={c.stroke} fontFamily="'SF Mono','Fira Code',monospace" fontWeight="700" letterSpacing=".5">{node.tech.name.length > 10 ? `${node.tech.name.slice(0, 9)}…` : node.tech.name}</text>
            {!isCenter && node.ring === 1 && (
              <text x={nx + r} y={ny - r + 4} textAnchor="end" fontSize="6" fill={c.pt} fontFamily="monospace" fontWeight="700" opacity=".8">{node.tech.confidence}</text>
            )}
            <title>{node.tech.name} · {node.tech.category} · {node.tech.confidence}%</title>
          </g>
        )
      })}
      <g opacity=".45">
        {[.3, .5, .75, 1].map((h, i) => (
          <rect key={i} x={W - 16 - (3 - i) * 7} y={10 - h * 10} width="5" height={h * 10} rx="0.8" fill="#00d4ff" />
        ))}
      </g>
      <text x="14" y="19" fontSize="9" fill="#00d4ff" opacity=".45" fontFamily="monospace">{projectName}</text>
      <text x="14" y="30" fontSize="7.5" fill="#00d4ff" opacity=".25" fontFamily="monospace">{projectType}</text>
      <text x="14" y={H - 22} fontSize="7" fill="#00d4ff" opacity=".35" fontFamily="monospace">◉ SCANNING · {nodes.length} NODES DETECTED</text>
      <line x1="14" y1={H - 14} x2={W - 14} y2={H - 14} stroke="#00d4ff" strokeOpacity=".08" strokeWidth=".5" />
      <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="7" fill="#002244" fontFamily="monospace">VIBE · LENS · CONSTELLATION</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLE 2 — MINIMAL（极简线图）
// 纯黑底、细连线、无扫描无粒子、节点仅一个柔和入场动画
// ═════════════════════════════════════════════════════════════════════════════

const MINIMAL_CSS = `
  @keyframes m-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
  @keyframes m-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
  .m-node { animation: m-in .45s ease-out both; transform-box: fill-box; transform-origin: center; }
  .m-center-glow { animation: m-breathe 4s ease-in-out infinite; }
`

function MinimalCanvas({ nodes, uid, projectName, projectType }: {
  nodes: NodeLayout[]; uid: string; projectName: string; projectType: string
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      className="block w-full max-w-[600px] mx-auto"
      aria-label="技术星座图（极简风格）"
      style={{ background: '#06060f' }}
    >
      <defs>
        <style>{MINIMAL_CSS}</style>
        {/* 点阵网格 */}
        <pattern id={`${uid}-md`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.5" fill="white" opacity=".04" />
        </pattern>
        {/* 中心柔光 */}
        <filter id={`${uid}-mc`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* 节点柔光 */}
        <filter id={`${uid}-mn`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* 中心渐变 */}
        <radialGradient id={`${uid}-mg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1e1040" />
          <stop offset="100%" stopColor="#0a0818" />
        </radialGradient>
      </defs>

      {/* 背景点阵 */}
      <rect width={W} height={H} fill={`url(#${uid}-md)`} />

      {/* 轨道圈 */}
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke="white" strokeOpacity=".07" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke="white" strokeOpacity=".05" strokeWidth="1" />
      {/* 中心圆参考 */}
      <circle cx={CX} cy={CY} r={52} fill="none" stroke="white" strokeOpacity=".05" strokeWidth="1" />

      {/* 连接线 */}
      {nodes.slice(1).map((node, i) => {
        const c = SOFT[node.tech.category] ?? FB_SOFT
        return (
          <line key={`ml-${node.tech.name}`}
            x1={CX} y1={CY} x2={node.x} y2={node.y}
            stroke={c.stroke} strokeOpacity=".18" strokeWidth="1"
            style={{ animationDelay: `${i * 0.06}s` }}
          />
        )
      })}

      {/* 内环节点之间的辅助连线 */}
      {nodes.slice(1, 5).map((a, ai) =>
        nodes.slice(ai + 2, 5).map(b => (
          <line key={`mx-${a.tech.name}-${b.tech.name}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="white" strokeOpacity=".04" strokeWidth=".5" />
        ))
      )}

      {/* 节点 */}
      {nodes.map((node, i) => {
        const c = SOFT[node.tech.category] ?? FB_SOFT
        const isCenter = i === 0
        const r = isCenter ? 44 : node.ring === 1 ? 30 : 22
        const nx = node.x, ny = node.y

        return (
          <g key={`mn-${node.tech.name}`}
            className="m-node"
            style={{ animationDelay: `${i * 0.07}s` }}
            filter={isCenter ? `url(#${uid}-mc)` : `url(#${uid}-mn)`}
          >
            {/* 中心节点的呼吸光晕 */}
            {isCenter && (
              <circle cx={CX} cy={CY} r={r + 14} fill="none"
                stroke={c.stroke} strokeOpacity=".12" strokeWidth="1"
                className="m-center-glow" />
            )}

            {/* 节点主体 */}
            <circle cx={nx} cy={ny} r={r}
              fill={isCenter ? `url(#${uid}-mg)` : c.bg}
              stroke={c.stroke}
              strokeWidth={isCenter ? 1.5 : 1}
              strokeOpacity={isCenter ? 0.6 : 0.45}
            />

            {/* 图标 */}
            <text x={nx} y={ny - (isCenter ? 6 : 3)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isCenter ? 20 : node.ring === 1 ? 14 : 11}
              style={{ userSelect: 'none', pointerEvents: 'none' }}>
              {node.tech.icon}
            </text>

            {/* 技术名 */}
            <text x={nx} y={ny + (isCenter ? 14 : 10)}
              textAnchor="middle" fontSize={isCenter ? 7.5 : 6.5}
              fill={c.text} fontFamily="'SF Mono','Fira Code',monospace"
              fontWeight="600" letterSpacing=".3" opacity=".85">
              {node.tech.name.length > 11 ? `${node.tech.name.slice(0, 10)}…` : node.tech.name}
            </text>

            {/* 置信度 */}
            {!isCenter && (
              <text x={nx} y={ny + (node.ring === 1 ? 20 : 16)}
                textAnchor="middle" fontSize="5.5"
                fill={c.stroke} fontFamily="monospace" opacity=".5">
                {node.tech.confidence}%
              </text>
            )}

            <title>{node.tech.name} · {node.tech.category} · {node.tech.confidence}%</title>
          </g>
        )
      })}

      {/* 项目标识 */}
      <text x={W / 2} y="18" textAnchor="middle" fontSize="9"
        fill="white" opacity=".2" fontFamily="monospace" letterSpacing="2">
        {projectName.toUpperCase()}
      </text>
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="7"
        fill="white" opacity=".1" fontFamily="monospace">
        {projectType} · {nodes.length} techs detected
      </text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLE 3 — ORBITAL（行星轨道）
// 深蓝底、疏星、可见轨道环缓慢旋转标记点、节点圆圈带分类色环
// ═════════════════════════════════════════════════════════════════════════════

const ORBITAL_CSS = `
  @keyframes o-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes o-pulse { 0%,100% { r: 46; opacity: .15; } 50% { r: 58; opacity: 0; } }
  .o-node { animation: o-in .6s ease both; }
`

function OrbitalCanvas({ nodes, uid, projectName, projectType }: {
  nodes: NodeLayout[]; uid: string; projectName: string; projectType: string
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      className="block w-full max-w-[600px] mx-auto"
      aria-label="技术星座图（轨道风格）"
      style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 48%, #080f24 0%, #020812 100%)' }}
    >
      <defs>
        <style>{ORBITAL_CSS}</style>
        {/* 节点发光 */}
        <filter id={`${uid}-og`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* 中心光晕 */}
        <filter id={`${uid}-oc`} x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* 中心渐变 */}
        <radialGradient id={`${uid}-ocg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#2a1a5e" />
          <stop offset="60%"  stopColor="#0f0830" />
          <stop offset="100%" stopColor="#06041a" />
        </radialGradient>
        {/* 轨道光晕渐变 */}
        <radialGradient id={`${uid}-org1`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1e3a6e" stopOpacity="0" />
          <stop offset="85%"  stopColor="#1e3a6e" stopOpacity=".06" />
          <stop offset="100%" stopColor="#1e3a6e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-org2`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#2e1a6e" stopOpacity="0" />
          <stop offset="85%"  stopColor="#2e1a6e" stopOpacity=".05" />
          <stop offset="100%" stopColor="#2e1a6e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 稀疏星场 */}
      {STARS_ORBITAL.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
      ))}

      {/* 轨道圈背景晕染 */}
      <circle cx={CX} cy={CY} r={R1 + 18} fill={`url(#${uid}-org1)`} />
      <circle cx={CX} cy={CY} r={R2 + 20} fill={`url(#${uid}-org2)`} />

      {/* 轨道环本体 */}
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke="white" strokeOpacity=".1" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke="white" strokeOpacity=".07" strokeWidth="1" />

      {/* 轨道环上的旋转标记弧（顺时针缓转） */}
      <circle cx={CX} cy={CY} r={R1} fill="none"
        stroke="white" strokeOpacity=".3" strokeWidth="1.5"
        strokeDasharray={`${R1 * 0.28} ${R1 * Math.PI * 2}`}
        strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="32s" repeatCount="indefinite" />
      </circle>
      <circle cx={CX} cy={CY} r={R2} fill="none"
        stroke="white" strokeOpacity=".2" strokeWidth="1"
        strokeDasharray={`${R2 * 0.18} ${R2 * Math.PI * 2}`}
        strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="48s" repeatCount="indefinite" />
      </circle>

      {/* 连接线：从中心到各节点，非常淡 */}
      {nodes.slice(1).map((node, i) => {
        const c = SOFT[node.tech.category] ?? FB_SOFT
        return (
          <line key={`ol-${i}`}
            x1={CX} y1={CY} x2={node.x} y2={node.y}
            stroke={c.stroke} strokeOpacity=".10" strokeWidth=".8"
            strokeDasharray="3 6"
          />
        )
      })}

      {/* 中心节点 */}
      {nodes[0] && (() => {
        const center = nodes[0]
        const c = SOFT[center.tech.category] ?? FB_SOFT
        return (
          <g filter={`url(#${uid}-oc)`}>
            {/* 脉冲环 */}
            <circle cx={CX} cy={CY} r={46} fill="none" stroke={c.stroke} strokeWidth="1.5" opacity="0">
              <animate attributeName="r"       values="46;66;66"    dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values=".25;0;0"     dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={CX} cy={CY} r={46} fill="none" stroke={c.stroke} strokeWidth="1.5" opacity="0">
              <animate attributeName="r"       values="46;66;66"    dur="3.5s" begin="1.75s" repeatCount="indefinite" />
              <animate attributeName="opacity" values=".25;0;0"     dur="3.5s" begin="1.75s" repeatCount="indefinite" />
            </circle>
            {/* 主圆 */}
            <circle cx={CX} cy={CY} r={44} fill={`url(#${uid}-ocg)`} stroke={c.stroke} strokeOpacity=".35" strokeWidth="1.5" />
            <text x={CX} y={CY - 7} textAnchor="middle" dominantBaseline="middle"
              fontSize="22" style={{ userSelect: 'none', pointerEvents: 'none' }}>
              {center.tech.icon}
            </text>
            <text x={CX} y={CY + 14} textAnchor="middle" fontSize="7.5"
              fill={c.text} fontFamily="'SF Mono','Fira Code',monospace" fontWeight="600" opacity=".8">
              {center.tech.name.length > 11 ? `${center.tech.name.slice(0, 10)}…` : center.tech.name}
            </text>
            <title>{center.tech.name} · {center.tech.confidence}%</title>
          </g>
        )
      })()}

      {/* 卫星节点 */}
      {nodes.slice(1).map((node, i) => {
        const c = SOFT[node.tech.category] ?? FB_SOFT
        const r = node.ring === 1 ? 28 : 21
        const nx = node.x, ny = node.y
        return (
          <g key={`on-${node.tech.name}`}
            className="o-node"
            style={{ animationDelay: `${(i + 1) * 0.08}s` }}
            filter={`url(#${uid}-og)`}
          >
            {/* 分类色外环 */}
            <circle cx={nx} cy={ny} r={r + 3} fill="none"
              stroke={c.stroke} strokeOpacity=".2" strokeWidth="1" />
            {/* 节点主体 */}
            <circle cx={nx} cy={ny} r={r}
              fill={c.bg} stroke={c.stroke}
              strokeOpacity=".45" strokeWidth="1.2" />
            {/* 图标 */}
            <text x={nx} y={ny - 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={node.ring === 1 ? 13 : 10}
              style={{ userSelect: 'none', pointerEvents: 'none' }}>
              {node.tech.icon}
            </text>
            {/* 名称 */}
            <text x={nx} y={ny + (node.ring === 1 ? 10 : 8)}
              textAnchor="middle" fontSize={node.ring === 1 ? 6.5 : 5.5}
              fill={c.text} fontFamily="'SF Mono','Fira Code',monospace"
              fontWeight="600" opacity=".8">
              {node.tech.name.length > 10 ? `${node.tech.name.slice(0, 9)}…` : node.tech.name}
            </text>
            {/* 置信度圆点 */}
            <circle cx={nx + r - 2} cy={ny - r + 2} r="3.5"
              fill={c.stroke} opacity=".6" />
            <text x={nx + r - 2} y={ny - r + 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="3.5" fill="black" fontWeight="bold" opacity=".9">
              {node.tech.confidence > 99 ? '✓' : node.tech.confidence}
            </text>
            <title>{node.tech.name} · {node.tech.category} · {node.tech.confidence}%</title>
          </g>
        )
      })}

      {/* 项目信息 */}
      <text x={W / 2} y="16" textAnchor="middle" fontSize="8"
        fill="white" opacity=".15" fontFamily="monospace" letterSpacing="3">
        {projectName.toUpperCase()}
      </text>
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="7"
        fill="white" opacity=".1" fontFamily="monospace">
        {projectType} · {nodes.length} techs
      </text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 主组件
// ═════════════════════════════════════════════════════════════════════════════

export default function ConstellationView({ result, className = '' }: VisualizationProps) {
  const { techStack, projectName, projectType, features } = result
  const uid    = useId().replace(/:/g, 'u')
  const nodes  = useMemo(() => layoutNodes(techStack), [techStack])
  const svgRef = useRef<SVGSVGElement>(null)
  const [style, setStyle]     = useState<StarStyle>('cyber')
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    if (!svgRef.current || exporting) return
    setExporting(true)
    try {
      await exportSvgAsPng(svgRef.current, `${projectName}-${style}.png`)
    } finally {
      setExporting(false)
    }
  }, [projectName, style, exporting])

  // Shared legend color source
  const palette = style === 'cyber' ? CYBER : SOFT

  return (
    <div className={`w-full space-y-3 ${className}`}>

      {/* ── 风格选择器 ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 rounded-xl border border-white/8 bg-black/30 p-1">
        {STYLE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setStyle(opt.id)}
            className={`flex flex-1 flex-col items-center rounded-lg px-2 py-1.5 text-center transition-all duration-200 ${
              style === opt.id
                ? 'bg-white/10 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[10px] opacity-60">{opt.desc}</span>
          </button>
        ))}
      </div>

      {/* ── Canvas wrapper ────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          border: style === 'cyber'
            ? '1px solid rgba(0,212,255,.14)'
            : style === 'minimal'
              ? '1px solid rgba(255,255,255,.07)'
              : '1px solid rgba(255,255,255,.08)',
        }}
      >
        {/* HUD 角标（仅赛博风格） */}
        {style === 'cyber' && (
          ['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
            <svg key={i} className={`pointer-events-none absolute ${pos} h-5 w-5 opacity-50`} viewBox="0 0 20 20" fill="none">
              <path d="M2 12 L2 2 L12 2" stroke="#00d4ff" strokeWidth="1.2" />
            </svg>
          ))
        )}

        {/* SVG 容器（用 ref 对准当前激活的 SVG） */}
        <div ref={el => {
          if (el) {
            const svg = el.querySelector('svg')
            ;(svgRef as React.MutableRefObject<SVGSVGElement | null>).current = svg
          }
        }}>
          {style === 'cyber'   && <CyberCanvas   nodes={nodes} uid={uid} projectName={projectName} projectType={projectType} />}
          {style === 'minimal' && <MinimalCanvas  nodes={nodes} uid={uid} projectName={projectName} projectType={projectType} />}
          {style === 'orbital' && <OrbitalCanvas  nodes={nodes} uid={uid} projectName={projectName} projectType={projectType} />}
        </div>
      </div>

      {/* ── 工具栏：导出 ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-600">
          {style === 'cyber' ? '赛博扫描风 · 深空粒子流' : style === 'minimal' ? '极简线图 · 无动效干扰' : '轨道星系 · 行星公转感'}
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white disabled:opacity-50 disabled:cursor-wait"
        >
          {exporting ? (
            <><svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>导出中…</>
          ) : (
            <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>导出 PNG</>
          )}
        </button>
      </div>

      {/* ── 图例 ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {Object.entries(palette)
          .filter(([cat]) => techStack.some(t => t.category === cat))
          .map(([cat, c]) => {
            const stroke = 'stroke' in c ? c.stroke : (c as { stroke: string }).stroke
            const glow   = 'glow' in c ? (c as { glow: string }).glow : stroke
            return (
              <div key={cat}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: `${stroke}08`, border: `1px solid ${stroke}20` }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: stroke, boxShadow: `0 0 6px ${glow}` }} />
                <span className="text-xs capitalize" style={{ color: `${stroke}cc` }}>{cat}</span>
              </div>
            )
          })}
      </div>

      {/* ── 功能标签 ──────────────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {features.map(f => (
            <div key={f.id}
              className="flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-4 py-1.5">
              <span className="text-sm">{f.icon}</span>
              <span className="text-xs font-medium text-slate-400">{f.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
