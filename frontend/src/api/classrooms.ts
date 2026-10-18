import api from '@/lib/axios'
import type { ApiResponse, Classroom, User } from '@/types'

export async function getClassrooms(): Promise<Classroom[]> {
  const res = await api.get<ApiResponse<Classroom[]>>('/classrooms')
  return res.data.data
}

export async function getClassroom(id: number): Promise<Classroom> {
  const res = await api.get<ApiResponse<Classroom>>(`/classrooms/${id}`)
  return res.data.data
}

export async function createClassroom(data: { name: string; description?: string; teacherId?: number }) {
  const res = await api.post<ApiResponse<Classroom>>('/classrooms', data)
  return res.data.data
}

export async function updateClassroom(id: number, data: { name: string; description?: string }) {
  const res = await api.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data)
  return res.data.data
}

export async function deleteClassroom(id: number) {
  await api.delete(`/classrooms/${id}`)
}

export async function getMembers(classroomId: number): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>(`/classrooms/${classroomId}/members`)
  return res.data.data
}

export async function importMembers(classroomId: number, file: File): Promise<User[]> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<ApiResponse<User[]>>(
    `/classrooms/${classroomId}/members/import`, form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data.data
}

export async function removeMember(classroomId: number, studentId: number) {
  await api.delete(`/classrooms/${classroomId}/members/${studentId}`)
}
