import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vibe-Lens · GitHub 项目结构可视化',
  description: '粘贴任意 GitHub 仓库目录树，自动提取技术栈、架构亮点与核心功能，生成惊艳的可视化卡片。',
  keywords: ['GitHub', '项目可视化', '技术栈', 'README', '开源工具'],
  openGraph: {
    title: 'Vibe-Lens',
    description: '让你的 GitHub 项目结构开口说话',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
