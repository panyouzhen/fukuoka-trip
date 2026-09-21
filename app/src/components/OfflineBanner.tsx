import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-1.5 border-b border-hairline bg-card px-3 py-1.5 text-center text-xs font-medium text-warn">
      <WifiOff size={13} strokeWidth={1.75} />
      目前離線中，操作可能無法同步，恢復網路後會自動更新
    </div>
  )
}
