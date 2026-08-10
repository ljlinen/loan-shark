import React from 'react'

export default function StatCard({ icon, label, value, sublabel, tone = 'default', dark = false }) {
  const toneClasses = {
    default: 'bg-brand-50 text-brand-600',
    warning: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-600'
  }[tone]

  if (dark) {
    return (
      <div className="rounded-2xl bg-ink-950 text-white p-5 flex flex-col gap-3 shadow-panel">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wide">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-display font-bold">{value}</div>
        {sublabel && <div className="text-xs text-emerald-400 font-medium">{sublabel}</div>}
      </div>
    )
  }

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClasses}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-ink-600">{label}</p>
        <p className="text-xl font-display font-bold text-ink-950 mt-0.5">{value}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
