import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Ngày giờ hiển thị 2 dòng như Figma: "10:32" / "03/08/2026" */
export function splitDateTime(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  return {
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  }
}

export type StatusTone = 'success' | 'danger' | 'neutral' | 'info'

export function statusLabel(status: string): { label: string; tone: StatusTone } {
  const map: Record<string, { label: string; tone: StatusTone }> = {
    AVAILABLE:     { label: 'Chưa nộp', tone: 'neutral' },
    NOT_YET:       { label: 'Chưa mở', tone: 'info' },
    EXPIRED:       { label: 'Quá hạn', tone: 'danger' },
    COMPLETED:     { label: 'Đã nộp', tone: 'success' },
    NOT_SCHEDULED: { label: 'Chưa phân lịch', tone: 'neutral' },
  }
  return map[status] ?? { label: status, tone: 'neutral' }
}

/** Đã có điểm (đã nộp) — backend vẫn trả EXPIRED cho bài đã nộp nhưng hết giờ */
export function hasSubmitted(a: { rawScore: number | null; finalScore: number | null }) {
  return a.rawScore != null || a.finalScore != null
}

/** Trạng thái để hiển thị: bài đã có điểm luôn là "Đã nộp" */
export function displayStatus(a: { status: string; rawScore: number | null; finalScore: number | null }) {
  return hasSubmitted(a) ? 'COMPLETED' : a.status
}

export function roleLabel(role: string | undefined) {
  return role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Giảng viên' : 'Sinh viên'
}
