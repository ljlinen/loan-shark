import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const TABS = ['General', 'Percentages', 'Defaults']

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const [tab, setTab] = useState('General')
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [quickInput, setQuickInput] = useState('')

  useEffect(() => {
    if (settings && !form) setForm(settings)
  }, [settings, form])

  if (!form) return null

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function addQuickOption() {
    const v = Number(quickInput)
    if (!v || form.quickInterestOptions.includes(v)) return
    set('quickInterestOptions', [...form.quickInterestOptions, v].sort((a, b) => a - b))
    setQuickInput('')
  }

  function removeQuickOption(v) {
    set('quickInterestOptions', form.quickInterestOptions.filter((x) => x !== v))
  }

  async function handleSave() {
    await updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card p-0 max-w-3xl overflow-hidden">
      <div className="grid grid-cols-[160px_1fr]">
        <div className="border-r border-slate-100 p-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium mb-1 ${
                tab === t ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-ink-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'General' && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="field-label">Business Name</label>
                <input className="field-input" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Currency Symbol</label>
                <input className="field-input" value={form.currency} onChange={(e) => set('currency', e.target.value)} maxLength={4} />
              </div>
              <div>
                <label className="field-label">Starting Cash ({form.currency})</label>
                <input type="number" className="field-input" value={form.startingCash} onChange={(e) => set('startingCash', Number(e.target.value))} />
                <p className="text-xs text-slate-400 mt-1.5">The cash you began with, before any loans were issued.</p>
              </div>
            </div>
          )}

          {tab === 'Percentages' && (
            <div className="space-y-5 max-w-md">
              <div>
                <label className="field-label">Default Interest Percentage</label>
                <div className="relative">
                  <input type="number" className="field-input" value={form.defaultInterest} onChange={(e) => set('defaultInterest', Number(e.target.value))} />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">This will be the default interest rate for new loans</p>
              </div>

              <div>
                <label className="field-label">Quick Interest Options</label>
                <p className="text-xs text-slate-400 mb-2">These options will be available when adding loans</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.quickInterestOptions.map((opt) => (
                    <span key={opt} className="badge bg-slate-100 text-ink-700 gap-1.5">
                      {opt}%
                      <button onClick={() => removeQuickOption(opt)} className="text-slate-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" className="field-input" placeholder="Add %" value={quickInput} onChange={(e) => setQuickInput(e.target.value)} />
                  <button className="btn-secondary shrink-0" onClick={addQuickOption}>Add</button>
                </div>
              </div>

              <div>
                <label className="field-label">Late Fee Percentage (Optional)</label>
                <div className="relative">
                  <input type="number" className="field-input" value={form.lateFee} onChange={(e) => set('lateFee', Number(e.target.value))} />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Additional percentage for overdue loans (informational — not auto-applied)</p>
              </div>
            </div>
          )}

          {tab === 'Defaults' && (
            <div className="space-y-4 max-w-md text-sm text-ink-600">
              <p>These are the values pre-filled whenever you add a new loan or loaner.</p>
              <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between"><span>Default Interest</span><span className="font-semibold">{form.defaultInterest}%</span></div>
                <div className="flex justify-between"><span>Currency</span><span className="font-semibold">{form.currency}</span></div>
                <div className="flex justify-between"><span>Late Fee</span><span className="font-semibold">{form.lateFee}%</span></div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
            <button className="btn-primary" onClick={handleSave}>Save Settings</button>
            {saved && <span className="text-sm font-medium text-emerald-600">Saved ✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
