import api from '@/lib/axios'
import { downloadFile } from '@/lib/download'
import type { ApiResponse, ClassroomReport, SessionReport } from '@/types'

export async function getSessionReport(classSessionId: number): Promise<SessionReport> {
  const res = await api.get<ApiResponse<SessionReport>>(`/reports/class-sessions/${classSessionId}`)
  return res.data.data
}

export async function getClassroomReport(classroomId: number): Promise<ClassroomReport> {
  const res = await api.get<ApiResponse<ClassroomReport>>(`/reports/classrooms/${classroomId}`)
  return res.data.data
}

export async function exportSessionReport(classSessionId: number) {
  await downloadFile(`/reports/class-sessions/${classSessionId}/export`, 'bang-diem-bai-thuc-hanh.xlsx')
}

export async function exportClassroomReport(classroomId: number) {
  await downloadFile(`/reports/classrooms/${classroomId}/export`, 'bang-diem-tong-ket-lop.xlsx')
}
