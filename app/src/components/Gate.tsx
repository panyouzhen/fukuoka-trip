import { useState, type FormEvent } from 'react'
import { tryUnlock } from '../lib/gate'

export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (tryUnlock(pass)) onUnlock()
    else setErr(true)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-lg border border-hairline bg-card p-8">
        <div className="space-y-1.5 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink">福岡行程規劃</h1>
          <p className="text-sm text-muted">潘・黑・劉　11/6 – 11/13</p>
        </div>
        <input
          type="password"
          inputMode="text"
          autoFocus
          value={pass}
          onChange={(e) => {
            setPass(e.target.value)
            setErr(false)
          }}
          placeholder="輸入暗號"
          className="w-full rounded-md border border-hairline bg-paper px-4 py-3 text-center text-lg tracking-widest text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary"
        />
        {err && <p className="text-center text-sm text-warn">暗號不對，再試一次</p>}
        <button type="submit" className="w-full rounded-md bg-primary py-3 text-sm font-medium text-card">
          進入
        </button>
      </form>
    </div>
  )
}
