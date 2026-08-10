import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import LoanForm from '../components/LoanForm.jsx'
import PaymentForm from '../components/PaymentModal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatMoney, formatDate } from '../utils/format.js'

const PAGE_SIZE = 8

export default function Loans() {
  const { settings, loaners, loansForMonth, activeMonth, addLoan, updateLoan, deleteLoan, recordPayment } = useApp()
  const currency = settings?.currency || 'R'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [payingLoan, setPayingLoan] = useState(null)
  const [deletingLoan, setDeletingLoan] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  function loanerName(id) {
    return loaners.find((l) => String(l.id) === String(id))?.name || 'Unknown'
  }

  const filtered = useMemo(() => {
    return loansForMonth
      .filter((l) => (statusFilter === 'all' ? true : l.status === statusFilter))
      .filter((l) => loanerName(l.loanerId).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loansForMonth, statusFilter, search, loaners])

  const totals = useMemo(
    () => ({
      amount: filtered.reduce((s, l) => s + l.amount, 0),
      total: filtered.reduce((s, l) => s + l.total, 0),
      paid: filtered.reduce((s, l) => s + l.paidAmount, 0),
      balance: filtered.reduce((s, l) => s + l.balance, 0)
    }),
    [filtered]
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleAdd(data) {
    await addLoan({ ...data, monthId: activeMonth?.key })
    setShowForm(false)
  }

  async function handleEdit(data) {
    await updateLoan(editingLoan.id, data)
    setEditingLoan(null)
  }

  async function handlePayment(amount) {
    await recordPayment(payingLoan.id, amount)
    setPayingLoan(null)
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-bold text-ink-950">Loans — {activeMonth?.label}</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}><PlusIcon /> New Loan</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="field-input pl-9"
              placeholder="Search loaner..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="field-input sm:w-48"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-4xl mb-3">🦈</p>
            <p className="font-semibold text-ink-800">No loans found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="font-medium py-2 px-5">Loaner</th>
                    <th className="font-medium py-2 px-5">Amount</th>
                    <th className="font-medium py-2 px-5">Interest</th>
                    <th className="font-medium py-2 px-5">Total</th>
                    <th className="font-medium py-2 px-5">Paid</th>
                    <th className="font-medium py-2 px-5">Balance</th>
                    <th className="font-medium py-2 px-5">Status</th>
                    <th className="font-medium py-2 px-5">Due Date</th>
                    <th className="font-medium py-2 px-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((loan) => (
                    <tr key={loan.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-5 font-medium text-ink-900">{loanerName(loan.loanerId)}</td>
                      <td className="py-3 px-5">{formatMoney(loan.amount, currency)}</td>
                      <td className="py-3 px-5">{loan.interestPercent}%</td>
                      <td className="py-3 px-5">{formatMoney(loan.total, currency)}</td>
                      <td className="py-3 px-5">{formatMoney(loan.paidAmount, currency)}</td>
                      <td className="py-3 px-5 font-semibold">{formatMoney(loan.balance, currency)}</td>
                      <td className="py-3 px-5"><StatusBadge status={loan.status} /></td>
                      <td className="py-3 px-5 text-slate-500">{formatDate(loan.dueDate)}</td>
                      <td className="py-3 px-5 relative">
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
                          onClick={() => setOpenMenuId(openMenuId === loan.id ? null : loan.id)}
                        >
                          <DotsIcon />
                        </button>
                        {openMenuId === loan.id && (
                          <div className="absolute right-5 top-10 z-10 w-44 card p-1.5" onMouseLeave={() => setOpenMenuId(null)}>
                            {loan.status !== 'paid' && (
                              <MenuItem onClick={() => { setPayingLoan(loan); setOpenMenuId(null) }}>Record Payment</MenuItem>
                            )}
                            <MenuItem onClick={() => { setEditingLoan(loan); setOpenMenuId(null) }}>Edit Loan</MenuItem>
                            <MenuItem danger onClick={() => { setDeletingLoan(loan); setOpenMenuId(null) }}>Delete Loan</MenuItem>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-100 font-bold text-ink-950">
                    <td className="py-3 px-5">Total</td>
                    <td className="py-3 px-5">{formatMoney(totals.amount, currency)}</td>
                    <td className="py-3 px-5"></td>
                    <td className="py-3 px-5">{formatMoney(totals.total, currency)}</td>
                    <td className="py-3 px-5">{formatMoney(totals.paid, currency)}</td>
                    <td className="py-3 px-5">{formatMoney(totals.balance, currency)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button className="btn-ghost !px-3" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold ${p === page ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-slate-100'}`}
                  >
                    {p}
                  </button>
                ))}
                <button className="btn-ghost !px-3" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Loan">
        <LoanForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={!!editingLoan} onClose={() => setEditingLoan(null)} title="Edit Loan">
        {editingLoan && <LoanForm initial={editingLoan} onSubmit={handleEdit} onCancel={() => setEditingLoan(null)} />}
      </Modal>

      <Modal open={!!payingLoan} onClose={() => setPayingLoan(null)} title={`Record Payment — ${payingLoan ? loanerName(payingLoan.loanerId) : ''}`}>
        {payingLoan && <PaymentForm loan={payingLoan} onSubmit={handlePayment} onCancel={() => setPayingLoan(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!deletingLoan}
        onClose={() => setDeletingLoan(null)}
        title="Delete this loan?"
        message={`This will permanently remove the loan for ${deletingLoan ? loanerName(deletingLoan.loanerId) : ''}. This cannot be undone.`}
        confirmLabel="Delete Loan"
        onConfirm={() => deleteLoan(deletingLoan.id)}
      />
    </div>
  )
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-700 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  )
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
}
function SearchIcon(props) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
}
function DotsIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" /></svg>
}
