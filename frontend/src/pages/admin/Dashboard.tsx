import { useQuery } from '@tanstack/react-query'
import AppShell, { Greeting } from '@/components/layout/AppShell'
import StatCard from '@/components/ui/StatCard'
import { getUsers } from '@/api/users'
import { getClassrooms } from '@/api/classrooms'
import { useAuth } from '@/context/AuthContext'
import { Hourglass, GraduationCap } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => getUsers() })
  const { data: classrooms = [] } = useQuery({ queryKey: ['classrooms'], queryFn: getClassrooms })

  const students = users.filter(u => u.role === 'STUDENT').length
  const teachers = users.filter(u => u.role === 'TEACHER').length

  return (
    <AppShell title={<Greeting name={user?.fullName} />}>
      <div className="flex flex-col gap-2 md:flex-row">
        <StatCard label="Tổng sinh viên" value={pad(students)} icon={<Hourglass size={16} />} tone="success" />
        <StatCard label="Tổng giảng viên" value={pad(teachers)} icon={<Hourglass size={16} />} tone="brand" />
        <StatCard label="Lớp học đang hoạt động" value={pad(classrooms.length)} icon={<GraduationCap size={16} />} tone="info" />
      </div>
    </AppShell>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
