import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { computeInterestAmount, computeTotal } from '../utils/calculations.js'
import { formatMoney, toDateInputValue } from '../utils/format.js'

const emptyForm = {
  loanerId: '',
  amount: '',
  interestPercent: '',
  dueDate: '',
  notes: ''
}

export default function LoanForm({ initial, onSubmit, onCancel, presetLoanerId }) {
  const { loaners, settings, addLoaner } = useApp()
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    interestPercent: settings?.defaultInterest ?? 15,
    loanerId: presetLoanerId || '',
    ...(initial
      ? {
          loanerId: initial.loanerId,
          amount: initial.amount,
          interestPercent: initial.interestPercent,
          dueDate: toDateInputValue(initial.dueDate),
          notes: initial.notes || ''
        }
      : {})
  }))
  const [creatingLoaner, setCreatingLoaner] = useState(false)
  const [newLoanerName, setNewLoanerName] = useState('')
  const [error, setError] = useState('')

  const interestAmount = useMemo(
    () => computeInterestAmount(form.amount, form.interestPercent),
    [form.amount, form.interestPercent]
  )
  const total = useMemo(
    () => computeTotal(form.amount, form.interestPercent),
    [form.amount, form.interestPercent]
  )

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleCreateLoaner() {
    if (!newLoanerName.trim()) return
    const id = await addLoaner({ name: newLoanerName.trim() })
    set('loanerId', String(id))
    setNewLoanerName('')
    setCreatingLoaner(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.loanerId) return setError('Please select a loaner.')
    if (!form.amount || Number(form.amount) <= 0) return setError('Please enter a valid amount.')
    if (!form.dueDate) return setError('Please choose a due date.')
    onSubmit({
      loanerId: form.loanerId,
      amount: Number(form.amount),
      interestPercent: Number(form.interestPercent) || 0,
      dueDate: form.dueDate,
      notes: form.notes
    })
  }

  const quickOptions = settings?.quickInterestOptions || [10, 15, 20, 25, 30]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Loaner *</label>
        {creatingLoaner ? (
          <div className="flex gap-2">
            <input
              autoFocus
              className="field-input"
              placeholder="New loaner name"
              value={newLoanerName}
              onChange={(e) => setNewLoanerName(e.target.value)}
            />
            <button type="button" className="btn-secondary shrink-0" onClick={handleCreateLoaner}>Add</button>
            <button type="button" className="btn-ghost shrink-0" onClick={() => setCreatingLoaner(false)}>Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select className="field-input" value={form.loanerId} onChange={(e) => set('loanerId', e.target.value)}>
              <option value="">Select loaner</option>
              {loaners.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <button type="button" className="btn-secondary shrink-0" onClick={() => setCreatingLoaner(true)}>+ New</button>
          </div>
        )}
      </div>

      <div>
        <label className="field-label">Amount ({settings?.currency || 'R'}) *</label>
        <input
          type="number" min="0" step="0.01" className="field-input"
          value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0.00"
        />
      </div>

      <div>
        <label className="field-label">Interest (%) *</label>
        <input
          type="number" min="0" step="0.1" className="field-input"
          value={form.interestPercent} onChange={(e) => set('interestPercent', e.target.value)}
        />
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {quickOptions.map((opt) => (
            <button
              type="button" key={opt}
              onClick={() => set('interestPercent', opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                Number(form.interestPercent) === opt
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-ink-600 border-slate-200 hover:border-brand-400'
              }`}
            >
              {opt}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Due Date *</label>
        <input type="date" className="field-input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
      </div>

      <div>
        <label className="field-label">Notes</label>
        <textarea
          className="field-input min-h-[70px] resize-none" placeholder="Optional notes..."
          value={form.notes} onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div className="rounded-xl bg-slate-50 p-4 space-y-2">
        <p className="text-xs font-bold text-ink-600 uppercase tracking-wide mb-1">Summary</p>
        <Row label="Interest Amount" value={formatMoney(interestAmount, settings?.currency)} />
        <Row label="Total Amount" value={formatMoney(total, settings?.currency)} />
        <Row label="To Be Repaid" value={formatMoney(total, settings?.currency)} bold />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Save Loan'}</button>
      </div>
    </form>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={bold ? 'font-bold text-ink-950' : 'font-medium text-ink-800'}>{value}</span>
    </div>
  )
}
