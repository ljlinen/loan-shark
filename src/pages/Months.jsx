import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Months() {
  const { months, addMonth, setMonthAsCurrent, deleteMonth, setSelectedMonthKey } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deletingMonth, setDeletingMonth] = useState(null)
  const [error, setError] = useState('')

  const now = new Date()
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  async function handleAdd() {
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
    if (months.some((m) => m.key === key)) {
      setError('That month already exists.')
      return
    }
    await addMonth({ key, label: `${MONTH_NAMES[monthIdx]} ${year}` })
    setShowAdd(false)
    setError('')
  }

  async function handleDelete() {
    try {
      await deleteMonth(deletingMonth.id)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="card p-5 max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-bold text-ink-950 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" /> Manage Months
        </h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><PlusIcon /> Add Month</button>
      </div>
      <p className="text-xs text-slate-400 mb-4">You can add months in advance to prepare for upcoming loans.</p>

      <div className="divide-y divide-slate-100">
        {months.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-3.5 relative">
            <div>
              <p className="font-semibold text-ink-900">{m.label}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={m.status} />
              <button
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
              >
                <DotsIcon />
              </button>
              {openMenuId === m.id && (
                <div className="absolute right-0 top-11 z-10 w-48 card p-1.5" onMouseLeave={() => setOpenMenuId(null)}>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-slate-100"
                    onClick={() => { setSelectedMonthKey(m.key); setOpenMenuId(null) }}
                  >
                    View this month
                  </button>
                  {m.status !== 'current' && (
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-slate-100"
                      onClick={() => { setMonthAsCurrent(m.id); setOpenMenuId(null) }}
                    >
                      Set as Current
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    onClick={() => { setDeletingMonth(m); setOpenMenuId(null) }}
                  >
                    Delete Month
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Month">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Month</label>
              <select className="field-input" value={monthIdx} onChange={(e) => setMonthIdx(Number(e.target.value))}>
                {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Year</label>
              <input type="number" className="field-input" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add Month</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletingMonth}
        onClose={() => setDeletingMonth(null)}
        title={`Delete ${deletingMonth?.label}?`}
        message="Months with loans in them can't be deleted."
        confirmLabel="Delete Month"
        onConfirm={handleDelete}
      />
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    current: 'bg-brand-50 text-brand-600',
    upcoming: 'bg-amber-50 text-amber-600',
    locked: 'bg-slate-100 text-slate-500'
  }
  const label = { current: 'Current', upcoming: 'Upcoming', locked: 'Locked' }[status]
  return <span className={`badge ${map[status]}`}>{label}</span>
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
}
function DotsIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" /></svg>
}
function CalendarIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
}
