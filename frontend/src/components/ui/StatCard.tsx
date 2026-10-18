import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import cardBg from '@/assets/figma/stat-card-bg.png'

type Tone = 'brand' | 'success' | 'info' | 'ink'

const iconTones: Record<Tone, string> = {
  brand: 'bg-brand-100 text-brand-500',
  success: 'bg-success-100 text-success-500',
  info: 'bg-info-100 text-info-500',
  ink: 'bg-surface text-ink',
}

const valueTones: Record<Tone, string> = {
  brand: 'text-brand-500',
  success: 'text-success-500',
  info: 'text-info-500',
  ink: 'text-ink',
}

interface StatCardProps {
  label: string
  sublabel?: string
  value: ReactNode
  icon?: ReactNode
  tone?: Tone
  titleAddon?: ReactNode
}

export default function StatCard({ label, sublabel, value, icon, tone = 'brand', titleAddon }: StatCardProps) {
  return (
    <div className="relative flex-1 min-w-0 overflow-hidden rounded-[10px] border border-line bg-white px-5 py-4 shadow-card flex flex-col gap-3">
      <img src={cardBg} alt="" className="pointer-events-none absolute inset-0 size-full object-cover rounded-[10px]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium leading-[18px] text-ink">
            {label}{titleAddon}
          </div>
          {sublabel && <div className="text-xs font-light leading-4 text-muted mt-0.5">{sublabel}</div>}
        </div>
        {icon && (
          <div className={cn('size-8 shrink-0 rounded-full flex items-center justify-center', iconTones[tone])}>
            {icon}
          </div>
        )}
      </div>
      <div className={cn('relative px-0.5 text-xl font-semibold leading-[26px]', valueTones[tone])}>{value}</div>
    </div>
  )
}
