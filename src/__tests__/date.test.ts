import { describe, it, expect } from 'vitest'
import { formatDate, nowISO } from '../utils/date'

describe('date utils', () => {
  it('formatDate formats ISO string to readable date', () => {
    const result = formatDate('2026-06-17T10:00:00.000Z')
    expect(result).toContain('Jun')
    expect(result).toContain('2026')
  })

  it('nowISO returns a parseable ISO string', () => {
    const iso = nowISO()
    expect(new Date(iso).getTime()).toBeGreaterThan(0)
  })
})

import { isOverdue } from '../utils/date'

describe('isOverdue', () => {
  it('returns true for a past date', () => {
    expect(isOverdue('2020-01-01')).toBe(true)
  })
  it('returns false for a future date', () => {
    expect(isOverdue('2099-01-01')).toBe(false)
  })
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false)
  })
})
