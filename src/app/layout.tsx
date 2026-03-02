import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://vibe-lens.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Vibe-Lens · GitHub 项目结构可视化',
  description: '粘贴任意 GitHub 仓库目录树，自动提取技术栈、架构亮点与核心功能，生成惊艳的可视化卡片。',
  keywords: ['GitHub', '项目可视化', '技术栈', 'README', '开源工具'],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Vibe-Lens · GitHub 项目结构可视化',
    description: '让你的 GitHub 项目结构开口说话',
    type: 'website',
    url: SITE_URL,
    siteName: 'Vibe-Lens',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe-Lens · GitHub 项目结构可视化',
    description: '让你的 GitHub 项目结构开口说话',
    creator: '@citizen204',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
