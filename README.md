# 🦈 Loan Shark — Offline Loan Manager

A modern, responsive, **offline-first** loan management app. No backend, no server,
no account — everything is stored locally on your device in IndexedDB.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router (HashRouter — works great from a static build, no server rewrites needed)
- Dexie.js (IndexedDB) + dexie-react-hooks for live, reactive queries
- jsPDF + jspdf-autotable for PDF export
- vite-plugin-pwa for offline installability

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). That's it —
no environment variables, no API keys, no database to set up.

To build a production bundle (installable as a PWA / usable fully offline):

```bash
npm run build
npm run preview
```

## Features

- **Dashboard** — money out, expected repayments, collected this month, and
  your running cash balance, plus a current-month status breakdown and recent
  loans.
- **Loans** — add loans with auto-calculated interest/total, search & filter
  by status, record full or partial payments, edit or delete loans.
- **Loaners** — add/search borrowers, view a per-person profile with full
  loan history and running totals.
- **Months** — create months in advance, switch the active month anywhere in
  the app, mark a month as current, or lock/delete old ones.
- **Settings** — business name, currency symbol, default interest rate,
  quick-pick interest options, optional late fee, starting cash.
- **Export** — preview and download any month's loan summary as a PDF.

## How the numbers work

- Every loan's **Total** = amount + (amount × interest%).
- **Balance** = Total − amount paid so far. Status is derived automatically:
  `Paid` → balance is 0. `Overdue` → balance > 0 and past due date.
  `Partially Paid` → some payment recorded, not yet due or not overdue.
  `Pending` → nothing paid yet.
- **My Current Money** is a running, all-time cash ledger: your starting
  cash, minus every rand ever loaned out, plus every rand ever collected
  back — so it updates automatically the moment you issue a loan or record
  a payment.

## Data & privacy

All data lives in your browser's IndexedDB (`LoanSharkDB`). Nothing is ever
sent to a server — the app has no backend at all. Clearing your browser's
site data for this app will erase your data, so export to PDF periodically
if you want a backup, or use your browser/OS's profile backup.

## Project structure

```
src/
  components/   Reusable UI (Sidebar, Modal, forms, cards, badges…)
  context/      AppContext.jsx — the single source of truth: live DB
                queries + all create/update/delete actions + cash engine
  db/           Dexie schema + first-run seeding
  pages/        One file per route (Dashboard, Loans, Loaners, Months, …)
  utils/        Pure helpers: money/date formatting, loan math, PDF export
```
