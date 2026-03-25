import { describe, expect, it, vi } from 'vitest'
import { createPinValidator } from './validate-pin'
import type { ValidationRule } from '@/lib/types'

describe('createPinValidator', () => {
  it('returns a function', () => {
    const validate = createPinValidator([])
    expect(typeof validate).toBe('function')
  })

  describe('with no rules', () => {
    const validate = createPinValidator([])

    it('accepts any pin', () => {
      expect(validate('1234')).toBe(true)
      expect(validate('0000')).toBe(true)
      expect(validate('')).toBe(true)
    })
  })

  describe('with a single rule', () => {
    const rejectIfStartsWithZero: ValidationRule = (pin) => pin.startsWith('0')
    const validate = createPinValidator([rejectIfStartsWithZero])

    it('rejects pin when the rule returns true (rule detects a problem)', () => {
      expect(validate('0123')).toBe(false)
    })

    it('accepts pin when the rule returns false (no problem found)', () => {
      expect(validate('1234')).toBe(true)
    })
  })

  describe('with multiple rules', () => {
    const rejectIfAllSame: ValidationRule = (pin) => new Set([...pin]).size === 1
    const rejectIfTooShort: ValidationRule = (pin) => pin.length < 4

    const validate = createPinValidator([rejectIfAllSame, rejectIfTooShort])

    it('rejects pin when the first rule triggers', () => {
      expect(validate('1111')).toBe(false)
    })

    it('rejects pin when the second rule triggers', () => {
      expect(validate('12')).toBe(false)
    })

    it('rejects pin when both rules trigger', () => {
      expect(validate('1')).toBe(false)
    })

    it('accepts pin when no rule triggers', () => {
      expect(validate('1234')).toBe(true)
    })
  })

  describe('short-circuits on first failing rule', () => {
    it('does not call subsequent rules after one returns true', () => {
      const firstRule = vi.fn(() => true)
      const secondRule = vi.fn(() => false)

      const validate = createPinValidator([firstRule, secondRule])
      validate('1234')

      expect(firstRule).toHaveBeenCalledOnce()
      expect(secondRule).not.toHaveBeenCalled()
    })

    it('calls all rules when none trigger', () => {
      const firstRule = vi.fn(() => false)
      const secondRule = vi.fn(() => false)
      const thirdRule = vi.fn(() => false)

      const validate = createPinValidator([firstRule, secondRule, thirdRule])
      validate('1234')

      expect(firstRule).toHaveBeenCalledOnce()
      expect(secondRule).toHaveBeenCalledOnce()
      expect(thirdRule).toHaveBeenCalledOnce()
    })
  })

  describe('passes the pin to each rule', () => {
    it('calls each rule with the correct pin argument', () => {
      const rule = vi.fn(() => false)
      const validate = createPinValidator([rule])

      validate('5678')

      expect(rule).toHaveBeenCalledWith('5678')
    })
  })

  describe('returns independent validators', () => {
    it('creates separate validators with different rule sets', () => {
      const rejectAll: ValidationRule = () => true
      const acceptAll: ValidationRule = () => false

      const strict = createPinValidator([rejectAll])
      const lenient = createPinValidator([acceptAll])

      expect(strict('1234')).toBe(false)
      expect(lenient('1234')).toBe(true)
    })
  })
})
