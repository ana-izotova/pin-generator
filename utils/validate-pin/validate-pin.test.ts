import { describe, expect, it } from 'vitest'
import { isValidPin } from './validate-pin'

describe('isValidPin', () => {
  describe('valid PINs', () => {
    it.each([
      '1357',
      '9080',
      '0201',
      '5791',
      '8642',
      '1020',
      '9753'
    ])('should accept "%s"', (pin) => {
      expect(isValidPin(pin)).toBe(true)
    })
  })

  describe('consecutive identical digits', () => {
    it.each([
      ['1156', '11 at start'],
      ['0112', '11 in middle'],
      ['0011', '00 at start and 11'],
      ['3445', '44 in middle'],
      ['1233', '33 at end'],
      ['0000', 'all same']
    ])('should reject "%s" (%s)', (pin) => {
      expect(isValidPin(pin)).toBe(false)
    })
  })

  describe('three consecutive incrementing digits', () => {
    it.each([
      ['1236', '123 at start'],
      ['0123', '012 at start'],
      ['4567', '456 at start and 567 overlapping'],
      ['6789', '678 at start and 789 overlapping'],
      ['0345', '345 at positions 1-3']
    ])('should reject "%s" (%s)', (pin) => {
      expect(isValidPin(pin)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should accept "8901" (9 to 0 is NOT incrementing — no wrap-around)', () => {
      expect(isValidPin('8901')).toBe(true)
    })

    it('should reject "0120" (0, 1, 2 are three consecutive incrementing digits)', () => {
      expect(isValidPin('0120')).toBe(false)
    })

    it('should reject "0124" (012 is three consecutive incrementing digits)', () => {
      expect(isValidPin('0124')).toBe(false)
    })

    it('should accept "1030" (no rule violated)', () => {
      expect(isValidPin('1030')).toBe(true)
    })

    it('should accept "9876" (decrementing is NOT incrementing)', () => {
      expect(isValidPin('9876')).toBe(true)
    })
  })
})
