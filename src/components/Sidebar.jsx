import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/loans', label: 'Loans', icon: LoansIcon },
  { to: '/loaners', label: 'Loaners', icon: LoanersIcon },
  { to: '/months', label: 'Months', icon: MonthsIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/export', label: 'Export Data', icon: ExportIcon }
]

export default function Sidebar({ open, onClose }) {
  const { settings } = useApp()
  const [storagePct, setStoragePct] = useState(null)

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        if (quota) setStoragePct(Math.min(100, Math.round((usage / quota) * 100)))
      })
    }
  }, [])

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static z-40 h-full w-64 shrink-0 bg-ink-950 text-slate-300 flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5 shrink-0">
          <span className="text-xl leading-none">🦈</span>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            {settings?.businessName || 'Loan Shark'}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">
              Storage status{storagePct !== null && ` — using ${storagePct}% of local storage`}
            </p>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${storagePct ?? 12}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Offline Mode
          </div>
        </div>
      </aside>
    </>
  )
}

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
function LoansIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 10h18M7 15h3M3 6h18v12H3z" />
    </svg>
  )
}
function LoanersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-1a6 6 0 016-6h0a6 6 0 016 6v1M16 8a3 3 0 110-6M21 21v-1a5.5 5.5 0 00-3.5-5.1" />
    </svg>
  )
}
function MonthsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  )
}
function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.09A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 010-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.51 1z" />
    </svg>
  )
}
function ExportIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  )
}
