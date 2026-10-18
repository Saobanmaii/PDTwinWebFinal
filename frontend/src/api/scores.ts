import api from '@/lib/axios'
import type { ApiResponse, Score } from '@/types'

export async function submitScore(data: {
  assignmentId: number; score: number; details?: string
}): Promise<Score> {
  const res = await api.post<ApiResponse<Score>>('/scores', data)
  return res.data.data
}

export async function getScoresByClassSession(classSessionId: number): Promise<Score[]> {
  const res = await api.get<ApiResponse<Score[]>>(`/class-sessions/${classSessionId}/scores`)
  return res.data.data
}

/** Giảng viên chốt điểm cuối và/hoặc ghi nhận xét — gửi trường nào thì cập nhật trường đó */
export async function gradeScore(
  scoreId: number,
  data: { finalScore?: number; feedback?: string }
): Promise<Score> {
  const res = await api.put<ApiResponse<Score>>(`/scores/${scoreId}`, data)
  return res.data.data
}

export async function myScores(): Promise<Score[]> {
  const res = await api.get<ApiResponse<Score[]>>('/students/me/scores')
  return res.data.data
}
