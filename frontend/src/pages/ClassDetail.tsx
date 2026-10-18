import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Badge, { Tag } from '@/components/ui/Badge'
import Button, { IconButton } from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { Table, Th, Td, Tr, EmptyRow, DateCell, PersonCell } from '@/components/ui/Table'
import { Field, Input, Textarea, Select } from '@/components/ui/Field'
import AssignmentTable from '@/components/practice/AssignmentTable'
import { getClassroom, getMembers, importMembers, removeMember } from '@/api/classrooms'
import { getDocuments, uploadDocument, deleteDocument, downloadDocument } from '@/api/documents'
import { getClassSessions, getPracticeSessions, addSessionToClassroom, myAssignments,
         removeSessionFromClassroom, getAssignments, batchAssign, deleteAssignment } from '@/api/practice'
import { getScoresByClassSession, gradeScore } from '@/api/scores'
import { useAuth } from '@/context/AuthContext'
import { formatDate, statusLabel } from '@/lib/utils'
import type { Assignment, ClassSession, Score } from '@/types'
import toast from 'react-hot-toast'
import { ChevronLeft, Upload, Trash2, Download, Plus, UserMinus, FileText,
         UserRound, BookOpen, FileText as DocIcon, CalendarClock } from 'lucide-react'

type Tab = 'sessions' | 'documents' | 'members'

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const cid = Number(id)
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('sessions')
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [scheduleModal, setScheduleModal] = useState(false)
  const [scoresModal, setScoresModal] = useState(false)
  const [addSessionModal, setAddSessionModal] = useState(false)
  const [selectedPracticeId, setSelectedPracticeId] = useState('')
  const [payloadModal, setPayloadModal] = useState<Score | null>(null)
  const [scoreModalTarget, setScoreModalTarget] = useState<Score | null>(null)
  const [scoreInput, setScoreInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const isReadOnly = user?.role === 'STUDENT'

  const { data: classroom } = useQuery({ queryKey: ['classroom', cid], queryFn: () => getClassroom(cid) })
  const { data: members = [] } = useQuery({ queryKey: ['members', cid], queryFn: () => getMembers(cid) })
  const { data: documents = [] } = useQuery({ queryKey: ['documents', cid], queryFn: () => getDocuments(cid) })
  const { data: classSessions = [] } = useQuery({ queryKey: ['classSessions', cid], queryFn: () => getClassSessions(cid) })
  const { data: allPractice = [] } = useQuery({ queryKey: ['practice-sessions'], queryFn: getPracticeSessions, enabled: !isReadOnly })
  const { data: mine = [] } = useQuery({ queryKey: ['my-assignments'], queryFn: myAssignments, enabled: isReadOnly })
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', selectedSession?.id],
    queryFn: () => getAssignments(selectedSession!.id),
    enabled: !!selectedSession,
  })
  const { data: scores = [] } = useQuery({
    queryKey: ['scores', selectedSession?.id],
    queryFn: () => getScoresByClassSession(selectedSession!.id),
    enabled: !!selectedSession,
  })

  const sessionIds = new Set(classSessions.map(cs => cs.id))
  const myInClass = mine.filter(a => sessionIds.has(a.classSessionId))

  const importMut = useMutation({
    mutationFn: (file: File) => importMembers(cid, file),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['members', cid] }); toast.success(`Đã thêm ${data.length} sinh viên`) },
    onError: () => toast.error('Lỗi import'),
  })

  const removeMemberMut = useMutation({
    mutationFn: (sid: number) => removeMember(cid, sid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members', cid] }); toast.success('Đã xóa sinh viên') },
  })

  const uploadDocMut = useMutation({
    mutationFn: (file: File) => uploadDocument(cid, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents', cid] }); toast.success('Upload thành công') },
    onError: () => toast.error('Chỉ chấp nhận file PDF'),
  })

  const deleteDocMut = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents', cid] }); toast.success('Đã xóa tài liệu') },
  })

  const addSessionMut = useMutation({
    mutationFn: () => addSessionToClassroom(cid, Number(selectedPracticeId)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classSessions', cid] }); toast.success('Đã thêm bài thực hành'); setAddSessionModal(false) },
    onError: () => toast.error('Bài đã có trong lớp hoặc lỗi khác'),
  })

  const removeSessionMut = useMutation({
    mutationFn: (csId: number) => removeSessionFromClassroom(cid, csId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classSessions', cid] }); toast.success('Đã bỏ bài thực hành') },
  })

  const [scheduleData, setScheduleData] = useState<Record<number, { startTime: string; endTime: string }>>({})

  const openSchedule = (cs: ClassSession) => {
    setSelectedSession(cs)
    setScheduleModal(true)
  }

  const openScores = (cs: ClassSession) => {
    setSelectedSession(cs)
    setScoresModal(true)
  }

  useEffect(() => {
    if (!scheduleModal) return
    const init: Record<number, { startTime: string; endTime: string }> = {}
    members.forEach(m => {
      const a = assignMap[m.id]
      init[m.id] = {
        startTime: a?.startTime?.slice(0, 16) ?? '',
        endTime: a?.endTime?.slice(0, 16) ?? '',
      }
    })
    setScheduleData(init)
  }, [assignments, scheduleModal])

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = Object.entries(scheduleData)
        .filter(([, v]) => v.startTime && v.endTime)
        .map(([sid, v]) => ({ studentId: Number(sid), ...v }))
      return batchAssign(selectedSession!.id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments', selectedSession?.id] })
      toast.success('Đã lưu lịch')
      setScheduleModal(false)
    },
    onError: () => toast.error('Lỗi lưu lịch'),
  })

  const finalScoreMut = useMutation({
    mutationFn: ({ scoreId, v, feedback }: { scoreId: number; v: number; feedback: string }) =>
      gradeScore(scoreId, { finalScore: v, feedback }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scores', selectedSession?.id] })
      toast.success('Đã lưu điểm và nhận xét')
      setScoreModalTarget(null)
    },
    onError: () => toast.error('Lỗi khi chốt điểm'),
  })

  const openScoreModal = (score: Score) => {
    setScoreModalTarget(score)
    setScoreInput(String(score.finalScore ?? score.rawScore ?? ''))
    setFeedbackInput(score.feedback ?? '')
  }

  const downloadDocMut = useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) => downloadDocument(id, filename),
    onError: () => toast.error('Không tải được tài liệu'),
  })

  const deleteAssignmentMut = useMutation({
    mutationFn: (id: number) => deleteAssignment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments', selectedSession?.id] }); toast.success('Đã hủy lịch') },
    onError: () => toast.error('Không thể hủy lịch'),
  })

  const scoreMap = Object.fromEntries(scores.map(s => [s.assignmentId, s]))
  const assignMap = Object.fromEntries(assignments.map((a: Assignment) => [a.studentId, a]))
  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))

  const sessionCount = isReadOnly ? myInClass.length : classSessions.length
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'sessions', label: 'Bài thực hành', count: sessionCount },
    { key: 'documents', label: 'Tài liệu', count: documents.length },
    { key: 'members', label: 'Sinh viên', count: members.length },
  ]

  const clearSchedule = (studentId: number) => {
    const a = assignMap[studentId]
    if (a && !scoreMap[a.id]) {
      if (!confirm('Hủy lịch đã lưu của sinh viên này?')) return
      deleteAssignmentMut.mutate(a.id)
    }
    setScheduleData(p => ({ ...p, [studentId]: { startTime: '', endTime: '' } }))
  }

  return (
    <AppShell title="Lớp học">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-2.5 text-[11px]">
        <Link to="/classrooms" className="flex items-center gap-1 text-muted hover:text-ink">
          <ChevronLeft size={12} /> Lớp học
        </Link>
        <span className="text-muted">/</span>
        <span className="font-medium text-ink">{classroom?.name}</span>
      </div>

      {/* Thông tin lớp */}
      <div className="flex w-full max-w-[520px] flex-col items-start gap-3 rounded-[10px] bg-white px-4 py-3.5 shadow-card">
        <Tag>{classroom?.name}</Tag>
        {classroom?.description && <p className="text-xs leading-4 text-ink">{classroom.description}</p>}
        <div className="flex flex-wrap items-center gap-4 text-xs font-light text-info-500">
          {isReadOnly
            ? <span className="flex items-center gap-2"><UserRound size={12} /> GV: {classroom?.teacherName}</span>
            : <span className="flex items-center gap-2"><UserRound size={12} /> {members.length} sinh viên</span>}
          <span className="flex items-center gap-2"><DocIcon size={12} /> {documents.length} tài liệu</span>
          <span className="flex items-center gap-2"><BookOpen size={12} /> {classSessions.length} bài thực hành</span>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Tabs + nút thao tác của tab */}
        <div className="flex flex-wrap items-center gap-3.5">
          <Tabs items={tabs} value={tab} onChange={setTab} />
          {!isReadOnly && tab === 'sessions' && (
            <Button variant="outline" icon={<Plus size={12} />} onClick={() => { setSelectedPracticeId(''); setAddSessionModal(true) }}>
              Thêm bài thực hành
            </Button>
          )}
          {!isReadOnly && tab === 'documents' && (
            <>
              <input ref={docInputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadDocMut.mutate(f); e.target.value = '' }} />
              <Button variant="outline" icon={<Upload size={12} />} onClick={() => docInputRef.current?.click()}>
                Thêm tài liệu
              </Button>
            </>
          )}
          {!isReadOnly && tab === 'members' && (
            <>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) importMut.mutate(f); e.target.value = '' }} />
              <Button variant="outline" icon={<Upload size={12} />} onClick={() => fileInputRef.current?.click()}>
                Tải lên file Excel
              </Button>
            </>
          )}
        </div>

        {/* ── Bài thực hành ── */}
        {tab === 'sessions' && (isReadOnly ? (
          <AssignmentTable rows={myInClass} attached emptyText="Chưa có bài thực hành nào được phân cho bạn" />
        ) : (
          <Table attached>
            <thead><tr>
              <Th>Bài thực hành</Th>
              <Th>Scene</Th>
              <Th>Thao tác</Th>
            </tr></thead>
            <tbody>
              {classSessions.map(cs => (
                <Tr key={cs.id}>
                  <Td className="text-sm font-medium">{cs.practiceTitle}</Td>
                  <Td className="text-[11px] text-muted">{cs.unitySceneName}</Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Button onClick={() => openSchedule(cs)}>Phân lịch</Button>
                      <Button variant="outline" onClick={() => openScores(cs)}>Xem danh sách và điểm</Button>
                      <IconButton title="Bỏ bài khỏi lớp" className="hover:text-brand-500"
                        onClick={() => { if (confirm('Bỏ bài này khỏi lớp?')) removeSessionMut.mutate(cs.id) }}>
                        <Trash2 size={12} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
              {classSessions.length === 0 && <EmptyRow colSpan={3} text="Chưa có bài thực hành" />}
            </tbody>
          </Table>
        ))}

        {/* ── Tài liệu ── */}
        {tab === 'documents' && (
          <Table attached>
            <thead><tr>
              <Th className="w-12">#</Th>
              <Th>Loại</Th>
              <Th>Tên tài liệu</Th>
              <Th>Người đăng</Th>
              <Th>Ngày đăng</Th>
              <Th />
            </tr></thead>
            <tbody>
              {documents.map((d, i) => (
                <Tr key={d.id}>
                  <Td className="text-muted">{i + 1}</Td>
                  <Td className="text-muted uppercase">{d.filename.split('.').pop()}</Td>
                  <Td>{d.filename}</Td>
                  <Td className="text-muted">{d.uploadedByName}</Td>
                  <Td className="text-muted">{formatDate(d.uploadedAt)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => downloadDocMut.mutate({ id: d.id, filename: d.filename })}
                        className="flex items-center gap-1.5 text-[11px] text-brand-500 hover:underline cursor-pointer">
                        Tải <Download size={12} />
                      </button>
                      {!isReadOnly && (
                        <IconButton title="Xóa tài liệu" className="hover:text-brand-500"
                          onClick={() => { if (confirm('Xóa tài liệu này?')) deleteDocMut.mutate(d.id) }}>
                          <Trash2 size={12} />
                        </IconButton>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
              {documents.length === 0 && <EmptyRow colSpan={6} text="Chưa có tài liệu" />}
            </tbody>
          </Table>
        )}

        {/* ── Sinh viên ── */}
        {tab === 'members' && (
          <Table attached>
            <thead><tr>
              <Th className="w-12">#</Th>
              <Th>Mã sinh viên</Th>
              <Th>Họ và tên</Th>
              <Th>Tài khoản</Th>
              {!isReadOnly && <Th />}
            </tr></thead>
            <tbody>
              {members.map((m, i) => (
                <Tr key={m.id}>
                  <Td className="text-muted">{i + 1}</Td>
                  <Td className="text-brand-500">{m.studentId ?? '—'}</Td>
                  <Td><PersonCell name={m.fullName} /></Td>
                  <Td className="text-muted">{m.username}</Td>
                  {!isReadOnly && (
                    <Td className="text-right">
                      <IconButton title="Xóa khỏi lớp" className="hover:text-brand-500"
                        onClick={() => { if (confirm('Xóa sinh viên này?')) removeMemberMut.mutate(m.id) }}>
                        <UserMinus size={12} />
                      </IconButton>
                    </Td>
                  )}
                </Tr>
              ))}
              {members.length === 0 && <EmptyRow colSpan={5} text="Chưa có sinh viên" />}
            </tbody>
          </Table>
        )}
      </div>

      {/* Thêm bài thực hành vào lớp */}
      <Modal open={addSessionModal} onClose={() => setAddSessionModal(false)} title="Thêm bài thực hành vào lớp" size="lg"
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setAddSessionModal(false)}>Hủy</Button>
            <Button size="md" className="w-[90px]" onClick={() => addSessionMut.mutate()} disabled={!selectedPracticeId}>Thêm</Button>
          </>
        }>
        <Field label="Chọn bài thực hành">
          <Select value={selectedPracticeId} onChange={e => setSelectedPracticeId(e.target.value)}>
            <option value="">— Chọn bài —</option>
            {allPractice
              .filter(p => !classSessions.some(cs => cs.practiceSessionId === p.id))
              .map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
        </Field>
      </Modal>

      {/* Phân lịch */}
      <Modal open={scheduleModal} onClose={() => setScheduleModal(false)} size="lg"
        title="Phân lịch" subtitle={selectedSession?.practiceTitle}
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setScheduleModal(false)}>Hủy</Button>
            <Button size="md" className="w-[90px]" onClick={() => saveMut.mutate()}>Lưu</Button>
          </>
        }>
        <div className="flex flex-col gap-3">
          {members.map(m => (
            <div key={m.id} className="flex flex-col gap-3 rounded-[10px] border border-line p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium"><PersonCell name={m.fullName} /></span>
                <IconButton title="Bỏ lịch" className="hover:text-brand-500" onClick={() => clearSchedule(m.id)}>
                  <Trash2 size={12} />
                </IconButton>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="px-1 text-xs text-muted">Bắt đầu</span>
                  <Input type="datetime-local" value={scheduleData[m.id]?.startTime ?? ''}
                    onChange={e => setScheduleData(p => ({ ...p, [m.id]: { ...p[m.id], startTime: e.target.value } }))} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="px-1 text-xs text-muted">Kết thúc</span>
                  <Input type="datetime-local" value={scheduleData[m.id]?.endTime ?? ''}
                    onChange={e => setScheduleData(p => ({ ...p, [m.id]: { ...p[m.id], endTime: e.target.value } }))} />
                </label>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-info-100 py-6 text-xs text-info-500">
              <CalendarClock size={18} />
              Lớp chưa có sinh viên — hãy tải lên file Excel ở tab Sinh viên.
            </div>
          )}
        </div>
      </Modal>

      {/* Danh sách và điểm của một bài */}
      <Modal open={scoresModal} onClose={() => setScoresModal(false)} size="xl"
        title={selectedSession?.practiceTitle ?? ''}>
        <Table className="border border-line shadow-none">
          <thead><tr>
            <Th>Tên sinh viên</Th>
            <Th>MSV</Th>
            <Th>Bắt đầu</Th>
            <Th>Kết thúc</Th>
            <Th>Trạng thái</Th>
            <Th className="text-center">Điểm SV</Th>
            <Th className="text-center">Điểm GV chốt</Th>
            <Th>Đánh giá</Th>
            <Th className="text-center">Thao tác</Th>
          </tr></thead>
          <tbody>
            {assignments.map((a: Assignment) => {
              const score = scoreMap[a.id]
              const st = statusLabel(score ? 'COMPLETED' : a.status)
              return (
                <Tr key={a.id}>
                  <Td><PersonCell name={a.studentName} /></Td>
                  <Td className="text-muted">{a.studentCode ?? memberMap[a.studentId]?.studentId ?? '—'}</Td>
                  <Td><DateCell value={a.startTime} /></Td>
                  <Td><DateCell value={a.endTime} /></Td>
                  <Td><Badge label={st.label} tone={st.tone} /></Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                      <span>{score?.rawScore != null ? `${score.rawScore}/10` : '—'}</span>
                      {score?.unityPayload && (
                        <IconButton title="Xem dữ liệu Unity" onClick={() => setPayloadModal(score)}><FileText size={12} /></IconButton>
                      )}
                    </div>
                  </Td>
                  <Td className="text-center whitespace-nowrap">
                    {score?.finalScore != null
                      ? <span className="font-semibold text-success-500">{score.finalScore}/10</span>
                      : score ? <span className="text-[11px] text-muted">Chưa chốt</span> : '—'}
                  </Td>
                  <Td className="min-w-[200px] max-w-[320px]">
                    {score?.feedback
                      ? <p className="line-clamp-3 text-[11px] leading-4" title={score.feedback}>{score.feedback}</p>
                      : <span className="text-muted">—</span>}
                  </Td>
                  <Td className="text-center">
                    {score ? (
                      <Button variant={score.finalScore != null ? 'outline' : 'primary'} onClick={() => openScoreModal(score)}>
                        {score.finalScore != null ? 'Sửa điểm' : 'Chốt điểm'}
                      </Button>
                    ) : (
                      <IconButton title="Hủy lịch" className="hover:text-brand-500"
                        onClick={() => { if (confirm('Hủy lịch của sinh viên này?')) deleteAssignmentMut.mutate(a.id) }}>
                        <Trash2 size={12} />
                      </IconButton>
                    )}
                  </Td>
                </Tr>
              )
            })}
            {assignments.length === 0 && <EmptyRow colSpan={9} text="Chưa phân lịch cho sinh viên nào" />}
          </tbody>
        </Table>
      </Modal>

      {/* Chốt điểm */}
      <Modal open={scoreModalTarget !== null} onClose={() => setScoreModalTarget(null)}
        title="Chốt điểm" subtitle={scoreModalTarget?.studentName}
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setScoreModalTarget(null)}>Hủy</Button>
            <Button size="md" className="w-[90px]"
              onClick={() => {
                const n = Number(scoreInput)
                if (scoreInput.trim() === '' || isNaN(n)) { toast.error('Điểm không hợp lệ'); return }
                finalScoreMut.mutate({ scoreId: scoreModalTarget!.id, v: n, feedback: feedbackInput })
              }}>
              Lưu
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <p className="px-2 text-xs text-muted">
            Điểm sinh viên làm được: <span className="font-medium text-ink">{scoreModalTarget?.rawScore ?? '—'}</span>
          </p>
          <Field label="Điểm chốt" required>
            <Input type="number" step="0.1" value={scoreInput} onChange={e => setScoreInput(e.target.value)} />
          </Field>
          <Field label="Nhận xét cho sinh viên" hint="Sinh viên sẽ đọc được nhận xét này ở trang bài thực hành của mình.">
            <Textarea value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} rows={4}
              placeholder="VD: Đấu nối đúng nhưng còn chậm, cần luyện thêm bước kiểm tra nguồn." />
          </Field>
        </div>
      </Modal>

      {/* Dữ liệu Unity */}
      <Modal open={payloadModal !== null} onClose={() => setPayloadModal(null)} size="lg"
        title="Chi tiết dữ liệu Unity" subtitle={payloadModal?.studentName}
        footer={<Button variant="secondary" size="md" onClick={() => setPayloadModal(null)}>Đóng</Button>}>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-[10px] border border-line bg-subtle p-3 text-xs">
          {(() => {
            if (!payloadModal?.unityPayload) return ''
            try {
              return JSON.stringify(JSON.parse(payloadModal.unityPayload), null, 2)
            } catch {
              return payloadModal.unityPayload
            }
          })()}
        </pre>
      </Modal>
    </AppShell>
  )
}
