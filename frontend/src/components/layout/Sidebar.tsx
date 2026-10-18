import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { LayoutDashboard, GraduationCap, BookOpen, ChartNoAxesColumn, UserRound } from 'lucide-react'
import sidebarBg from '@/assets/figma/sidebar-bg.png'
import ptitLogo from '@/assets/figma/ptit-logo.png'

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  roles: string[]
  /** Các đường dẫn khác cũng làm item này sáng lên */
  match?: string[]
}

const navItems: NavItem[] = [
  { label: 'Tổng quan', icon: <LayoutDashboard size={16} />, href: '/dashboard', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Lớp học', icon: <GraduationCap size={16} />, href: '/classrooms', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Bài thực hành', icon: <BookOpen size={16} />, href: '/practice-sessions', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Bài thực hành', icon: <BookOpen size={16} />, href: '/my-practice', roles: ['STUDENT'], match: ['/practice/'] },
  { label: 'Báo cáo', icon: <ChartNoAxesColumn size={16} />, href: '/reports', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Người dùng', icon: <UserRound size={16} />, href: '/users', roles: ['ADMIN'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const visible = navItems.filter(i => user && i.roles.includes(user.role))

  return (
    <aside className="relative z-20 flex w-[180px] shrink-0 flex-col overflow-hidden px-4 py-3">
      <img src={sidebarBg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover object-bottom" />

      <div className="relative flex flex-1 flex-col gap-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded bg-white p-1">
            <img src={ptitLogo} alt="PTIT" className="size-5 object-contain" />
          </div>
          <div className="text-white">
            <div className="text-xs font-extrabold tracking-[0.45px]">P-DTwin</div>
            <div className="text-[10px]">PTIT Learning Platform</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-3">
          {visible.map(item => {
            const active = [item.href, ...(item.match ?? [])].some(p => location.pathname.startsWith(p))
            return (
              <Link key={item.href} to={item.href}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-[5px] px-3 text-sm font-semibold leading-[18px] transition-colors',
                  active ? 'bg-brand-100 text-brand-500' : 'text-white hover:bg-brand-700',
                )}>
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
