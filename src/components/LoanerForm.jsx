import React, { useState } from 'react'

export default function LoanerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    address: initial?.address || ''
  })
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please enter a name.')
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Full Name *</label>
        <input className="field-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sizwe Dlamini" autoFocus />
      </div>
      <div>
        <label className="field-label">Phone Number</label>
        <input className="field-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="071 123 4567" />
      </div>
      <div>
        <label className="field-label">Address</label>
        <input className="field-input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Suburb, City" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Add Loaner'}</button>
      </div>
    </form>
  )
}
