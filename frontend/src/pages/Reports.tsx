import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StatCard from '@/components/ui/StatCard'
import Tabs from '@/components/ui/Tabs'
import { SectionTitle, EmptyState } from '@/components/ui/Section'
import { Field, Select } from '@/components/ui/Field'
import { Table, Th, Td, Tr, DateCell, PersonCell } from '@/components/ui/Table'
import { getClassrooms } from '@/api/classrooms'
import { getClassSessions } from '@/api/practice'
import {
  getSessionReport, getClassroomReport,
  exportSessionReport, exportClassroomReport,
} from '@/api/reports'
import { statusLabel } from '@/lib/utils'
import type { ClassroomReport, SessionReportRow } from '@/types'
import toast from 'react-hot-toast'
import { Download, ChartNoAxesColumn } from 'lucide-react'

type Mode = 'session' | 'classroom'

export default function ReportsPage() {
  const [mode, setMode] = useState<Mode>('session')
  const [classroomId, setClassroomId] = useState('')
  const [classSessionId, setClassSessionId] = useState('')
  const [feedbackModal, setFeedbackModal] = useState<SessionReportRow | null>(null)

  const cid = Number(classroomId)
  const csid = Number(classSessionId)

  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: getClassrooms })
  const { data: classSessions = [] } = useQuery({
    queryKey: ['classSessions', cid],
    queryFn: () => getClassSessions(cid),
    enabled: !!classroomId,
  })

  const { data: sessionReport, isFetching: loadingSession } = useQuery({
    queryKey: ['report', 'session', csid],
    queryFn: () => getSessionReport(csid),
    enabled: mode === 'session' && !!classSessionId,
  })

  const { data: classroomReport, isFetching: loadingClassroom } = useQuery({
    queryKey: ['report', 'classroom', cid],
    queryFn: () => getClassroomReport(cid),
    enabled: mode === 'classroom' && !!classroomId,
  })

  const exportMut = useMutation({
    mutationFn: () => mode === 'session' ? exportSessionReport(csid) : exportClassroomReport(cid),
    onSuccess: () => toast.success('Đã tải file Excel'),
    onError: () => toast.error('Không xuất được file'),
  })

  // Thống kê nhanh, tính ngay từ dữ liệu đã tải về
  const stats = useMemo(() => {
    const values = mode === 'session'
      ? (sessionReport?.rows ?? []).map(r => r.effectiveScore)
      : (classroomReport?.rows ?? []).map(r => r.average)
    const done = values.filter((v): v is number => v != null)
    return {
      total: values.length,
      done: done.length,
      avg: done.length ? done.reduce((a, b) => a + b, 0) / done.length : null,
      max: done.length ? Math.max(...done) : null,
      min: done.length ? Math.min(...done) : null,
    }
  }, [mode, sessionReport, classroomReport])

  const canExport = mode === 'session' ? !!classSessionId : !!classroomId
  const isLoading = mode === 'session' ? loadingSession : loadingClassroom

  const onChangeClassroom = (value: string) => {
    setClassroomId(value)
    setClassSessionId('')
  }

  return (
    <AppShell title="Báo cáo">
      <SectionTitle className="px-2.5">Báo cáo kết quả</SectionTitle>

      <div className="flex flex-col gap-4 px-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="[&>div]:rounded-[10px]">
            <Tabs value={mode} onChange={setMode} items={[
              { key: 'session', label: 'Theo bài thực hành' },
              { key: 'classroom', label: 'Theo lớp' },
            ]} />
          </div>
          <Button icon={<Download size={12} />} onClick={() => exportMut.mutate()} disabled={!canExport || exportMut.isPending}>
            {exportMut.isPending ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Lớp học">
            <Select value={classroomId} onChange={e => onChangeClassroom(e.target.value)} className="bg-white">
              <option value="">Chọn lớp học</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          {mode === 'session' && (
            <Field label="Bài thực hành">
              <Select value={classSessionId} onChange={e => setClassSessionId(e.target.value)} disabled={!classroomId} className="bg-white">
                <option value="">Chọn bài thực hành</option>
                {classSessions.map(cs => <option key={cs.id} value={cs.id}>{cs.practiceTitle}</option>)}
              </Select>
            </Field>
          )}
        </div>

        {/* Thống kê nhanh */}
        {canExport && stats.total > 0 && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <StatCard label={mode === 'session' ? 'Số sinh viên đã làm' : 'Sinh viên đã có điểm'} tone="info"
              value={<>{stats.done} <span className="text-muted">/ {stats.total}</span></>} />
            <StatCard label={mode === 'session' ? 'Điểm trung bình' : 'Trung bình toàn lớp'} tone="ink"
              value={stats.avg != null ? stats.avg.toFixed(2) : '—'} />
            <StatCard label="Điểm cao nhất" tone="success" value={stats.max != null ? String(stats.max) : '—'} />
            <StatCard label="Điểm thấp nhất" tone="brand" value={stats.min != null ? String(stats.min) : '—'} />
          </div>
        )}

        {/* Bảng dữ liệu */}
        {!canExport ? (
          <ReportEmpty text={mode === 'session' ? 'Chọn lớp và bài thực hành để xem báo cáo' : 'Chọn lớp để xem bảng điểm tổng kết'} />
        ) : isLoading ? (
          <ReportEmpty text="Đang tải..." />
        ) : mode === 'session' ? (
          <SessionTable rows={sessionReport?.rows ?? []} onOpenFeedback={setFeedbackModal} />
        ) : (
          <ClassroomTable report={classroomReport} />
        )}
      </div>

      {/* Modal xem nhận xét đầy đủ */}
      <Modal open={feedbackModal !== null} onClose={() => setFeedbackModal(null)}
        title="Nhận xét của giảng viên" subtitle={feedbackModal?.studentName}
        footer={<Button variant="secondary" size="md" onClick={() => setFeedbackModal(null)}>Đóng</Button>}>
        <p className="whitespace-pre-wrap text-sm text-ink">{feedbackModal?.feedback}</p>
      </Modal>
    </AppShell>
  )
}

function SessionTable({ rows, onOpenFeedback }: {
  rows: SessionReportRow[]
  onOpenFeedback: (row: SessionReportRow) => void
}) {
  if (rows.length === 0) return <ReportEmpty text="Lớp này chưa có sinh viên nào" />

  return (
    <Table>
      <thead><tr>
        <Th className="w-12">#</Th>
        <Th>Mã sinh viên</Th>
        <Th>Họ và tên</Th>
        <Th className="text-center">Trạng thái</Th>
        <Th className="text-center">Điểm SV làm</Th>
        <Th className="text-center">Điểm GV chốt</Th>
        <Th className="text-center">Điểm cuối</Th>
        <Th>Thời gian nộp</Th>
        <Th className="text-center">Nhận xét</Th>
      </tr></thead>
      <tbody>
        {rows.map((r, i) => {
          const st = statusLabel(r.status)
          return (
            <Tr key={r.studentId}>
              <Td className="text-muted">{i + 1}</Td>
              <Td className="text-brand-500">{r.studentCode ?? '—'}</Td>
              <Td><PersonCell name={r.studentName} /></Td>
              <Td className="text-center"><Badge label={st.label} tone={st.tone} /></Td>
              <Td className="text-center">{fmt(r.rawScore)}</Td>
              <Td className="text-center">{fmt(r.finalScore)}</Td>
              <Td className="text-center text-success-500">{fmt(r.effectiveScore)}</Td>
              <Td><DateCell value={r.completedAt} /></Td>
              <Td className="text-center">
                {r.feedback
                  ? <button onClick={() => onOpenFeedback(r)} className="text-[11px] text-brand-500 hover:underline cursor-pointer">Xem</button>
                  : '—'}
              </Td>
            </Tr>
          )
        })}
      </tbody>
    </Table>
  )
}

function ClassroomTable({ report }: { report?: ClassroomReport }) {
  if (!report) return null
  if (report.sessions.length === 0) return <ReportEmpty text="Lớp này chưa có bài thực hành nào" />
  if (report.rows.length === 0) return <ReportEmpty text="Lớp này chưa có sinh viên nào" />

  return (
    <Table>
      <thead><tr>
        <Th className="w-12">#</Th>
        <Th>Mã sinh viên</Th>
        <Th>Họ và tên</Th>
        {report.sessions.map((s, i) => (
          <Th key={s.classSessionId} className="text-center" title={s.practiceTitle}>Bài {i + 1}</Th>
        ))}
        <Th className="text-center">Đã làm</Th>
        <Th className="text-center">Điểm trung bình</Th>
      </tr></thead>
      <tbody>
        {report.rows.map((r, i) => (
          <Tr key={r.studentId}>
            <Td className="text-muted">{i + 1}</Td>
            <Td className="text-brand-500">{r.studentCode ?? '—'}</Td>
            <Td><PersonCell name={r.studentName} /></Td>
            {r.scores.map((v, j) => (
              <Td key={j} className="text-center">{v ?? '—'}</Td>
            ))}
            <Td className="text-center">{r.completedCount}/{report.sessions.length} bài</Td>
            <Td className="text-center text-success-500">{r.average != null ? `${r.average}/10` : '—'}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}

function fmt(v: number | null) {
  return v != null ? `${v}/10` : '—'
}

function ReportEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-[10px] bg-white shadow-card">
      <EmptyState icon={<ChartNoAxesColumn size={40} />} text={text} />
    </div>
  )
}
