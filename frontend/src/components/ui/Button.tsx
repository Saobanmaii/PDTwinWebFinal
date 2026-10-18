import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-700',
  outline: 'border-[0.5px] border-brand-500 text-brand-500 bg-white hover:bg-brand-100',
  secondary: 'bg-surface text-muted hover:bg-line hover:text-ink',
  ghost: 'text-muted hover:bg-line hover:text-ink',
}

const sizes: Record<Size, string> = {
  sm: 'h-[30px] px-3 rounded text-xs font-medium gap-2',
  md: 'h-[38px] px-4 rounded-md text-sm font-semibold gap-2',
  lg: 'h-[54px] px-4 rounded-[10px] text-sm font-semibold gap-3',
}

export default function Button({ variant = 'primary', size = 'sm', icon, className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className,
      )}>
      {icon}
      {children}
    </button>
  )
}

/** Nút icon vuông (thông báo, sửa, xóa...) */
export function IconButton({ className, size = 'sm', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'lg' }) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded text-muted hover:bg-line hover:text-ink transition-colors cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'lg' ? 'size-10' : 'size-6',
        className,
      )} />
  )
}
