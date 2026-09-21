import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, MapPinned, Star, ShoppingBag, ListChecks } from 'lucide-react'
import { OfflineBanner } from './OfflineBanner'

const NAV_ITEMS = [
  { to: '/', label: '總覽', icon: CalendarDays, end: true },
  { to: '/day', label: '分日行程', icon: MapPinned, end: false },
  { to: '/candidates', label: '候選清單', icon: Star, end: true },
  { to: '/wishlist', label: '想買清單', icon: ShoppingBag, end: true },
  { to: '/todos', label: '待辦提醒', icon: ListChecks, end: true },
]

export function Shell() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <OfflineBanner />

      <header className="sticky top-0 z-20 border-b border-hairline bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-lg font-semibold text-ink">福岡行程</span>
            <span className="hidden text-xs text-muted sm:inline">潘・黑・劉　11/6–11/13</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-b-2 pb-0.5 text-sm transition ${
                    isActive ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-hairline bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                isActive ? 'text-ink' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 1.75 : 1.5} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
