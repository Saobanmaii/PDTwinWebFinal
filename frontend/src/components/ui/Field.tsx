import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const control = 'w-full rounded-[10px] border border-line bg-subtle px-4 text-xs text-ink placeholder:text-muted ' +
  'focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:opacity-60'

export function Field({ label, required, hint, children, className }: {
  label: string; required?: boolean; hint?: string; children: ReactNode; className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block px-2 text-sm font-semibold leading-[18px] text-ink">
        {label}{required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block px-2 text-[11px] text-muted">{hint}</span>}
    </label>
  )
}

export function Input({ className, icon, ...rest }: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  if (!icon) return <input {...rest} className={cn(control, 'h-[42px]', className)} />
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <input {...rest} className={cn(control, 'h-[42px] pl-10', className)} />
    </div>
  )
}

export function PasswordInput({ className, icon, ...rest }: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
      <input {...rest} type={show ? 'text' : 'password'}
        className={cn(control, 'h-[42px] pr-11', icon && 'pl-10', className)} />
      <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(control, 'py-3 resize-none', className)} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={cn(control, 'h-[42px] appearance-none pr-10 cursor-pointer', className)}>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  )
}
