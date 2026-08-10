import React from 'react'
import { statusLabel, statusBadgeClass } from '../utils/calculations.js'

export default function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
}
