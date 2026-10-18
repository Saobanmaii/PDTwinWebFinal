import { User } from 'lucide-react'

/** Dòng "GV: <tên>" dưới tên lớp trong ClassCard */
export function teacherMeta(teacherName: string) {
  return { icon: <User size={12} />, text: `GV: ${teacherName}` }
}
