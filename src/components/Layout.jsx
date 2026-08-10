import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useApp } from '../context/AppContext.jsx'

const TITLES = {
  '/': 'Dashboard',
  '/loans': 'Loans',
  '/loaners': 'Loaners',
  '/months': 'Months Management',
  '/settings': 'Settings',
  '/export': 'Export Data'
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { months, activeMonthKey, setSelectedMonthKey } = useApp()
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Loan Shark'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-ink-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-lg text-ink-950">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {months.length > 0 && (
              <select
                className="hidden sm:block field-input !w-auto !py-2 text-sm font-medium"
                value={activeMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m.id} value={m.key}>
                    {m.label} {m.status === 'current' ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
