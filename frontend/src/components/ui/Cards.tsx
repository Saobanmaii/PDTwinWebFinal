import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Tag } from './Badge'

/** card/lop-hoc — nền xám nhạt, viền xanh nhạt, hover viền xanh đậm */
export function ClassCard({ to, name, code, meta, actions }: {
  to: string
  name: string
  code?: string
  meta: { icon: ReactNode; text: string }[]
  actions?: ReactNode
}) {
  return (
    <Link to={to}
      className="group relative block rounded-[10px] border border-info-100 bg-subtle px-5 py-3 transition-all hover:border-info-500 hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium leading-[18px] text-ink">{name}</div>
          {code && <div className="mt-1 text-[11px] leading-[14px] text-muted truncate">{code}</div>}
        </div>
        {actions && <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>{actions}</div>}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {meta.map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-light leading-4 text-info-500">
            <span className="shrink-0">{m.icon}</span>
            <span className="truncate">{m.text}</span>
          </div>
        ))}
      </div>
    </Link>
  )
}

/** card/bai-thuc-hanh dạng mở rộng — tag lớp, tên bài, hạn, nút "Thực hành" */
export function PracticeCard({ to, classTag, title, endTime, actionLabel = 'Thực hành' }: {
  to: string; classTag: string; title: string; endTime: string | null; actionLabel?: string
}) {
  return (
    <div className="flex flex-col justify-between gap-5 rounded-[10px] border-[0.5px] border-line bg-subtle px-5 py-4 transition-all hover:border-brand-500 hover:shadow-card">
      <div className="flex flex-col items-start gap-3">
        <Tag>{classTag}</Tag>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium leading-[18px] text-ink">{title}</div>
          <Deadline value={endTime} />
        </div>
      </div>
      <Link to={to}
        className="flex items-center justify-center gap-3 rounded bg-brand-500 px-3 py-1.5 text-xs font-medium leading-[18px] text-white hover:bg-brand-700 transition-colors">
        <ArrowRight size={12} /> {actionLabel}
      </Link>
    </div>
  )
}

/** card/bai-thuc-hanh dạng thu gọn — dùng ở "Hạn nộp gần nhất"; `urgent` = nền đỏ nhạt */
export function DeadlineCard({ to, title, endTime, urgent }: { to: string; title: string; endTime: string | null; urgent?: boolean }) {
  return (
    <Link to={to}
      className={cn('flex items-center gap-3 rounded-[10px] border px-5 py-4 transition-shadow hover:shadow-card',
        urgent ? 'border-brand-300 bg-brand-100' : 'border-line bg-subtle')}>
      <span className={cn('size-1.5 shrink-0 rounded-full', urgent ? 'bg-brand-500' : 'bg-muted')} />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="text-sm font-medium leading-[18px] text-ink">{title}</div>
        <Deadline value={endTime} danger={urgent} />
      </div>
    </Link>
  )
}

function Deadline({ value, danger }: { value: string | null; danger?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 text-xs leading-4', danger ? 'text-brand-500' : 'text-muted')}>
      <Clock size={12} className="shrink-0" />
      <span>{formatDate(value)}</span>
    </div>
  )
}
