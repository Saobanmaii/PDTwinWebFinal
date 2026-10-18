import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import AppShell, { Greeting } from '@/components/layout/AppShell'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { SectionTitle, MoreLink, Panel } from '@/components/ui/Section'
import { ClassCard } from '@/components/ui/Cards'
import { teacherMeta } from '@/components/ui/cardMeta'
import { Table, Th, Td, Tr, EmptyRow, DateCell, PersonCell } from '@/components/ui/Table'
import { getClassrooms } from '@/api/classrooms'
import { getClassSessions } from '@/api/practice'
import { getScoresByClassSession } from '@/api/scores'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Hourglass, GraduationCap } from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: getClassrooms })

  // Lớp → các bài trong lớp → điểm của từng bài; bài nào SV đã nộp mà GV chưa chốt là "chờ chấm"
  const sessionQueries = useQueries({
    queries: classrooms.map(c => ({ queryKey: ['classSessions', c.id], queryFn: () => getClassSessions(c.id) })),
  })
  const sessions = sessionQueries.flatMap((q, i) =>
    (q.data ?? []).map(cs => ({ ...cs, classroomName: classrooms[i].name })))

  const scoreQueries = useQueries({
    queries: sessions.map(cs => ({ queryKey: ['scores', cs.id], queryFn: () => getScoresByClassSession(cs.id) })),
  })
  const pending = scoreQueries
    .flatMap((q, i) => (q.data ?? []).map(s => ({ ...s, session: sessions[i] })))
    .filter(s => s.finalScore == null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))

  const today = new Date().toDateString()
  const pendingToday = pending.filter(s => new Date(s.completedAt).toDateString() === today).length

  return (
    <AppShell title={<Greeting name={user?.fullName} />} subtitle="Theo dõi lớp học và cập nhật tiến độ của sinh viên.">
      <div className="flex flex-col gap-2 md:flex-row">
        <StatCard label="Bài thực hành chờ chấm" sublabel={`${pendingToday} bài nộp trong hôm nay`} value={pad(pending.length)}
          icon={<BookOpen size={16} />} tone="brand" />
        <StatCard label="Bài thực hành trong các lớp" sublabel="Đã thêm vào lớp" value={pad(sessions.length)}
          icon={<Hourglass size={16} />} tone="success" />
        <StatCard label="Lớp học phụ trách" sublabel="Đang giảng dạy" value={pad(classrooms.length)}
          icon={<GraduationCap size={16} />} tone="info" />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <Panel className="flex min-w-0 flex-1 flex-col gap-5">
          <SectionTitle>Bài thực hành chờ chấm</SectionTitle>
          <Table className="border border-line shadow-none">
            <thead><tr>
              <Th>Họ và tên</Th>
              <Th>Lớp</Th>
              <Th>Bài thực hành</Th>
              <Th>Thời gian nộp</Th>
              <Th>Điểm thô</Th>
              <Th />
            </tr></thead>
            <tbody>
              {pending.slice(0, 8).map(s => (
                <Tr key={s.id}>
                  <Td><PersonCell name={s.studentName} /></Td>
                  <Td className="text-info-500">{s.session.classroomName}</Td>
                  <Td className="max-w-[220px] truncate">{s.session.practiceTitle}</Td>
                  <Td><DateCell value={s.completedAt} /></Td>
                  <Td className="text-info-500">{s.rawScore != null ? `${s.rawScore}/10` : '—'}</Td>
                  <Td className="text-right">
                    <Button onClick={() => navigate(`/classrooms/${s.session.classroomId}`)}>Chấm điểm</Button>
                  </Td>
                </Tr>
              ))}
              {pending.length === 0 && <EmptyRow colSpan={6} text="Không có bài nào đang chờ chấm" />}
            </tbody>
          </Table>
        </Panel>

        <Panel className="flex w-full flex-col gap-4 xl:w-[293px] xl:shrink-0">
          <SectionTitle action={<MoreLink to="/classrooms" />}>Lớp học của tôi</SectionTitle>
          {classrooms.length === 0
            ? <p className="text-xs text-muted">Chưa có lớp học nào.</p>
            : (
              <div className="flex flex-col gap-2">
                {classrooms.slice(0, 4).map(c => (
                  <ClassCard key={c.id} to={`/classrooms/${c.id}`} name={c.name} code={c.description ?? undefined}
                    meta={[teacherMeta(c.teacherName)]} />
                ))}
              </div>
            )}
        </Panel>
      </div>
    </AppShell>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
