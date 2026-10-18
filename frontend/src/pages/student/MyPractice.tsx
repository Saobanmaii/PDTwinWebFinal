import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowDownUp } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { SectionTitle } from '@/components/ui/Section'
import { FilterPills } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Field'
import AssignmentTable from '@/components/practice/AssignmentTable'
import { myAssignments } from '@/api/practice'
import { hasSubmitted } from '@/lib/utils'
import type { Assignment } from '@/types'

type Filter = 'all' | 'done' | 'todo' | 'late'

const matches: Record<Filter, (a: Assignment) => boolean> = {
  all: () => true,
  done: a => hasSubmitted(a),
  todo: a => !hasSubmitted(a) && (a.status === 'AVAILABLE' || a.status === 'NOT_YET'),
  late: a => !hasSubmitted(a) && a.status === 'EXPIRED',
}

export default function MyPracticePage() {
  const { data: assignments = [] } = useQuery({ queryKey: ['my-assignments'], queryFn: myAssignments })
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return assignments
      .filter(matches[filter])
      .filter(a => !q || a.practiceTitle.toLowerCase().includes(q) || a.classroomName.toLowerCase().includes(q))
      .sort((a, b) => {
        const cmp = (a.startTime ?? '').localeCompare(b.startTime ?? '')
        return newestFirst ? -cmp : cmp
      })
  }, [assignments, filter, query, newestFirst])

  const count = (f: Filter) => assignments.filter(matches[f]).length

  return (
    <AppShell title="Bài thực hành">
      <SectionTitle className="px-2.5">Tất cả bài thực hành</SectionTitle>

      <div className="flex flex-wrap items-center gap-3 px-2.5">
        <div className="w-full sm:w-[240px]">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm bài thực hành..."
            icon={<Search size={12} />} className="h-8 rounded-full bg-white text-[11px]" />
        </div>
        <FilterPills value={filter} onChange={setFilter} items={[
          { key: 'all', label: 'Tất cả', count: count('all') },
          { key: 'done', label: 'Đã nộp', count: count('done') },
          { key: 'todo', label: 'Chưa nộp', count: count('todo') },
          { key: 'late', label: 'Quá hạn', count: count('late') },
        ]} />
        <button onClick={() => setNewestFirst(v => !v)}
          className="ml-auto flex h-8 items-center gap-2 rounded-full border border-line bg-white px-3 text-[11px] text-muted hover:bg-subtle cursor-pointer">
          <ArrowDownUp size={12} /> Thời gian: <span className="font-medium text-ink">{newestFirst ? 'Gần nhất' : 'Cũ nhất'}</span>
        </button>
      </div>

      <div className="px-2.5">
        <AssignmentTable rows={rows} emptyText="Không có bài thực hành nào" />
      </div>
    </AppShell>
  )
}
