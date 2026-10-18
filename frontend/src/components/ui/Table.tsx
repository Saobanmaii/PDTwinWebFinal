import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { splitDateTime } from '@/lib/utils'
import avatar from '@/assets/figma/avatar.jpg'

/** Khung bảng trắng bo góc; `attached` khi nằm ngay dưới Tabs */
export function Table({ children, attached, className }: { children: ReactNode; attached?: boolean; className?: string }) {
  return (
    <div className={cn('bg-white shadow-card overflow-x-auto', attached ? 'rounded-b-[10px] rounded-tr-[10px]' : 'rounded-[10px]', className)}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...rest} className={cn('bg-subtle px-4 py-3 text-left text-[11px] font-normal uppercase leading-[14px] text-muted whitespace-nowrap', className)} />
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...rest} className={cn('px-4 py-3 text-xs text-ink border-t border-line', className)} />
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-subtle/60 transition-colors', className)}>{children}</tr>
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return <tr><td colSpan={colSpan} className="border-t border-line py-10 text-center text-xs text-muted">{text}</td></tr>
}

/** Ngày giờ 2 dòng trong ô bảng */
export function DateCell({ value }: { value: string | null | undefined }) {
  const d = splitDateTime(value)
  if (!d) return <span className="text-muted">—</span>
  return <div className="leading-4 text-muted"><div>{d.time}</div><div>{d.date}</div></div>
}

/** Ảnh đại diện + tên người */
export function PersonCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt="" className="size-4 rounded-full object-cover" />
      <span className="whitespace-nowrap">{name}</span>
    </div>
  )
}
