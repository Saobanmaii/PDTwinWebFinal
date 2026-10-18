import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { login as loginApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { UserRound, Lock } from 'lucide-react'
import { Input, PasswordInput } from '@/components/ui/Field'
import Button from '@/components/ui/Button'
import loginBg from '@/assets/figma/login-bg.png'
import loginBgOverlay from '@/assets/figma/login-bg-overlay.jpg'
import ptitLogo from '@/assets/figma/ptit-logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await loginApi(username, password)
      login(user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      const status = axiosErr?.response?.status
      const msg = axiosErr?.response?.data?.message
      toast.error(msg || (status ? `Lỗi ${status}` : 'Không thể kết nối server'))
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Ảnh tòa nhà PTIT ở dưới, gradient thương hiệu phủ mờ lên trên */}
        <img src={loginBgOverlay} alt="" className="absolute size-full object-cover" />
        <img src={loginBg} alt="" className="absolute size-full object-cover opacity-70" />
      </div>

      <div className="relative flex w-full max-w-[616px] flex-col items-center gap-[54px] rounded-[20px] bg-white px-6 pt-10 pb-[50px] shadow-pop sm:px-[76px]">
        <div className="flex items-center gap-2">
          <img src={ptitLogo} alt="PTIT" className="size-12 object-contain" />
          <div>
            <div className="text-lg font-extrabold leading-[22.5px] tracking-[0.45px] text-brand-500">P-DTwin</div>
            <div className="text-xs leading-4 text-muted">PTIT Learning Platform</div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-10">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="bg-clip-text text-[32px] font-semibold text-transparent"
              style={{ backgroundImage: 'linear-gradient(65deg, #791013 36%, #CB2F1F 54%, #CB2F1F 62%, #F0BF3F 78%)' }}>
              ĐĂNG NHẬP
            </h1>
            <p className="text-base leading-[18px] text-muted">Vui lòng điền thông tin để truy cập vào tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold leading-[18px] text-ink">Tên đăng nhập</span>
              <Input value={username} onChange={e => setUsername(e.target.value)} required autoFocus
                placeholder="Mã sinh viên hoặc tài khoản" icon={<UserRound size={16} />} className="h-[62px]" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="px-2 text-sm font-semibold leading-[18px] text-ink">Mật khẩu</span>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" icon={<Lock size={16} />} className="h-[62px]" />
            </label>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
