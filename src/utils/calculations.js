// Pure functions for loan math. Kept separate from components/DB so
// they're easy to unit test and reuse (dashboard, exports, forms all share these).

export function computeInterestAmount(amount, interestPercent) {
  const a = Number(amount) || 0
  const i = Number(interestPercent) || 0
  return round2((a * i) / 100)
}

export function computeTotal(amount, interestPercent) {
  const a = Number(amount) || 0
  return round2(a + computeInterestAmount(a, interestPercent))
}

export function computeBalance(total, paid) {
  return round2(Math.max(0, (Number(total) || 0) - (Number(paid) || 0)))
}

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

// Status is derived, never stored redundantly-out-of-sync: paid state always
// wins, then overdue (past due date with a balance), then partial, then pending.
export function computeStatus(loan) {
  const total = computeTotal(loan.amount, loan.interestPercent)
  const paid = Number(loan.paidAmount) || 0
  const balance = computeBalance(total, paid)

  if (balance <= 0) return 'paid'

  const due = loan.dueDate ? new Date(loan.dueDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (due && due < today) return 'overdue'

  if (paid > 0) return 'partial'
  return 'pending'
}

export function enrichLoan(loan) {
  const total = computeTotal(loan.amount, loan.interestPercent)
  const paid = round2(Number(loan.paidAmount) || 0)
  const balance = computeBalance(total, paid)
  const status = computeStatus(loan)
  return { ...loan, total, paidAmount: paid, balance, status }
}

export function statusLabel(status) {
  return {
    pending: 'Pending',
    partial: 'Partially Paid',
    paid: 'Paid',
    overdue: 'Overdue'
  }[status] || status
}

export function statusBadgeClass(status) {
  return {
    pending: 'badge-pending',
    partial: 'badge-partial',
    paid: 'badge-paid',
    overdue: 'badge-overdue'
  }[status] || 'badge-pending'
}
