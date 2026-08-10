import React, { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import LoanerForm from '../components/LoanerForm.jsx'
import LoanForm from '../components/LoanForm.jsx'
import PaymentForm from '../components/PaymentModal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatMoney, formatDate, initials } from '../utils/format.js'

export default function LoanerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { settings, loaners, loans, updateLoaner, deleteLoaner, addLoan, recordPayment } = useApp()
  const currency = settings?.currency || 'R'

  const loaner = loaners.find((l) => String(l.id) === id)
  const theirLoans = useMemo(
    () => loans.filter((l) => String(l.loanerId) === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [loans, id]
  )

  const [editOpen, setEditOpen] = useState(false)
  const [newLoanOpen, setNewLoanOpen] = useState(false)
  const [payingLoan, setPayingLoan] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!loaner) {
    return (
      <div className="card p-14 text-center">
        <p className="font-semibold text-ink-800">Loaner not found</p>
        <Link to="/loaners" className="text-brand-600 text-sm font-semibold hover:underline mt-2 inline-block">Back to Loaners</Link>
      </div>
    )
  }

  const totals = {
    totalLoans: theirLoans.reduce((s, l) => s + l.amount, 0),
    totalPaid: theirLoans.reduce((s, l) => s + l.paidAmount, 0),
    outstanding: theirLoans.reduce((s, l) => s + l.balance, 0)
  }

  async function handleAddLoan(data) {
    await addLoan({ ...data, loanerId: loaner.id })
    setNewLoanOpen(false)
  }

  async function handlePayment(amount) {
    await recordPayment(payingLoan.id, amount)
    setPayingLoan(null)
  }

  async function handleDelete() {
    try {
      await deleteLoaner(loaner.id)
      navigate('/loaners')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-ink-950">Loan History</h2>
          <button className="btn-primary" onClick={() => setNewLoanOpen(true)}><PlusIcon /> New Loan</button>
        </div>

        {theirLoans.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No loans recorded for {loaner.name} yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium py-2 px-5">Amount</th>
                  <th className="font-medium py-2 px-5">Interest</th>
                  <th className="font-medium py-2 px-5">Total</th>
                  <th className="font-medium py-2 px-5">Balance</th>
                  <th className="font-medium py-2 px-5">Status</th>
                  <th className="font-medium py-2 px-5">Due Date</th>
                  <th className="font-medium py-2 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {theirLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 px-5 font-medium">{formatMoney(loan.amount, currency)}</td>
                    <td className="py-3 px-5">{loan.interestPercent}%</td>
                    <td className="py-3 px-5">{formatMoney(loan.total, currency)}</td>
                    <td className="py-3 px-5 font-semibold">{formatMoney(loan.balance, currency)}</td>
                    <td className="py-3 px-5"><StatusBadge status={loan.status} /></td>
                    <td className="py-3 px-5 text-slate-500">{formatDate(loan.dueDate)}</td>
                    <td className="py-3 px-5">
                      {loan.status !== 'paid' && (
                        <button className="text-brand-600 font-semibold hover:underline" onClick={() => setPayingLoan(loan)}>
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-5 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-brand-500 text-white font-bold text-lg flex items-center justify-center">
              {initials(loaner.name) || '??'}
            </span>
            <div>
              <p className="font-display font-bold text-ink-950">{loaner.name}</p>
              <p className="text-xs text-slate-400">{loaner.phone || 'No phone'}</p>
            </div>
          </div>
        </div>
        {loaner.address && <p className="text-sm text-slate-500 flex items-center gap-1.5"><PinIcon /> {loaner.address}</p>}

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <SummaryRow label="Total Loans" value={formatMoney(totals.totalLoans, currency)} />
          <SummaryRow label="Total Paid" value={formatMoney(totals.totalPaid, currency)} />
          <SummaryRow label="Outstanding" value={formatMoney(totals.outstanding, currency)} highlight />
        </div>

        <div className="flex gap-2 pt-2">
          <button className="btn-secondary flex-1" onClick={() => setEditOpen(true)}>Edit Loaner</button>
          <button className="btn-danger" onClick={() => setConfirmDelete(true)}><TrashIcon /></button>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Loaner">
        <LoanerForm initial={loaner} onSubmit={async (data) => { await updateLoaner(loaner.id, data); setEditOpen(false) }} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={newLoanOpen} onClose={() => setNewLoanOpen(false)} title={`New Loan — ${loaner.name}`}>
        <LoanForm presetLoanerId={loaner.id} onSubmit={handleAddLoan} onCancel={() => setNewLoanOpen(false)} />
      </Modal>

      <Modal open={!!payingLoan} onClose={() => setPayingLoan(null)} title="Record Payment">
        {payingLoan && <PaymentForm loan={payingLoan} onSubmit={handlePayment} onCancel={() => setPayingLoan(null)} />}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${loaner.name}?`}
        message="Loaners with existing loans can't be deleted. This action is permanent."
        confirmLabel="Delete Loaner"
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={highlight ? 'font-bold text-red-600' : 'font-semibold text-ink-900'}>{value}</span>
    </div>
  )
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.1-7-11a7 7 0 1114 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
}
