import React, { useState } from 'react'
import { formatMoney } from '../utils/format.js'
import { useApp } from '../context/AppContext.jsx'

export default function PaymentForm({ loan, onSubmit, onCancel }) {
  const { settings } = useApp()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return setError('Enter a valid payment amount.')
    if (value > loan.balance + 0.01) return setError(`Amount exceeds outstanding balance of ${formatMoney(loan.balance, settings?.currency)}.`)
    onSubmit(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-ink-500">Total Owed</span><span className="font-semibold">{formatMoney(loan.total, settings?.currency)}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Already Paid</span><span className="font-semibold">{formatMoney(loan.paidAmount, settings?.currency)}</span></div>
        <div className="flex justify-between"><span className="text-ink-500">Balance Remaining</span><span className="font-bold text-brand-600">{formatMoney(loan.balance, settings?.currency)}</span></div>
      </div>

      <div>
        <label className="field-label">Payment Amount ({settings?.currency || 'R'}) *</label>
        <input
          type="number" min="0" step="0.01" autoFocus className="field-input"
          value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
        />
        <button
          type="button"
          className="text-xs font-semibold text-brand-600 mt-2 hover:underline"
          onClick={() => setAmount(loan.balance)}
        >
          Pay full balance ({formatMoney(loan.balance, settings?.currency)})
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Record Payment</button>
      </div>
    </form>
  )
}
