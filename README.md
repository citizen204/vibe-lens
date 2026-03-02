<div align="center">

English &nbsp;·&nbsp; **[中文](./README.zh-CN.md)**

</div>

---

<div align="center">

```
██╗   ██╗██╗██████╗ ███████╗      ██╗     ███████╗███╗   ██╗███████╗
██║   ██║██║██╔══██╗██╔════╝      ██║     ██╔════╝████╗  ██║██╔════╝
██║   ██║██║██████╔╝█████╗  █████╗██║     █████╗  ██╔██╗ ██║███████╗
╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════╝██║     ██╔══╝  ██║╚██╗██║╚════██║
 ╚████╔╝ ██║██████╔╝███████╗      ███████╗███████╗██║ ╚████║███████║
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝      ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝
```

### 🔬 Let Your GitHub Project Structure Speak for Itself

**Paste a directory tree or enter a GitHub URL → Auto-detect tech stack → Generate 3 stunning visualizations → Copy README Markdown in one click**

<br/>

![Version](https://img.shields.io/badge/version-0.1.0--alpha-6d28d9?style=flat-square&labelColor=0d0d0d)
![License](https://img.shields.io/badge/license-MIT-059669?style=flat-square&labelColor=0d0d0d)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-db2777?style=flat-square&labelColor=0d0d0d)
![No API Key](https://img.shields.io/badge/no%20API%20key-required-d97706?style=flat-square&labelColor=0d0d0d)
![Open Source](https://img.shields.io/badge/open-source-0891b2?style=flat-square&labelColor=0d0d0d)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br/>

**[🚀 Try it Live →](https://vibe-lens-zeta.vercel.app)**

</div>

---

## ✦ Key Features

<table>
<tr>

<td align="center" width="25%">
<br/>
<img src="https://img.shields.io/badge/-%E2%96%A3%20ANALYZE-7c3aed?style=for-the-badge&labelColor=1a0033" alt="Analyze"/>
<br/><br/>
<b>🔬 Smart Project Analysis</b>
<br/><br/>
<sub>
Rule-based engine detects <b>55+ technologies</b><br/>
from file names and paths — languages,<br/>
frameworks, databases, toolchains, CI/CD
</sub>
<br/><br/>
</td>

<td align="center" width="25%">
<br/>
<img src="https://img.shields.io/badge/-%F0%9F%90%99%20GITHUB-2563eb?style=for-the-badge&labelColor=00111a" alt="GitHub"/>
<br/><br/>
<b>🐙 GitHub URL Input</b>
<br/><br/>
<sub>
Enter any public repo URL and Vibe-Lens<br/>
fetches the file tree via GitHub API —<br/>
no manual tree copy needed
</sub>
<br/><br/>
</td>

<td align="center" width="25%">
<br/>
<img src="https://img.shields.io/badge/-%E2%9C%A6%20VISUALIZE-0891b2?style=for-the-badge&labelColor=00111a" alt="Visualize"/>
<br/><br/>
<b>🎨 3 Stunning Visualizations</b>
<br/><br/>
<sub>
<b>Grid Cards</b> · Apple-style card grid<br/>
<b>Constellation</b> · Multi-style star map + PNG export<br/>
<b>Layer Stack</b> · Layered architecture timeline
</sub>
<br/><br/>
</td>

<td align="center" width="25%">
<br/>
<img src="https://img.shields.io/badge/-%E2%9E%9C%20EXPORT-059669?style=for-the-badge&labelColor=001910" alt="Export"/>
<br/><br/>
<b>📋 One-click Markdown Export</b>
<br/><br/>
<sub>
Auto-generate a README snippet with<br/>
<b>shields.io badges</b>, architecture table,<br/>
and feature summary — paste and done
</sub>
<br/><br/>
</td>

</tr>
</table>

---

## ⚙️ How It Works

<table>
<tr>
<th align="center" width="60">Step</th>
<th align="left" width="180">Stage</th>
<th align="left">Description</th>
<th align="center" width="140">Core File</th>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/01-INPUT-6d28d9?style=flat-square" /></td>
<td><b>🌲 Input Parsing</b></td>
<td>
Two input modes: ① <b>Paste a directory tree</b> (compatible with <code>tree</code> command output and GitHub file browser format); ② <b>Enter a GitHub URL</b> to auto-fetch the file tree. Dynamic indentation detection handles non-standard formats.
</td>
<td align="center"><code>lib/analyzer.ts</code></td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/02-DETECT-2563eb?style=flat-square" /></td>
<td><b>🔍 Tech Stack Detection</b></td>
<td>
55+ rules across three dimensions: <b>filename regex</b> → <b>directory name matching</b> → <b>extension counting</b>. Case-insensitive path matching. Each technology outputs a <b>0–100 confidence score</b>.
</td>
<td align="center"><code>lib/tech-detector.ts</code></td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/03-ARCH-059669?style=flat-square" /></td>
<td><b>🏗 Architecture Extraction</b></td>
<td>Detects 6 architecture patterns: App Router, Monorepo, Feature-Sliced Design, Component-based, CI/CD, and more. Extracts related path evidence for each.</td>
<td align="center"><code>lib/analyzer.ts</code></td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/04-RANK-d97706?style=flat-square" /></td>
<td><b>✨ Feature Scoring</b></td>
<td>14 feature templates scored by <b>signal hits × importance weight</b>. Outputs Top 3 core features with related file evidence.</td>
<td align="center"><code>lib/analyzer.ts</code></td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/05-RENDER-db2777?style=flat-square" /></td>
<td><b>🎨 Visualization</b></td>
<td>3 view components: Grid Cards (Apple-style), Constellation (multi-style star map with PNG export), Layer Stack (layered timeline).</td>
<td align="center"><code>components/visualizations/</code></td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/06-EXPORT-0891b2?style=flat-square" /></td>
<td><b>📋 Markdown Generation</b></td>
<td>Generates a standard Markdown snippet with shields.io badges, architecture highlight table, and feature summary. One-click copy.</td>
<td align="center"><code>lib/markdown-generator.ts</code></td>
</tr>

</table>

---

## 🖼 Visualization Modes

<table>
<tr>

<td align="center" width="33%">
<br/>
<img src="https://img.shields.io/badge/MODE%201-Grid%20Cards-6d28d9?style=for-the-badge&labelColor=0d0d0d"/>
<br/><br/>
<b>⊞ Apple-style Card Grid</b>
<br/><br/>
<sub>
Each card shows a single technology with:<br/>
• Animated confidence number counter<br/>
• cubic-bezier progress bar fill<br/>
• 4-bar WiFi signal strength indicator<br/>
• Hover neon glow effect<br/>
• Overflow "+N expand all" card when > 8 items
</sub>
<br/><br/>
<img src="https://img.shields.io/badge/inspired%20by-Apple%20macOS-000000?style=flat-square&logo=apple"/>
<br/><br/>
</td>

<td align="center" width="33%">
<br/>
<img src="https://img.shields.io/badge/MODE%202-Constellation-00d4ff?style=for-the-badge&labelColor=00000e"/>
<br/><br/>
<b>✦ Star Map (3 Styles)</b>
<br/><br/>
<sub>
<b>Cyber</b> · Deep-space SVG animation<br/>
<b>Minimal</b> · Clean force-directed graph<br/>
<b>Orbital</b> · Rotating planetary orbits<br/>
<br/>
Export current view as a <b>PNG image</b>
</sub>
<br/><br/>
<img src="https://img.shields.io/badge/powered%20by-SVG%20SMIL-ff7700?style=flat-square"/>
<br/><br/>
</td>

<td align="center" width="33%">
<br/>
<img src="https://img.shields.io/badge/MODE%203-Layer%20Stack-059669?style=for-the-badge&labelColor=001910"/>
<br/><br/>
<b>≡ Layered Architecture Timeline</b>
<br/><br/>
<sub>
Six-layer tech stack visualization:<br/>
• Infrastructure (deployment)<br/>
• Data Layer (database / ORM)<br/>
• Runtime & Language<br/>
• Framework<br/>
• Toolchain & Testing<br/>
• UI & Design System
</sub>
<br/><br/>
<img src="https://img.shields.io/badge/shows-tech%20layers-0891b2?style=flat-square"/>
<br/><br/>
</td>

</tr>
</table>

---

## 🚀 Quick Start

### Use Online

Visit → **[vibe-lens-zeta.vercel.app](https://vibe-lens-zeta.vercel.app)**

Two ways to analyze a project:

| Mode | How to use |
|------|-----------|
| 🐙 **GitHub URL** | Switch to the "GitHub URL" tab, paste the repo URL, click "Fetch & Analyze" |
| 🌲 **Directory Tree** | Switch to the "Directory Tree" tab, paste `tree` command output, click "Analyze" |

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/citizen204/vibe-lens.git
cd vibe-lens

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:3000
```

### Generate a Directory Tree

```bash
# macOS / Linux
tree -I 'node_modules|.git|.next|dist' --dirsfirst -a

# Or with find
find . -not -path '*/node_modules/*' -not -path '*/.git/*' | sort

# Windows (PowerShell)
tree /F /A | clip
```

> **Tip**: Paste the `tree` output directly into the Vibe-Lens input box and click "Analyze".

---

## 🏗 Project Architecture

```
vibe-lens/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout + SEO / OG / Twitter metadata
│   │   ├── page.tsx                  # Main page (two-column layout + view switching)
│   │   └── globals.css               # Global styles + animation keyframes
│   │
│   ├── components/
│   │   ├── InputPanel.tsx            # Input panel (directory tree / GitHub URL modes)
│   │   ├── CopyMarkdown.tsx          # One-click Markdown copy button
│   │   └── visualizations/
│   │       ├── GridCardView.tsx      # ⊞ Apple-style card grid (with overflow expand)
│   │       ├── ConstellationView.tsx # ✦ Star map (Cyber/Minimal/Orbital + PNG export)
│   │       └── TimelineView.tsx      # ≡ Layered architecture timeline
│   │
│   ├── lib/
│   │   ├── analyzer.ts               # 🧠 Core engine (tree parsing + GitHub API + arch analysis)
│   │   ├── tech-detector.ts          # 🔍 Tech detection (55+ rules + confidence scoring)
│   │   └── markdown-generator.ts     # 📋 Markdown + badges generator
│   │
│   └── types/
│       └── index.ts                  # Global TypeScript type definitions
│
├── package.json                      # Next.js 16 + React 19 + Tailwind 4
├── tailwind.config.ts
└── tsconfig.json
```

<details>
<summary><b>📐 Core Data Flow</b> (click to expand)</summary>

<br/>

```
User Input
    │
    ├── 🌲 Paste directory tree ──── parseTree()
    │                                     │
    └── 🐙 Enter GitHub URL ─── analyzeFromGitHubUrl()
                                 │  fetchGitHubApiTree()
                                 │  (AbortController for cancellation)
                                 │
                           ParsedTree { allFiles, allDirs, ... }
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
   detectTechStack()   analyzeArchitecture()  extractFeatures()
   55+ rule matching    directory structure    feature signal scoring
   confidence 0-100     (monorepo/fsd/api...)  (auth/ai/realtime...)
             │                   │                   │
             └───────────────────┴───────────────────┘
                                 │
                                 ▼
                         AnalysisResult
                  { techStack[], architectureHighlights[],
                    features[], complexity, projectType, warning? }
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
            GridCardView  ConstellationView  TimelineView
                                 │
                                 ▼
                        generateMarkdown()
                     → README-ready Markdown
```

</details>

---

## 🛰 Supported Technologies (55+)

<details>
<summary><b>Click to expand the full list</b></summary>

<br/>

<table>
<tr>
<th>Category</th>
<th>Technology</th>
<th>Detection Signal</th>
</tr>

<tr>
<td rowspan="8">
<img src="https://img.shields.io/badge/LANGUAGE-7c3aed?style=flat-square&labelColor=0c0019"/>
</td>
<td>TypeScript</td><td><code>tsconfig.json</code> · <code>.ts/.tsx</code></td>
</tr>
<tr><td>JavaScript</td><td><code>.js/.jsx/.mjs</code></td></tr>
<tr><td>Python</td><td><code>requirements.txt</code> · <code>pyproject.toml</code></td></tr>
<tr><td>Rust</td><td><code>Cargo.toml</code> · <code>.rs</code></td></tr>
<tr><td>Go</td><td><code>go.mod</code> · <code>.go</code></td></tr>
<tr><td>Java</td><td><code>pom.xml</code> · <code>build.gradle</code></td></tr>
<tr><td>Swift</td><td><code>Package.swift</code> · <code>.swift</code></td></tr>
<tr><td>C# / Kotlin / Ruby / PHP</td><td>config files + extensions</td></tr>

<tr>
<td rowspan="9">
<img src="https://img.shields.io/badge/FRAMEWORK-2563eb?style=flat-square&labelColor=00111a"/>
</td>
<td>Next.js</td><td><code>next.config.*</code></td>
</tr>
<tr><td>React</td><td><code>.tsx/.jsx</code></td></tr>
<tr><td>Vue / Nuxt</td><td><code>.vue</code> · <code>nuxt.config.*</code></td></tr>
<tr><td>SvelteKit</td><td><code>.svelte</code> · <code>svelte.config.*</code></td></tr>
<tr><td>Astro</td><td><code>.astro</code> · <code>astro.config.*</code></td></tr>
<tr><td>FastAPI / Django / Flask</td><td><code>main.py</code> · <code>manage.py</code></td></tr>
<tr><td>Express / Hono / tRPC</td><td>path keywords · config files</td></tr>
<tr><td>Spring Boot / Laravel</td><td><code>application.yml</code> · <code>artisan</code></td></tr>
<tr><td>Remix</td><td><code>remix.config.*</code></td></tr>

<tr>
<td rowspan="4">
<img src="https://img.shields.io/badge/UI-db2777?style=flat-square&labelColor=190007"/>
</td>
<td>Tailwind CSS</td><td><code>tailwind.config.*</code></td>
</tr>
<tr><td>shadcn/ui</td><td><code>components.json</code> · <code>/ui</code> dir</td></tr>
<tr><td>Material UI / Chakra UI</td><td>path keywords</td></tr>
<tr><td>Framer Motion / Storybook</td><td>config files · path keywords</td></tr>

<tr>
<td rowspan="5">
<img src="https://img.shields.io/badge/DATABASE-059669?style=flat-square&labelColor=001910"/>
</td>
<td>Prisma</td><td><code>/prisma</code> · <code>.prisma</code></td>
</tr>
<tr><td>Drizzle ORM</td><td><code>drizzle.config.*</code></td></tr>
<tr><td>Supabase</td><td><code>/supabase</code> directory</td></tr>
<tr><td>MongoDB</td><td>path contains <code>mongoose</code></td></tr>
<tr><td>PostgreSQL / Redis</td><td>path keywords</td></tr>

<tr>
<td rowspan="4">
<img src="https://img.shields.io/badge/DEPLOY-0891b2?style=flat-square&labelColor=00111a"/>
</td>
<td>Docker</td><td><code>Dockerfile</code> · <code>docker-compose.*</code></td>
</tr>
<tr><td>GitHub Actions</td><td><code>.github/workflows</code></td></tr>
<tr><td>Kubernetes</td><td><code>/k8s</code> · <code>/helm</code></td></tr>
<tr><td>Vercel / Netlify</td><td>config files</td></tr>

<tr>
<td rowspan="4">
<img src="https://img.shields.io/badge/TESTING-e11d48?style=flat-square&labelColor=190005"/>
</td>
<td>Vitest</td><td><code>vitest.config.*</code></td>
</tr>
<tr><td>Jest</td><td><code>jest.config.*</code></td></tr>
<tr><td>Playwright</td><td><code>playwright.config.*</code></td></tr>
<tr><td>Cypress</td><td><code>cypress.config.*</code></td></tr>

<tr>
<td rowspan="3">
<img src="https://img.shields.io/badge/TOOLING-d97706?style=flat-square&labelColor=2a1a00"/>
</td>
<td>Bun / pnpm</td><td><code>bun.lockb</code> · <code>pnpm-lock.yaml</code></td>
</tr>
<tr><td>Turborepo</td><td><code>turbo.json</code></td></tr>
<tr><td>OpenAPI</td><td><code>openapi.*</code> · <code>swagger.*</code></td></tr>

</table>

</details>

---

## 🗺 Roadmap

<table>
<tr>
<th align="center" width="120">Status</th>
<th align="left">Feature</th>
<th align="center" width="100">Priority</th>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>Directory tree parsing + 55+ tech detection (case-insensitive)</td>
<td align="center">🔴 P0</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>Three visualization components (Grid / Constellation / Timeline)</td>
<td align="center">🔴 P0</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>One-click README Markdown copy</td>
<td align="center">🔴 P0</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>GitHub URL direct input (auto-fetch file tree, with cancel support)</td>
<td align="center">🟠 P1</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>Export visualization as PNG (Constellation view)</td>
<td align="center">🟠 P1</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/✅-DONE-059669?style=flat-square"/></td>
<td>Constellation multi-style: Cyber / Minimal / Orbital</td>
<td align="center">🟠 P1</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/📋-PLANNED-6d28d9?style=flat-square"/></td>
<td>LLM mode: integrate OpenAI for deeper semantic analysis</td>
<td align="center">🟡 P2</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/📋-PLANNED-6d28d9?style=flat-square"/></td>
<td>VS Code extension: analyze the current project directly in the editor</td>
<td align="center">🟡 P2</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/💡-IDEA-0891b2?style=flat-square"/></td>
<td>Interactive Constellation graph (draggable nodes)</td>
<td align="center">🟢 P3</td>
</tr>

<tr>
<td align="center"><img src="https://img.shields.io/badge/💡-IDEA-0891b2?style=flat-square"/></td>
<td>Analysis history (cache last 10 results in LocalStorage)</td>
<td align="center">🟢 P3</td>
</tr>

</table>

---

## 🤝 Contributing

All contributions are welcome! Areas we'd especially love help with:

- **🔍 New tech rules** — Add detection rules for technologies you know in `lib/tech-detector.ts`
- **🎨 New visualization styles** — Inspired by `MinimalCanvas` in `ConstellationView.tsx`, create a new star map style
- **🌐 Internationalization** — Add support for Japanese, Korean, or other languages

```bash
# Fork → Clone → Branch
git checkout -b feat/your-feature

# Develop + test
npm run dev
npm run typecheck   # TypeScript type check
npm run lint        # ESLint check

# Commit
git commit -m "feat: add XXX tech detection rule"
git push origin feat/your-feature
# Open a Pull Request 🎉
```

---

<div align="center">

---

**Made with 🔬 by [citizen204](https://github.com/citizen204)**

[![Star on GitHub](https://img.shields.io/github/stars/citizen204/vibe-lens?style=social)](https://github.com/citizen204/vibe-lens)
&nbsp;
[![Follow](https://img.shields.io/github/followers/citizen204?style=social)](https://github.com/citizen204)

<br/>

*If Vibe-Lens helped your README shine, a ⭐ is the best way to say thanks.*

<br/>

![MIT License](https://img.shields.io/badge/License-MIT-6d28d9?style=flat-square&labelColor=0d0d0d)
&nbsp;
![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=flat-square&logo=nextdotjs)
&nbsp;
![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>
