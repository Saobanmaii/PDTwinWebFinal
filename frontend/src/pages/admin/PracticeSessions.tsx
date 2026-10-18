import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Button, { IconButton } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/Section'
import { FilterPills } from '@/components/ui/Tabs'
import { Table, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { getPracticeSessions, createPracticeSession, updatePracticeSession, deletePracticeSession } from '@/api/practice'
import type { PracticeSession } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Trash2, Search } from 'lucide-react'

const EMPTY_FORM = { title: '', description: '', unitySceneName: '', lessonNumber: 1, cameraUrl: '', gxWorkUrl: '' }

export default function PracticeSessionsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<PracticeSession | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [query, setQuery] = useState('')

  const { data: sessions = [], isLoading } = useQuery({ queryKey: ['practice-sessions'], queryFn: getPracticeSessions })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? sessions.filter(s => s.title.toLowerCase().includes(q) || s.unitySceneName.toLowerCase().includes(q)) : sessions
  }, [sessions, query])

  const createMut = useMutation({
    mutationFn: () => createPracticeSession(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['practice-sessions'] }); toast.success('Tạo thành công'); setModal(null) },
    onError: () => toast.error('Lỗi khi tạo'),
  })

  const updateMut = useMutation({
    mutationFn: () => updatePracticeSession(selected!.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['practice-sessions'] }); toast.success('Cập nhật thành công'); setModal(null) },
  })

  const deleteMut = useMutation({
    mutationFn: deletePracticeSession,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['practice-sessions'] }); toast.success('Đã xóa') },
  })

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (s: PracticeSession) => {
    setSelected(s)
    setForm({
      title: s.title,
      description: s.description ?? '',
      unitySceneName: s.unitySceneName,
      lessonNumber: s.lessonNumber ?? 1,
      cameraUrl: s.cameraUrl ?? '',
      gxWorkUrl: s.gxWorkUrl ?? '',
    })
    setModal('edit')
  }

  return (
    <AppShell title="Bài thực hành">
      <SectionTitle className="px-2.5">Tất cả bài thực hành</SectionTitle>

      <div className="flex flex-wrap items-center gap-3 px-2.5">
        <div className="w-full sm:w-[240px]">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm bài thực hành..."
            icon={<Search size={12} />} className="h-8 rounded-full bg-white text-[11px]" />
        </div>
        <FilterPills value="all" onChange={() => {}} items={[{ key: 'all', label: 'Tất cả', count: sessions.length }]} />
        <Button className="ml-auto" icon={<Plus size={12} />} onClick={openCreate}>Tạo bài mới</Button>
      </div>

      <div className="px-2.5">
        <Table>
          <thead><tr>
            <Th>Bài thực hành</Th>
            <Th>Mô tả</Th>
            <Th className="text-center">Unity scene name</Th>
            <Th className="text-center">Layout</Th>
            <Th className="text-center">Link camera</Th>
            <Th className="text-center">Thao tác</Th>
          </tr></thead>
          <tbody>
            {rows.map(s => (
              <Tr key={s.id}>
                <Td className="text-sm font-medium">{s.title}</Td>
                <Td className="max-w-[260px] truncate text-[11px] text-muted">{s.description || '—'}</Td>
                <Td className="text-center text-[11px] text-muted">{s.unitySceneName}</Td>
                <Td className="text-center text-[11px] text-muted">Layout {s.lessonNumber ?? 1}</Td>
                <Td className="text-center text-[11px]">
                  {s.cameraUrl
                    ? <a href={s.cameraUrl} target="_blank" rel="noreferrer" className="text-info-500 underline">Link</a>
                    : <span className="text-muted">Mặc định</span>}
                </Td>
                <Td>
                  <div className="flex items-center justify-center gap-1.5">
                    <Button variant="outline" onClick={() => openEdit(s)}>Chỉnh sửa</Button>
                    <IconButton title="Xóa bài" className="hover:text-brand-500"
                      onClick={() => { if (confirm('Xóa bài này?')) deleteMut.mutate(s.id) }}>
                      <Trash2 size={12} />
                    </IconButton>
                  </div>
                </Td>
              </Tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <EmptyRow colSpan={6} text={query ? 'Không tìm thấy bài thực hành phù hợp' : 'Chưa có bài thực hành nào'} />
            )}
            {isLoading && <EmptyRow colSpan={6} text="Đang tải..." />}
          </tbody>
        </Table>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Tạo bài thực hành mới' : 'Chỉnh sửa bài thực hành'}
        footer={
          <>
            <Button variant="secondary" size="md" className="w-[90px]" onClick={() => setModal(null)}>Hủy</Button>
            <Button size="md" className="w-[90px]" disabled={!form.title || !form.unitySceneName}
              onClick={() => modal === 'create' ? createMut.mutate() : updateMut.mutate()}>
              {modal === 'create' ? 'Tạo' : 'Lưu'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <Field label="Tiêu đề" required>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Nhập tiêu đề..." />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2} placeholder="Viết mô tả..." />
          </Field>
          <Field label="Unity Scene Name" required hint="Tên thư mục trong /public/unity/">
            <Input value={form.unitySceneName} onChange={e => setForm(p => ({ ...p, unitySceneName: e.target.value }))}
              placeholder="VD: basic-quiz" />
          </Field>
          <Field label="Layout" required>
            <Select value={form.lessonNumber} onChange={e => setForm(p => ({ ...p, lessonNumber: Number(e.target.value) }))}>
              <option value={1}>Layout 1 (Thực hành | Camera)</option>
              <option value={2}>Layout 2 (GX Work | Thực hành | Camera)</option>
              <option value={3}>Layout 3 (Thực hành | Camera + Nộp bài PLC)</option>
            </Select>
          </Field>
          <Field label="Link Camera" hint="Để trống sẽ dùng camera mặc định của hệ thống">
            <Input value={form.cameraUrl} onChange={e => setForm(p => ({ ...p, cameraUrl: e.target.value }))}
              placeholder="VD: http://camera-host:8080/cam/snapshot.jpg" />
          </Field>
          {form.lessonNumber === 2 && (
            <Field label="Link GX Work">
              <Input value={form.gxWorkUrl} onChange={e => setForm(p => ({ ...p, gxWorkUrl: e.target.value }))}
                placeholder="VD: https://gxworks.example.com/session/123" />
            </Field>
          )}
        </div>
      </Modal>
    </AppShell>
  )
}
