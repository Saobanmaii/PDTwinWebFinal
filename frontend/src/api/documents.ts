import api from '@/lib/axios'
import { downloadFile } from '@/lib/download'
import type { ApiResponse, Document } from '@/types'

export async function getDocuments(classroomId: number): Promise<Document[]> {
  const res = await api.get<ApiResponse<Document[]>>(`/classrooms/${classroomId}/documents`)
  return res.data.data
}

export async function uploadDocument(classroomId: number, file: File): Promise<Document> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<ApiResponse<Document>>(
    `/classrooms/${classroomId}/documents`, form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data.data
}

export async function downloadDocument(docId: number, filename: string) {
  await downloadFile(`/documents/${docId}/download`, filename)
}

export async function deleteDocument(docId: number) {
  await api.delete(`/documents/${docId}`)
}
