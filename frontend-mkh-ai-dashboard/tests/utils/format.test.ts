import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../../utils/format'

describe('formatCurrency', () => {
  it('formats numbers as USD', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
})
