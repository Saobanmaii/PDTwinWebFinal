import { cn } from '@/lib/utils'
import { CountBadge } from './Badge'

interface TabItem<K extends string> {
  key: K
  label: string
  count?: number
}

/** Tab gạch chân đỏ trong khối trắng — "Bài thực hành 2 | Tài liệu 3 | Sinh viên 54" */
export default function Tabs<K extends string>({ items, value, onChange }: {
  items: TabItem<K>[]
  value: K
  onChange: (key: K) => void
}) {
  return (
    <div className="inline-flex items-stretch rounded-t-[10px] bg-white shadow-card">
      {items.map(t => {
        const active = t.key === value
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 h-[38px] text-xs border-b-[1.5px] transition-colors cursor-pointer',
              active ? 'border-brand-500 text-brand-500 font-medium' : 'border-transparent text-muted hover:text-ink',
            )}>
            {t.label}
            {t.count != null && <CountBadge value={t.count} active={active} />}
          </button>
        )
      })}
    </div>
  )
}

/** Bộ lọc dạng pill — "Tất cả 10 | Đã nộp 2 | Chưa nộp 7" */
export function FilterPills<K extends string>({ items, value, onChange }: {
  items: TabItem<K>[]
  value: K
  onChange: (key: K) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(t => {
        const active = t.key === value
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className={cn(
              'flex items-center gap-2 h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer',
              active ? 'bg-info-100 text-info-500' : 'bg-white border border-line text-ink hover:bg-subtle',
            )}>
            {t.label}
            {t.count != null && <span className={cn('text-[11px] font-normal', active ? 'text-info-500' : 'text-muted')}>{t.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
