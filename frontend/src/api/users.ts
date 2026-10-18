import api from '@/lib/axios'
import type { ApiResponse, Role, User } from '@/types'

export async function getUsers(role?: string): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>('/users', { params: { role } })
  return res.data.data
}

export async function createTeacher(data: { username: string; fullName: string; password?: string }) {
  const res = await api.post<ApiResponse<User>>('/users', data)
  return res.data.data
}

export async function updateUser(id: number, data: { fullName?: string; active?: boolean; role?: Role }) {
  const res = await api.put<ApiResponse<User>>(`/users/${id}`, data)
  return res.data.data
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`)
}

export async function importStudents(file: File): Promise<User[]> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<ApiResponse<User[]>>('/users/import-excel', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}
