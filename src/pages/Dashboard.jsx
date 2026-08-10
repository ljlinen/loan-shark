import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'
import LoanForm from '../components/LoanForm.jsx'
import { formatMoney, formatDate } from '../utils/format.js'

export default function Dashboard() {
  const { settings, loaners, loansForMonth, activeMonth, cash, addLoan } = useApp()
  const [showNewLoan, setShowNewLoan] = useState(false)
  const currency = settings?.currency || 'R'

  const counts = useMemo(() => {
    const base = { total: loansForMonth.length, pending: 0, partial: 0, paid: 0, overdue: 0 }
    for (const l of loansForMonth) base[l.status] += 1
    return base
  }, [loansForMonth])

  const recentLoans = useMemo(
    () =>
      [...loansForMonth]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [loansForMonth]
  )

  function loanerName(id) {
    return loaners.find((l) => String(l.id) === String(id))?.name || 'Unknown'
  }

  async function handleAddLoan(data) {
    await addLoan({ ...data, monthId: activeMonth?.key })
    setShowNewLoan(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{activeMonth?.label || ''}</p>
        <button className="btn-primary" onClick={() => setShowNewLoan(true)}>
          <PlusIcon /> New Loan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<MoneyOutIcon />} label="Total Money Out" value={formatMoney(cash.totalMoneyOutMonth, currency)} sublabel="This Month" />
        <StatCard icon={<CollectIcon />} label="Total to Collect" value={formatMoney(cash.totalToCollectMonth, currency)} sublabel="This Month" tone="warning" />
        <StatCard icon={<CollectedIcon />} label="Total Collected" value={formatMoney(cash.totalCollectedMonth, currency)} sublabel="This Month" tone="success" />
        <StatCard
          dark
          icon={<WalletIcon />}
          label="My Current Money"
          value={formatMoney(cash.currentMoney, currency)}
          sublabel="Available"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-ink-950 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" /> Current Month Overview
          </h2>
          <span className="text-sm text-slate-400">{activeMonth?.label}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <MiniStat label="Total Loans" value={counts.total} />
          <MiniStat label="Pending" value={counts.pending} className="text-amber-500" />
          <MiniStat label="Partially Paid" value={counts.partial} className="text-blue-500" />
          <MiniStat label="Paid" value={counts.paid} className="text-emerald-500" />
          <MiniStat label="Overdue" value={counts.overdue} className="text-red-500" />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-ink-950">Recent Loans</h2>
          <Link to="/loans" className="text-sm font-semibold text-brand-600 hover:underline">View All</Link>
        </div>

        {recentLoans.length === 0 ? (
          <EmptyState onAdd={() => setShowNewLoan(true)} />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium py-2 px-5">Loaner</th>
                  <th className="font-medium py-2 px-5">Amount</th>
                  <th className="font-medium py-2 px-5">Interest</th>
                  <th className="font-medium py-2 px-5">Total</th>
                  <th className="font-medium py-2 px-5">Status</th>
                  <th className="font-medium py-2 px-5">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-3 px-5 font-medium text-ink-900">{loanerName(loan.loanerId)}</td>
                    <td className="py-3 px-5">{formatMoney(loan.amount, currency)}</td>
                    <td className="py-3 px-5">{loan.interestPercent}%</td>
                    <td className="py-3 px-5">{formatMoney(loan.total, currency)}</td>
                    <td className="py-3 px-5"><StatusBadge status={loan.status} /></td>
                    <td className="py-3 px-5 text-slate-500">{formatDate(loan.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showNewLoan} onClose={() => setShowNewLoan(false)} title="Add New Loan">
        <LoanForm onSubmit={handleAddLoan} onCancel={() => setShowNewLoan(false)} />
      </Modal>
    </div>
  )
}

function MiniStat({ label, value, className = '' }) {
  return (
    <div>
      <p className={`text-2xl font-display font-bold ${className || 'text-ink-950'}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-3">🦈</p>
      <p className="font-semibold text-ink-800">No loans this month yet</p>
      <p className="text-sm text-slate-400 mt-1 mb-4">Add your first loan to start tracking repayments.</p>
      <button className="btn-primary mx-auto" onClick={onAdd}><PlusIcon /> New Loan</button>
    </div>
  )
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
}
function MoneyOutIcon(props) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 10h18M7 15h3M3 6h18v12H3z" /></svg>
}
function CollectIcon(props) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="9" cy="8" r="3" /><path d="M3 21v-1a6 6 0 016-6h0a6 6 0 016 6v1" /></svg>
}
function CollectedIcon(props) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M20 6L9 17l-5-5" /></svg>
}
function WalletIcon(props) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20M17 15h.01" /></svg>
}
function CalendarIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
}
