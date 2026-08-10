import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatMoney, formatDate } from '../utils/format.js'
import { downloadMonthPDF } from '../utils/pdfExport.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function ExportData() {
  const { settings, months, loaners, loans, activeMonthKey } = useApp()
  const currency = settings?.currency || 'R'
  const [exportMonthKey, setExportMonthKey] = useState(activeMonthKey)

  const month = months.find((m) => m.key === exportMonthKey) || months.find((m) => m.key === activeMonthKey)
  const monthLoans = useMemo(() => loans.filter((l) => l.monthId === month?.key), [loans, month])

  function loanerNameFor(id) {
    return loaners.find((l) => String(l.id) === String(id))?.name || 'Unknown'
  }

  const cash = useMemo(() => {
    const totalMoneyOutMonth = monthLoans.reduce((s, l) => s + l.amount, 0)
    const totalToCollectMonth = monthLoans.reduce((s, l) => s + l.balance, 0)
    const totalCollectedMonth = monthLoans.reduce((s, l) => s + l.paidAmount, 0)
    return { totalMoneyOutMonth, totalToCollectMonth, totalCollectedMonth }
  }, [monthLoans])

  function handleDownload() {
    downloadMonthPDF({ month, loans: monthLoans, loanerNameFor, settings, cash })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select className="field-input sm:w-56" value={exportMonthKey} onChange={(e) => setExportMonthKey(e.target.value)}>
          {months.map((m) => <option key={m.id} value={m.key}>{m.label}</option>)}
        </select>
        <button className="btn-primary" onClick={handleDownload}>
          <DownloadIcon /> Download PDF
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink-950">Loan Summary Report</h1>
            <p className="text-slate-400 text-sm mt-1">{month?.label}</p>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>Generated on: {formatDate(new Date())}</p>
            <p>Total Loans: {monthLoans.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total Money Out" value={formatMoney(cash.totalMoneyOutMonth, currency)} />
          <SummaryCard label="Total to Collect" value={formatMoney(cash.totalToCollectMonth, currency)} />
          <SummaryCard label="Total Collected" value={formatMoney(cash.totalCollectedMonth, currency)} />
          <SummaryCard label="Outstanding" value={formatMoney(cash.totalToCollectMonth, currency)} danger />
        </div>

        <h2 className="font-semibold text-ink-900 mb-3">Loan Summary</h2>
        {monthLoans.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No loans recorded for this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium py-2 pr-4">Loaner</th>
                  <th className="font-medium py-2 pr-4">Amount</th>
                  <th className="font-medium py-2 pr-4">Interest</th>
                  <th className="font-medium py-2 pr-4">Total</th>
                  <th className="font-medium py-2 pr-4">Paid</th>
                  <th className="font-medium py-2 pr-4">Balance</th>
                  <th className="font-medium py-2 pr-4">Status</th>
                  <th className="font-medium py-2 pr-4">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {monthLoans.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{loanerNameFor(l.loanerId)}</td>
                    <td className="py-2.5 pr-4">{formatMoney(l.amount, currency)}</td>
                    <td className="py-2.5 pr-4">{l.interestPercent}%</td>
                    <td className="py-2.5 pr-4">{formatMoney(l.total, currency)}</td>
                    <td className="py-2.5 pr-4">{formatMoney(l.paidAmount, currency)}</td>
                    <td className="py-2.5 pr-4 font-semibold">{formatMoney(l.balance, currency)}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={l.status} /></td>
                    <td className="py-2.5 pr-4 text-slate-500">{formatDate(l.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-100 font-bold">
                  <td className="py-2.5 pr-4">Total</td>
                  <td className="py-2.5 pr-4">{formatMoney(monthLoans.reduce((s, l) => s + l.amount, 0), currency)}</td>
                  <td></td>
                  <td className="py-2.5 pr-4">{formatMoney(monthLoans.reduce((s, l) => s + l.total, 0), currency)}</td>
                  <td className="py-2.5 pr-4">{formatMoney(monthLoans.reduce((s, l) => s + l.paidAmount, 0), currency)}</td>
                  <td className="py-2.5 pr-4">{formatMoney(monthLoans.reduce((s, l) => s + l.balance, 0), currency)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, danger }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`font-display font-bold text-lg ${danger ? 'text-red-600' : 'text-ink-950'}`}>{value}</p>
    </div>
  )
}

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
}
