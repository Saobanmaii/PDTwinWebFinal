import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { Field, PasswordInput } from '@/components/ui/Field'
import { changePassword } from '@/api/auth'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { toast.error('Mật khẩu xác nhận không khớp'); return }
    if (form.newPassword.length < 6) { toast.error('Mật khẩu mới phải ít nhất 6 ký tự'); return }
    setLoading(true)
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Đổi mật khẩu thành công')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch {
      toast.error('Mật khẩu hiện tại không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Đổi mật khẩu">
      <form onSubmit={handleSubmit}
        className="flex w-full max-w-[505px] flex-col gap-4 rounded-[10px] bg-white px-4 pt-6 pb-6 shadow-card">
        <Field label="Mật khẩu hiện tại">
          <PasswordInput value={form.currentPassword} placeholder="••••••••" className="h-[52px]"
            onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} />
        </Field>
        <Field label="Mật khẩu mới">
          <PasswordInput value={form.newPassword} placeholder="••••••••" className="h-[52px]"
            onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} />
        </Field>
        <Field label="Xác nhận mật khẩu mới">
          <PasswordInput value={form.confirm} placeholder="••••••••" className="h-[52px]"
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
        </Field>
        <Button type="submit" size="md" disabled={loading || !form.currentPassword || !form.newPassword}
          className="mx-auto mt-2 h-[54px] w-[200px] rounded-[10px]">
          {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </Button>
      </form>
    </AppShell>
  )
}
