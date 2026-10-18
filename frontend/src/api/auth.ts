import api from '@/lib/axios'
import type { ApiResponse, AuthUser } from '@/types'

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await api.post<ApiResponse<AuthUser>>('/auth/login', { username, password })
  return res.data.data
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const res = await api.post('/auth/change-password', {
    oldPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  })
  return res.data
}
