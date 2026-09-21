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
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100 p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <div className="space-y-1 text-center">
          <div className="text-4xl">⛩️</div>
          <h1 className="text-xl font-bold text-slate-800">福岡行程規劃</h1>
          <p className="text-sm text-slate-500">潘・黑・劉　11/6 – 11/13</p>
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
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        {err && <p className="text-center text-sm text-rose-500">暗號不對，再試一次</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white transition active:scale-[0.98]"
        >
          進入
        </button>
      </form>
    </div>
  )
}
