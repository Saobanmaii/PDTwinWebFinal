import { useEffect, useState, type RefObject } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FullscreenButtonProps {
  targetRef: RefObject<HTMLElement | null>
  className?: string
}

export default function FullscreenButton({ targetRef, className }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement === targetRef.current)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [targetRef])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      targetRef.current?.requestFullscreen()
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Thoát toàn màn hình' : 'Phóng to toàn màn hình'}
      className={cn('flex size-6 items-center justify-center rounded text-muted hover:bg-line hover:text-ink transition-colors cursor-pointer', className)}
    >
      {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
    </button>
  )
}
