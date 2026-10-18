import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Button, { IconButton } from '@/components/ui/Button'
import { SectionTitle, EmptyState } from '@/components/ui/Section'
import { ClassCard } from '@/components/ui/Cards'
import { teacherMeta } from '@/components/ui/cardMeta'
import { Field, Input, Textarea, Select } from '@/components/ui/Field'
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '@/api/classrooms'
import { getUsers } from '@/api/users'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, GraduationCap, Pencil, Trash2 } from 'lucide-react'

export default function ClassroomsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', teacherId: '' })

  const isStudent = user?.role === 'STUDENT'

  const { data: classrooms = [], isLoading } = useQuery({ queryKey: ['classrooms'], queryFn: getClassrooms })
  const { data: teachers = [] } = useQuery({
    queryKey: ['users', 'TEACHER'], queryFn: () => getUsers('TEACHER'),
    enabled: user?.role === 'ADMIN',
  })

  const createMut = useMutation({
    mutationFn: () => createClassroom({
      name: form.name,
      description: form.description || undefined,
      teacherId: form.teacherId ? Number(form.teacherId) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classrooms'] }); toast.success('Tạo lớp thành công'); setModal(null) },
    onError: () => toast.error('Lỗi khi tạo lớp'),
  })

  const updateMut = useMutation({
    mutationFn: () => updateClassroom(editingId!, {
      name: form.name,
      description: form.description || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classrooms'] }); toast.success('Đã cập nhật lớp học'); setModal(null) },
    onError: () => toast.error('Lỗi khi cập nhật lớp'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteClassroom,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classrooms'] }); toast.success('Đã xóa lớp') },
    onError: () => toast.error('Không thể xóa lớp'),
  })

  const openEdit = (c: { id: number; name: string; description: string | null }) => {
    setEditingId(c.id)
    setForm({ name: c.name, description: c.description ?? '', teacherId: '' })
    setModal('edit')
  }

  return (
    <AppShell title="Lớp học">
      <SectionTitle className="px-2.5" action={!isStudent && (
        <Button icon={<Plus size={12} />} onClick={() => { setForm({ name: '', description: '', teacherId: '' }); setModal('create') }}>
          Tạo lớp mới
        </Button>
      )}>
        {isStudent ? 'Lớp học của tôi' : 'Lớp học phụ trách'}
      </SectionTitle>

      {isLoading ? (
        <EmptyState text="Đang tải..." />
      ) : classrooms.length === 0 ? (
        <EmptyState icon={<GraduationCap size={40} />} text="Chưa có lớp học nào" />
      ) : (
        <div className="grid grid-cols-1 gap-4 px-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {classrooms.map(c => (
            <ClassCard key={c.id} to={`/classrooms/${c.id}`} name={c.name} code={c.description ?? undefined}
              meta={[teacherMeta(c.teacherName)]}
              actions={!isStudent && (
                <>
                  <IconButton title="Sửa lớp" onClick={() => openEdit(c)}><Pencil size={12} /></IconButton>
                  <IconButton title="Xóa lớp" className="hover:text-brand-500"
                    onClick={() => { if (confirm(`Xóa lớp "${c.name}"?`)) deleteMut.mutate(c.id) }}>
                    <Trash2 size={12} />
                  </IconButton>
                </>
              )} />
          ))}
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'edit' ? 'Chỉnh sửa lớp học' : 'Tạo lớp mới'}
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setModal(null)}>Hủy</Button>
            <Button size="md" className="w-[90px]" disabled={!form.name}
              onClick={() => modal === 'edit' ? updateMut.mutate() : createMut.mutate()}>
              {modal === 'edit' ? 'Lưu' : 'Tạo'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <Field label="Tên lớp" required>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="VD: Điện Công Nghiệp - Nhóm 1" />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Viết mô tả..." />
          </Field>
          {modal === 'create' && user?.role === 'ADMIN' && (
            <Field label="Giảng viên phụ trách">
              <Select value={form.teacherId} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))}>
                <option value="">— Tự gán cho tôi —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Modal>
    </AppShell>
  )
}
