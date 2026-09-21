import { NavLink, Outlet } from 'react-router-dom'
import { OfflineBanner } from './OfflineBanner'

const NAV_ITEMS = [
  { to: '/', label: '總覽', icon: '🗓️', end: true },
  { to: '/day', label: '分日行程', icon: '📍', end: false },
  { to: '/candidates', label: '候選清單', icon: '⭐', end: true },
  { to: '/wishlist', label: '想買清單', icon: '🛍️', end: true },
  { to: '/todos', label: '待辦提醒', icon: '✅', end: true },
]

export function Shell() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <OfflineBanner />

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛩️</span>
            <span className="font-bold text-slate-800">福岡行程</span>
            <span className="hidden text-sm text-slate-400 sm:inline">潘・黑・劉　11/6–11/13</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
                isActive ? 'text-slate-900' : 'text-slate-400'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
