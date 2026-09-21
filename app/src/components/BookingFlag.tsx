export function BookingFlag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-warn ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
      需訂位
    </span>
  )
}
