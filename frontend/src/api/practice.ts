import api from '@/lib/axios'
import type { ApiResponse, Assignment, ClassSession, PracticeSession } from '@/types'

export async function getPracticeSessions(): Promise<PracticeSession[]> {
  const res = await api.get<ApiResponse<PracticeSession[]>>('/practice-sessions')
  return res.data.data
}

export async function createPracticeSession(data: {
  title: string; description?: string; unitySceneName: string
  lessonNumber?: number; cameraUrl?: string; gxWorkUrl?: string
}) {
  const res = await api.post<ApiResponse<PracticeSession>>('/practice-sessions', data)
  return res.data.data
}

export async function updatePracticeSession(id: number, data: {
  title: string; description?: string; unitySceneName: string
  lessonNumber?: number; cameraUrl?: string; gxWorkUrl?: string
}) {
  const res = await api.put<ApiResponse<PracticeSession>>(`/practice-sessions/${id}`, data)
  return res.data.data
}

export async function deletePracticeSession(id: number) {
  await api.delete(`/practice-sessions/${id}`)
}

export async function getClassSessions(classroomId: number): Promise<ClassSession[]> {
  const res = await api.get<ApiResponse<ClassSession[]>>(`/classrooms/${classroomId}/sessions`)
  return res.data.data
}

export async function addSessionToClassroom(classroomId: number, practiceSessionId: number) {
  const res = await api.post<ApiResponse<ClassSession>>(`/classrooms/${classroomId}/sessions`, {
    practiceSessionId,
  })
  return res.data.data
}

export async function removeSessionFromClassroom(classroomId: number, classSessionId: number) {
  await api.delete(`/classrooms/${classroomId}/sessions/${classSessionId}`)
}

export async function getAssignments(classSessionId: number): Promise<Assignment[]> {
  const res = await api.get<ApiResponse<Assignment[]>>(`/class-sessions/${classSessionId}/assignments`)
  return res.data.data
}

export async function batchAssign(classSessionId: number, data: {
  studentId: number; startTime: string; endTime: string
}[]) {
  const res = await api.post<ApiResponse<Assignment[]>>(
    `/class-sessions/${classSessionId}/assignments/batch`, data
  )
  return res.data.data
}

export async function updateAssignment(id: number, data: {
  startTime: string; endTime: string
}) {
  const res = await api.put<ApiResponse<Assignment>>(`/assignments/${id}`, data)
  return res.data.data
}

export async function myAssignments(): Promise<Assignment[]> {
  const res = await api.get<ApiResponse<Assignment[]>>('/students/me/assignments')
  return res.data.data
}

export async function deleteAssignment(id: number) {
  await api.delete(`/assignments/${id}`)
}
