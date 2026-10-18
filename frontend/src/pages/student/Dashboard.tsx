import { useQuery } from '@tanstack/react-query'
import AppShell, { Greeting } from '@/components/layout/AppShell'
import StatCard from '@/components/ui/StatCard'
import { SectionTitle, MoreLink, Panel, EmptyState } from '@/components/ui/Section'
import { ClassCard, PracticeCard, DeadlineCard } from '@/components/ui/Cards'
import { teacherMeta } from '@/components/ui/cardMeta'
import { myAssignments } from '@/api/practice'
import { getClassrooms } from '@/api/classrooms'
import { useAuth } from '@/context/AuthContext'
import { hasSubmitted } from '@/lib/utils'
import { BookOpen, Check, GraduationCap } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: getClassrooms })
  const { data: assignments = [] } = useQuery({ queryKey: ['my-assignments'], queryFn: myAssignments })

  // Đang trong khung giờ làm bài (kể cả bài đã nộp — vẫn được làm lại tới hết giờ)
  const open = assignments.filter(a => a.status === 'AVAILABLE' || a.status === 'COMPLETED')
  const todo = assignments.filter(a => a.status === 'AVAILABLE')
  const done = assignments.filter(hasSubmitted)
  const upcoming = [...todo].sort((a, b) => (a.endTime ?? '').localeCompare(b.endTime ?? '')).slice(0, 3)

  return (
    <AppShell title={<Greeting name={user?.fullName} />} subtitle="Theo dõi lớp học và các bài thực hành của bạn.">
      <div className="flex flex-col gap-2 md:flex-row">
        <StatCard label="Bài thực hành đang mở" sublabel="Cần hoàn thành" value={pad(todo.length)}
          icon={<BookOpen size={16} />} tone="brand" />
        <StatCard label="Bài thực hành" sublabel="Đã hoàn thành" value={pad(done.length)}
          icon={<Check size={16} />} tone="success" />
        <StatCard label="Lớp học" sublabel="Đã tham gia" value={pad(classrooms.length)}
          icon={<GraduationCap size={16} />} tone="info" />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <Panel className="flex flex-1 flex-col gap-5">
          <SectionTitle action={<MoreLink to="/my-practice" />}>
            <span className="flex items-center gap-4">
              Bài thực hành đang mở
              {open.length > 0 && <span className="size-2 rounded-full bg-success-500 ring-4 ring-success-100" />}
            </span>
          </SectionTitle>
          {open.length === 0 ? (
            <EmptyState icon={<BookOpen size={36} />} text="Không có bài thực hành nào đang mở" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {open.slice(0, 6).map(a => (
                <PracticeCard key={a.id} to={`/practice/${a.id}`} classTag={a.classroomName}
                  title={a.practiceTitle} endTime={a.endTime}
                  actionLabel={a.status === 'COMPLETED' ? 'Làm lại' : 'Thực hành'} />
              ))}
            </div>
          )}
        </Panel>

        <Panel className="flex w-full flex-col gap-7 xl:w-[293px] xl:shrink-0">
          <div className="flex flex-col gap-4">
            <SectionTitle>Hạn nộp gần nhất</SectionTitle>
            {upcoming.length === 0
              ? <p className="text-xs text-muted">Không có hạn nộp nào sắp tới.</p>
              : (
                <div className="flex flex-col gap-2">
                  {upcoming.map((a, i) => (
                    <DeadlineCard key={a.id} to={`/practice/${a.id}`} title={a.practiceTitle} endTime={a.endTime} urgent={i === 0} />
                  ))}
                </div>
              )}
          </div>
          <div className="flex flex-col gap-4">
            <SectionTitle action={<MoreLink to="/classrooms" />}>Lớp học của tôi</SectionTitle>
            {classrooms.length === 0
              ? <p className="text-xs text-muted">Bạn chưa được thêm vào lớp học nào.</p>
              : (
                <div className="flex flex-col gap-2">
                  {classrooms.slice(0, 3).map(c => (
                    <ClassCard key={c.id} to={`/classrooms/${c.id}`} name={c.name} code={c.description ?? undefined}
                      meta={[teacherMeta(c.teacherName)]} />
                  ))}
                </div>
              )}
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
