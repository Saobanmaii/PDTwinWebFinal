import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Tiêu đề khu vực có vạch đỏ bên trái — "Bài thực hành đang mở", "Lớp học của tôi" */
export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-3.5 w-0.5 shrink-0 rounded-full bg-brand-500" />
        <h2 className="text-base font-semibold leading-5 text-ink truncate">{children}</h2>
      </div>
      {action}
    </div>
  )
}

/** Link nhỏ màu đỏ "Xem tất cả >" */
export function MoreLink({ to, children = 'Xem tất cả' }: { to: string; children?: ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 px-3 py-1 text-[11px] leading-[14px] text-brand-500">
      <span className="border-b-[0.5px] border-transparent group-hover:border-brand-500">{children}</span>
      <ChevronRight size={12} />
    </Link>
  )
}

/** Khối trắng bo góc chứa nội dung */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[10px] bg-white p-4', className)}>{children}</div>
}

export function EmptyState({ icon, text, className }: { icon?: ReactNode; text: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-muted', className)}>
      {icon && <div className="opacity-40">{icon}</div>}
      <p className="text-xs">{text}</p>
    </div>
  )
}
