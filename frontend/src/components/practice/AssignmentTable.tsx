import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Table, Th, Td, Tr, EmptyRow, DateCell } from '@/components/ui/Table'
import { displayStatus, statusLabel } from '@/lib/utils'
import type { Assignment } from '@/types'

/** Bảng bài thực hành của sinh viên — dùng ở trang "Bài thực hành" và tab trong chi tiết lớp */
export default function AssignmentTable({ rows, attached, emptyText }: {
  rows: Assignment[]
  attached?: boolean
  emptyText: string
}) {
  const [feedback, setFeedback] = useState<Assignment | null>(null)

  return (
    <>
      <Table attached={attached}>
        <thead><tr>
          <Th>Bài thực hành</Th>
          <Th>Thời gian bắt đầu</Th>
          <Th>Thời gian kết thúc</Th>
          <Th>Trạng thái</Th>
          <Th>Điểm</Th>
          <Th className="text-center">Nhận xét của GV</Th>
          <Th className="text-center">Thao tác</Th>
        </tr></thead>
        <tbody>
          {rows.map(a => {
            const st = statusLabel(displayStatus(a))
            const score = a.finalScore ?? a.rawScore
            return (
              <Tr key={a.id}>
                <Td>
                  <div className="text-sm font-medium leading-[18px]">{a.practiceTitle}</div>
                  <div className="mt-0.5 text-[11px] text-muted">{a.classroomName}</div>
                </Td>
                <Td><DateCell value={a.startTime} /></Td>
                <Td><DateCell value={a.endTime} /></Td>
                <Td><Badge label={st.label} tone={st.tone} /></Td>
                <Td>{score != null ? `${score}/10` : '—'}</Td>
                <Td className="text-center">
                  {a.feedback
                    ? <button onClick={() => setFeedback(a)} className="text-[11px] text-brand-500 hover:underline cursor-pointer">Xem</button>
                    : '—'}
                </Td>
                <Td className="text-center">
                  {a.status === 'AVAILABLE' && (
                    <Link to={`/practice/${a.id}`}
                      className="inline-flex h-[30px] items-center rounded bg-brand-500 px-3 text-xs font-medium text-white hover:bg-brand-700">
                      Thực hành
                    </Link>
                  )}
                  {a.status === 'COMPLETED' && (
                    <Link to={`/practice/${a.id}`}
                      className="inline-flex h-[30px] items-center rounded border-[0.5px] border-brand-500 px-4 text-xs font-medium text-brand-500 hover:bg-brand-100">
                      Làm lại
                    </Link>
                  )}
                </Td>
              </Tr>
            )
          })}
          {rows.length === 0 && <EmptyRow colSpan={7} text={emptyText} />}
        </tbody>
      </Table>

      <Modal open={feedback !== null} onClose={() => setFeedback(null)} size="lg"
        title="Nhận xét của giảng viên" subtitle={feedback?.practiceTitle}
        footer={<Button variant="secondary" onClick={() => setFeedback(null)}>Đóng</Button>}>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted">
            Điểm: <span className="font-semibold text-ink">{feedback?.finalScore ?? feedback?.rawScore ?? '—'}</span>
          </p>
          <p className="whitespace-pre-wrap text-sm text-ink">{feedback?.feedback}</p>
        </div>
      </Modal>
    </>
  )
}
