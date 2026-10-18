import { cn, type StatusTone } from '@/lib/utils'

const tones: Record<StatusTone, string> = {
  success: 'bg-success-100 text-success-500',
  danger: 'bg-brand-100 text-brand-500',
  neutral: 'bg-line text-muted',
  info: 'bg-info-100 text-info-500',
}

/** Pill trạng thái — "Đã nộp", "Chưa nộp", "Quá hạn", "Hoạt động", "Bị khóa" */
export default function Badge({ label, tone = 'neutral', className }: { label: string; tone?: StatusTone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center justify-center px-2 py-1 rounded-full text-[11px] leading-[14px] whitespace-nowrap', tones[tone], className)}>
      {label}
    </span>
  )
}

/** Tag viền trắng — tên lớp trên card bài thực hành, mã lớp */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full bg-white border border-line text-info-500 text-xs font-light leading-4', className)}>
      {children}
    </span>
  )
}

/** Số đếm tròn cạnh nhãn tab */
export function CountBadge({ value, active }: { value: number; active?: boolean }) {
  return (
    <span className={cn('inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px]',
      active ? 'bg-brand-100 text-brand-500' : 'text-muted')}>
      {value}
    </span>
  )
}
