export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface AuthUser {
  userId: number
  username: string
  fullName: string
  role: Role
  token: string
}

export interface User {
  id: number
  username: string
  fullName: string
  studentId: string | null
  role: Role
  active: boolean
  createdAt: string
}

export interface Classroom {
  id: number
  name: string
  description: string | null
  teacherId: number
  teacherName: string
  createdAt: string
}

export interface Document {
  id: number
  classroomId: number
  filename: string
  mimeType: string
  uploadedByName: string
  uploadedAt: string
}

export interface PracticeSession {
  id: number
  title: string
  description: string | null
  unitySceneName: string
  lessonNumber: number
  cameraUrl: string | null
  gxWorkUrl: string | null
  createdAt: string
}

export interface ClassSession {
  id: number
  classroomId: number
  practiceSessionId: number
  practiceTitle: string
  unitySceneName: string
  lessonNumber: number
  cameraUrl: string | null
  gxWorkUrl: string | null
  addedAt: string
}

export interface Assignment {
  id: number
  classSessionId: number
  practiceSessionId: number
  studentId: number
  studentName: string
  studentCode: string | null
  practiceTitle: string
  unitySceneName: string
  lessonNumber: number
  cameraUrl: string | null
  gxWorkUrl: string | null
  classroomName: string
  startTime: string | null
  endTime: string | null
  status: 'AVAILABLE' | 'NOT_YET' | 'EXPIRED' | 'COMPLETED' | 'NOT_SCHEDULED'
  rawScore: number | null
  finalScore: number | null
  feedback: string | null
}

export interface Score {
  id: number
  assignmentId: number
  studentId: number
  studentName: string
  rawScore: number | null
  finalScore: number | null
  completedAt: string
  unityPayload: string | null
  feedback: string | null
}

export type ReportStatus = 'AVAILABLE' | 'NOT_YET' | 'EXPIRED' | 'COMPLETED' | 'NOT_SCHEDULED'

export interface SessionReportRow {
  studentId: number
  studentCode: string | null
  studentName: string
  startTime: string | null
  endTime: string | null
  status: ReportStatus
  rawScore: number | null
  finalScore: number | null
  effectiveScore: number | null
  completedAt: string | null
  feedback: string | null
}

export interface SessionReport {
  classSessionId: number
  classroomId: number
  classroomName: string
  practiceTitle: string
  lessonNumber: number
  rows: SessionReportRow[]
}

export interface ReportColumn {
  classSessionId: number
  practiceTitle: string
  lessonNumber: number
}

export interface ClassroomReportRow {
  studentId: number
  studentCode: string | null
  studentName: string
  scores: (number | null)[]
  average: number | null
  completedCount: number
}

export interface ClassroomReport {
  classroomId: number
  classroomName: string
  teacherName: string
  sessions: ReportColumn[]
  rows: ClassroomReportRow[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}
