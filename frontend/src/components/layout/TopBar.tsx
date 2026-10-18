import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn, roleLabel } from '@/lib/utils'
import avatar from '@/assets/figma/avatar.jpg'

interface TopBarProps {
  title?: ReactNode
  subtitle?: ReactNode
}

/** Header của vùng nội dung: tiêu đề trang bên trái, thông báo + tài khoản bên phải */
export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-line pr-4">
      <div className="flex min-w-0 flex-col gap-1.5 py-1">
        {title && <h1 className="text-xl font-semibold leading-[26px] text-ink">{title}</h1>}
        {subtitle && <p className="text-base leading-[18px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3 py-2">
        <NotificationMenu />
        <ProfileMenu />
      </div>
    </header>
  )
}

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, close])
  return ref
}

function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={cn('flex size-10 items-center justify-center rounded text-ink hover:bg-line transition-colors cursor-pointer', open && 'bg-line')}>
        <Bell size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-[340px] rounded-[10px] bg-white p-5 shadow-pop">
          <p className="text-sm text-muted">Chưa có thông báo mới.</p>
        </div>
      )}
    </div>
  )
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 text-left cursor-pointer">
        <img src={avatar} alt="" className="size-6 rounded-full border-[0.8px] border-line object-cover" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold leading-[18px] text-ink whitespace-nowrap">{user?.fullName}</span>
          <span className="text-[11px] leading-[14px] text-muted">{roleLabel(user?.role)}</span>
        </div>
        <ChevronDown size={12} className={cn('text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-[165px] overflow-hidden rounded-[10px] bg-white py-1 shadow-pop">
          <button onClick={() => { setOpen(false); navigate('/settings') }}
            className="flex w-full items-center gap-3 px-5 py-3 text-sm text-ink hover:bg-surface cursor-pointer">
            <Settings size={14} /> Đổi mật khẩu
          </button>
          <button onClick={logout}
            className="flex w-full items-center gap-3 px-5 py-3 text-sm text-brand-500 hover:bg-surface cursor-pointer">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
