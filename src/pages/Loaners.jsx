import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Modal from '../components/Modal.jsx'
import LoanerForm from '../components/LoanerForm.jsx'
import { formatMoney, initials } from '../utils/format.js'

export default function Loaners() {
  const { settings, loaners, loans, addLoaner } = useApp()
  const currency = settings?.currency || 'R'
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const enriched = useMemo(() => {
    return loaners
      .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
      .map((l) => {
        const theirLoans = loans.filter((loan) => String(loan.loanerId) === String(l.id))
        const outstanding = theirLoans.reduce((s, ln) => s + ln.balance, 0)
        const totalLoaned = theirLoans.reduce((s, ln) => s + ln.amount, 0)
        return { ...l, loanCount: theirLoans.length, outstanding, totalLoaned }
      })
  }, [loaners, loans, search])

  async function handleAdd(data) {
    await addLoaner(data)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="field-input pl-9" placeholder="Search loaners..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><PlusIcon /> New Loaner</button>
      </div>

      {enriched.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-4xl mb-3">🦈</p>
          <p className="font-semibold text-ink-800">No loaners yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Add someone to start tracking their loans.</p>
          <button className="btn-primary mx-auto" onClick={() => setShowForm(true)}><PlusIcon /> New Loaner</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {enriched.map((l) => (
            <Link to={`/loaners/${l.id}`} key={l.id} className="card p-5 hover:shadow-panel transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-11 h-11 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center shrink-0">
                  {initials(l.name) || '??'}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950 truncate">{l.name}</p>
                  <p className="text-xs text-slate-400 truncate">{l.phone || 'No phone number'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
                <div>
                  <p className="text-slate-400 text-xs">Loans</p>
                  <p className="font-semibold text-ink-900">{l.loanCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Outstanding</p>
                  <p className={`font-semibold ${l.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatMoney(l.outstanding, currency)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Loaner">
        <LoanerForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
}
function SearchIcon(props) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
}
