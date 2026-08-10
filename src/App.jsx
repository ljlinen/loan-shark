import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Loans from './pages/Loans.jsx'
import Loaners from './pages/Loaners.jsx'
import LoanerProfile from './pages/LoanerProfile.jsx'
import Months from './pages/Months.jsx'
import Settings from './pages/Settings.jsx'
import ExportData from './pages/ExportData.jsx'
import { useApp } from './context/AppContext.jsx'

export default function App() {
  const { ready } = useApp()

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-ink-500">
          <span className="text-3xl animate-bounce">🦈</span>
          <p className="text-sm font-medium">Loading your local data…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/loaners" element={<Loaners />} />
        <Route path="/loaners/:id" element={<LoanerProfile />} />
        <Route path="/months" element={<Months />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/export" element={<ExportData />} />
      </Route>
    </Routes>
  )
}
