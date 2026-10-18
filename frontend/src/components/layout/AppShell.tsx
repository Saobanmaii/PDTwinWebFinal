import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface AppShellProps {
  children: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
}

/**
 * Nền gradient đỏ, sidebar 180px bên trái, vùng nội dung xám bo góc trái 24px
 * (theo frame "Sinh viên / Tổng quan" trong Figma).
 */
export default function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-brand-500 from-[17%] to-brand-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto rounded-l-3xl bg-surface px-6 pt-5 pb-6">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex flex-col gap-5">{children}</main>
      </div>
    </div>
  )
}

/** "Xin chào, <tên đỏ> 👋" dùng cho trang tổng quan */
export function Greeting({ name }: { name?: string }) {
  return (
    <span className="flex items-center gap-1">
      Xin chào, <span className="text-brand-500">{name}</span> <span className="text-base">👋</span>
    </span>
  )
}
