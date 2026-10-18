import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button, { IconButton } from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { Table, Th, Td, Tr, EmptyRow, PersonCell } from '@/components/ui/Table'
import { Field, Input, PasswordInput, Select } from '@/components/ui/Field'
import { getUsers, createTeacher, updateUser, deleteUser } from '@/api/users'
import type { Role, User } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Lock, LockOpen } from 'lucide-react'

const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Admin', TEACHER: 'Giảng viên', STUDENT: 'Sinh viên' }

export default function UsersPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'TEACHER' | 'STUDENT'>('TEACHER')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [lockTarget, setLockTarget] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'STUDENT' as Role })

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users', tab], queryFn: () => getUsers(tab) })
  const { data: teachers = [] } = useQuery({ queryKey: ['users', 'TEACHER'], queryFn: () => getUsers('TEACHER') })
  const { data: students = [] } = useQuery({ queryKey: ['users', 'STUDENT'], queryFn: () => getUsers('STUDENT') })

  const createMut = useMutation({
    mutationFn: () => createTeacher(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Tạo tài khoản thành công'); setModal(null) },
    onError: () => toast.error('Lỗi khi tạo tài khoản'),
  })

  const updateMut = useMutation({
    mutationFn: () => updateUser(selected!.id, { fullName: form.fullName, role: form.role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Cập nhật thành công'); setModal(null) },
    onError: () => toast.error('Lỗi cập nhật'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Đã khóa tài khoản'); setLockTarget(null) },
  })

  const toggleActiveMut = useMutation({
    mutationFn: (u: User) => updateUser(u.id, { active: !u.active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Đã mở khóa tài khoản') },
    onError: () => toast.error('Lỗi cập nhật trạng thái'),
  })

  const openCreate = () => { setForm({ username: '', fullName: '', password: '', role: tab }); setModal('create') }
  const openEdit = (u: User) => { setSelected(u); setForm({ username: u.username, fullName: u.fullName, password: '', role: u.role }); setModal('edit') }

  const isStudentTab = tab === 'STUDENT'

  return (
    <AppShell title="Quản lý người dùng">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3.5">
          <Tabs value={tab} onChange={setTab} items={[
            { key: 'TEACHER', label: 'Giảng viên', count: teachers.length },
            { key: 'STUDENT', label: 'Sinh viên', count: students.length },
          ]} />
          {tab === 'TEACHER' && (
            <Button variant="outline" icon={<Plus size={12} />} onClick={openCreate}>Thêm giảng viên</Button>
          )}
        </div>

        <Table attached>
          <thead><tr>
            <Th className="w-12">#</Th>
            <Th>Họ và tên</Th>
            {isStudentTab && <Th className="text-center">MSV</Th>}
            <Th className="text-center">Tài khoản</Th>
            <Th className="text-center">Trạng thái</Th>
            <Th className="text-center">Thao tác</Th>
          </tr></thead>
          <tbody>
            {users.map((u, i) => (
              <Tr key={u.id}>
                <Td className="text-muted">{i + 1}</Td>
                <Td><PersonCell name={u.fullName} /></Td>
                {isStudentTab && <Td className="text-center">{u.studentId ?? '—'}</Td>}
                <Td className="text-center">{u.username}</Td>
                <Td className="text-center">
                  <Badge label={u.active ? 'Hoạt động' : 'Bị khóa'} tone={u.active ? 'success' : 'neutral'} className="min-w-[74px]" />
                </Td>
                <Td>
                  <div className="flex items-center justify-center gap-2">
                    <IconButton title="Chỉnh sửa" onClick={() => openEdit(u)}><Pencil size={12} /></IconButton>
                    {u.active ? (
                      <IconButton title="Khóa tài khoản" className="hover:text-brand-500" onClick={() => setLockTarget(u)}>
                        <Lock size={12} />
                      </IconButton>
                    ) : (
                      <IconButton title="Mở khóa" className="hover:text-success-500" onClick={() => toggleActiveMut.mutate(u)}>
                        <LockOpen size={12} />
                      </IconButton>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {!isLoading && users.length === 0 && <EmptyRow colSpan={6} text="Chưa có dữ liệu" />}
            {isLoading && <EmptyRow colSpan={6} text="Đang tải..." />}
          </tbody>
        </Table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Thêm giảng viên' : 'Chỉnh sửa người dùng'}
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setModal(null)}>Hủy</Button>
            <Button size="md" className="w-[90px]" onClick={() => modal === 'create' ? createMut.mutate() : updateMut.mutate()}>
              {modal === 'create' ? 'Tạo' : 'Lưu'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          {modal === 'create' && (
            <Field label="Tên đăng nhập" required>
              <Input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="VD: gv001" />
            </Field>
          )}
          <Field label="Họ và tên" required>
            <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nhập họ và tên..." />
          </Field>
          {modal === 'create' && (
            <Field label="Mật khẩu" hint="Để trống sẽ dùng tên đăng nhập làm mật khẩu">
              <PasswordInput value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </Field>
          )}
          {modal === 'edit' && (
            <Field label="Vai trò">
              <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}>
                {(['ADMIN', 'TEACHER', 'STUDENT'] as Role[]).map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      <Modal open={lockTarget !== null} onClose={() => setLockTarget(null)} size="sm" title="Khóa tài khoản"
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setLockTarget(null)}>Hủy</Button>
            <Button size="md" className="w-[90px]" onClick={() => deleteMut.mutate(lockTarget!.id)}>Khóa</Button>
          </>
        }>
        <p className="text-sm text-ink">
          Bạn có chắc muốn khóa tài khoản <span className="font-semibold">{lockTarget?.fullName}</span>? Người dùng sẽ không đăng nhập được nữa.
        </p>
      </Modal>
    </AppShell>
  )
}
