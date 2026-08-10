import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, ensureSeeded, currentMonthKey } from '../db/db.js'
import { enrichLoan, round2 } from '../utils/calculations.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    return localStorage.getItem('loanshark:selectedMonth') || null
  })

  useEffect(() => {
    ensureSeeded().then(() => setReady(true))
  }, [])

  useEffect(() => {
    if (selectedMonthKey) {
      localStorage.setItem('loanshark:selectedMonth', selectedMonthKey)
    }
  }, [selectedMonthKey])

  const settings = useLiveQuery(() => db.settings.get(1), [], undefined)
  const months = useLiveQuery(() => db.months.orderBy('order').toArray(), [], [])
  const loaners = useLiveQuery(() => db.loaners.orderBy('name').toArray(), [], [])
  const rawLoans = useLiveQuery(() => db.loans.toArray(), [], [])

  const loans = useMemo(() => (rawLoans || []).map(enrichLoan), [rawLoans])

  const activeMonthKey = useMemo(() => {
    if (selectedMonthKey && months?.some((m) => m.key === selectedMonthKey)) {
      return selectedMonthKey
    }
    const current = months?.find((m) => m.status === 'current')
    return current?.key || currentMonthKey()
  }, [selectedMonthKey, months])

  const activeMonth = useMemo(
    () => months?.find((m) => m.key === activeMonthKey) || null,
    [months, activeMonthKey]
  )

  const loansForMonth = useMemo(
    () => loans.filter((l) => l.monthId === activeMonthKey),
    [loans, activeMonthKey]
  )

  // ---- Cash engine --------------------------------------------------
  // "My Current Money" is a running, all-time ledger: starting cash,
  // minus every rand ever loaned out, plus every rand ever collected back.
  const cash = useMemo(() => {
    const startingCash = Number(settings?.startingCash) || 0
    const totalLoanedAllTime = round2(loans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0))
    const totalCollectedAllTime = round2(loans.reduce((sum, l) => sum + (Number(l.paidAmount) || 0), 0))
    const currentMoney = round2(startingCash - totalLoanedAllTime + totalCollectedAllTime)

    const totalMoneyOutMonth = round2(loansForMonth.reduce((s, l) => s + (Number(l.amount) || 0), 0))
    const totalToCollectMonth = round2(loansForMonth.reduce((s, l) => s + (Number(l.balance) || 0), 0))
    const totalCollectedMonth = round2(loansForMonth.reduce((s, l) => s + (Number(l.paidAmount) || 0), 0))
    const totalInterestMonth = round2(loansForMonth.reduce((s, l) => s + (Number(l.total) - Number(l.amount)), 0))

    return {
      currentMoney,
      startingCash,
      totalMoneyOutMonth,
      totalToCollectMonth,
      totalCollectedMonth,
      totalInterestMonth
    }
  }, [settings, loans, loansForMonth])

  // ---- Loaner actions -------------------------------------------------
  async function addLoaner(data) {
    return db.loaners.add({
      name: data.name?.trim(),
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      createdAt: new Date().toISOString()
    })
  }

  async function updateLoaner(id, data) {
    return db.loaners.update(id, data)
  }

  async function deleteLoaner(id) {
    const count = await db.loans.where('loanerId').equals(id).count()
    if (count > 0) throw new Error('Cannot delete a loaner with existing loans.')
    return db.loaners.delete(id)
  }

  // ---- Loan actions -----------------------------------------------------
  async function addLoan(data) {
    return db.loans.add({
      loanerId: Number(data.loanerId),
      monthId: data.monthId || activeMonthKey,
      amount: round2(data.amount),
      interestPercent: Number(data.interestPercent) || 0,
      dueDate: data.dueDate,
      notes: data.notes || '',
      paidAmount: 0,
      payments: [],
      createdAt: new Date().toISOString()
    })
  }

  async function updateLoan(id, data) {
    return db.loans.update(id, data)
  }

  async function deleteLoan(id) {
    return db.loans.delete(id)
  }

  async function recordPayment(id, amount) {
    const loan = await db.loans.get(id)
    if (!loan) return
    const payment = { amount: round2(amount), date: new Date().toISOString() }
    const paidAmount = round2((loan.paidAmount || 0) + payment.amount)
    const payments = [...(loan.payments || []), payment]
    return db.loans.update(id, { paidAmount, payments })
  }

  // ---- Month actions ------------------------------------------------
  async function addMonth({ label, key }) {
    const maxOrder = months?.length ? Math.max(...months.map((m) => m.order)) : 0
    return db.months.add({
      key,
      label,
      status: 'upcoming',
      order: maxOrder + 1,
      createdAt: new Date().toISOString()
    })
  }

  async function setMonthAsCurrent(id) {
    const all = await db.months.toArray()
    await db.transaction('rw', db.months, async () => {
      for (const m of all) {
        const status = m.id === id ? 'current' : m.status === 'current' ? 'locked' : m.status
        if (status !== m.status) await db.months.update(m.id, { status })
      }
    })
  }

  async function deleteMonth(id) {
    const month = await db.months.get(id)
    if (!month) return
    const count = await db.loans.where('monthId').equals(month.key).count()
    if (count > 0) throw new Error('Cannot delete a month that has loans in it.')
    return db.months.delete(id)
  }

  // ---- Settings actions -----------------------------------------------
  async function updateSettings(data) {
    return db.settings.update(1, data)
  }

  const value = {
    ready,
    settings,
    months: months || [],
    loaners: loaners || [],
    loans,
    loansForMonth,
    activeMonth,
    activeMonthKey,
    setSelectedMonthKey,
    cash,
    addLoaner,
    updateLoaner,
    deleteLoaner,
    addLoan,
    updateLoan,
    deleteLoan,
    recordPayment,
    addMonth,
    setMonthAsCurrent,
    deleteMonth,
    updateSettings
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
