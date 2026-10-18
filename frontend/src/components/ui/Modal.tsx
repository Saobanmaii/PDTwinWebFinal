import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const widths = { sm: 'max-w-[413px]', md: 'max-w-[480px]', lg: 'max-w-[863px]', xl: 'max-w-[1240px]' }

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={onClose}>
      <div onMouseDown={e => e.stopPropagation()}
        className={cn('w-full max-h-[90vh] flex flex-col rounded-[10px] bg-white shadow-pop', widths[size])}>
        <div className="mx-6 flex items-start justify-between gap-4 border-b border-line pt-6 pb-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-5 text-ink">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-info-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-ink hover:text-brand-500 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 pb-6">{footer}</div>}
      </div>
    </div>
  )
}
