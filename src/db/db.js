import Dexie from 'dexie'

// LoanSharkDB — single local IndexedDB database.
// Everything lives on-device. Nothing is ever sent anywhere.
export const db = new Dexie('LoanSharkDB')

db.version(1).stores({
  // id auto-increment for every table
  settings: 'id',
  months: '++id, key, status, order',
  loaners: '++id, name',
  loans: '++id, loanerId, monthId, status, dueDate'
})

// ---- Defaults / seeding -------------------------------------------------

const DEFAULT_SETTINGS = {
  id: 1,
  businessName: 'Loan Shark',
  currency: 'R',
  defaultInterest: 15,
  lateFee: 5,
  startingCash: 10000,
  quickInterestOptions: [10, 15, 20, 25, 30]
}

function monthKeyFor(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabelFor(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export async function ensureSeeded() {
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.put(DEFAULT_SETTINGS)
  }

  const monthCount = await db.months.count()
  if (monthCount === 0) {
    const now = new Date()
    const rows = []
    // Two past months (locked), current month, two upcoming months.
    for (let offset = -2; offset <= 2; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      const key = monthKeyFor(d)
      let status = 'upcoming'
      if (offset === 0) status = 'current'
      else if (offset < 0) status = 'locked'
      rows.push({
        key,
        label: monthLabelFor(d),
        status,
        order: offset,
        createdAt: new Date().toISOString()
      })
    }
    await db.months.bulkAdd(rows)
  }
}

export function currentMonthKey() {
  const now = new Date()
  return monthKeyFor(now)
}

export { monthKeyFor, monthLabelFor }
