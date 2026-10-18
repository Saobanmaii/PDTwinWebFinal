import api from '@/lib/axios'

export interface PlcJobLogLine {
  t: string
  level: 'info' | 'warn' | 'error'
  msg: string
}

export interface PlcJobStatus {
  jobId: string
  state: 'QUEUED' | 'COMPILING' | 'WRITING' | 'DONE' | 'FAILED'
  stateText: string
  twinPaused: boolean
  log: PlcJobLogLine[]
  error: { message: string } | null
  finishedAt: string | null
}

export interface PlcUploadResult {
  jobId: string
  fileName: string
  sizeBytes: number
  receivedAt: string
}

export async function uploadGxwFile(file: File): Promise<PlcUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<PlcUploadResult>('/plc-submit/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getPlcSubmitStatus(jobId: string): Promise<PlcJobStatus> {
  const res = await api.get<PlcJobStatus>(`/plc-submit/status/${jobId}`)
  return res.data
}

export async function getCurrentPlcJob(): Promise<{ jobId: string | null }> {
  const res = await api.get<{ jobId: string | null }>('/plc-submit/current')
  return res.data
}
