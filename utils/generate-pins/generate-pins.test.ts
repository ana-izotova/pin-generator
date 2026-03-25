import { describe, expect, it } from 'vitest'
import { generatePins } from './generate-pins'
import { PIN_LENGTH, PIN_PATTERN, PIN_TOTAL_QUANTITY } from '@/lib/const'

describe('generatePins', () => {
  describe('default options', () => {
    const pins = generatePins()

    it('returns an array', () => {
      expect(Array.isArray(pins)).toBe(true)
    })

    it(`returns exactly ${PIN_TOTAL_QUANTITY} PINs`, () => {
      expect(pins).toHaveLength(PIN_TOTAL_QUANTITY)
    })

    it('returns all unique PINs', () => {
      expect(new Set(pins).size).toBe(pins.length)
    })

    it('each PIN matches the expected pattern', () => {
      for (const pin of pins) {
        expect(pin).toMatch(PIN_PATTERN)
      }
    })

    it('no PIN has consecutive identical digits', () => {
      const invalid = pins.filter((pin) =>
        pin.split('').some((d, i) => i > 0 && d === pin[i - 1])
      )
      expect(invalid).toEqual([])
    })

    it('no PIN has three consecutive incrementing digits', () => {
      const invalid = pins.filter((pin) => {
        for (let i = 0; i < pin.length - 2; i++) {
          const a = Number(pin[i])
          const b = Number(pin[i + 1])
          const c = Number(pin[i + 2])
          if (b === a + 1 && c === b + 1) return true
        }
        return false
      })
      expect(invalid).toEqual([])
    })

    it('returns PINs in random order (not sorted)', () => {
      const sorted = [...pins].sort()
      expect(pins).not.toEqual(sorted)
    })

    it('returns different results on subsequent calls', () => {
      const pins2 = generatePins()
      expect(pins).not.toEqual(pins2)
    })
  })

  describe('custom count', () => {
    it('returns the requested number of PINs', () => {
      const pins = generatePins({ count: 10 })
      expect(pins).toHaveLength(10)
    })

    it('returns 1 PIN when count is 1', () => {
      const pins = generatePins({ count: 1 })
      expect(pins).toHaveLength(1)
      expect(pins[0]).toMatch(PIN_PATTERN)
    })
  })

  describe('custom length', () => {
    it('generates PINs with the specified length', () => {
      const pins = generatePins({ length: 6, count: 10 })
      for (const pin of pins) {
        expect(pin).toHaveLength(6)
        expect(pin).toMatch(/^\d{6}$/)
      }
    })

    it('generates 2-digit PINs', () => {
      const pins = generatePins({ length: 2, count: 5 })
      for (const pin of pins) {
        expect(pin).toHaveLength(2)
        expect(pin).toMatch(/^\d{2}$/)
      }
    })
  })

  describe('custom rules', () => {
    it('applies custom validation rules', () => {
      const rejectStartingWithZero = (pin: string) => pin.startsWith('0')
      const pins = generatePins({ count: 50, rules: [rejectStartingWithZero] })

      for (const pin of pins) {
        expect(pin.startsWith('0')).toBe(false)
      }
    })

    it('with no rules, only applies blacklist filtering', () => {
      const pins = generatePins({ length: 2, count: 10, rules: [] })
      expect(pins).toHaveLength(10)
    })

    it('with a rule that rejects everything for short pins, throws', () => {
      const rejectAll = () => true
      expect(() => generatePins({ length: 2, count: 1, rules: [rejectAll] })).toThrow(
        /only 0 valid/
      )
    })
  })

  describe('blackList', () => {
    it('excludes blacklisted PINs', () => {
      const blackList = new Set(['1357', '9080', '5791'])
      const pins = generatePins({ count: 100, blackList })

      for (const pin of blackList) {
        expect(pins).not.toContain(pin)
      }
    })

    it('works with an empty blacklist', () => {
      const pins = generatePins({ count: 10, blackList: new Set() })
      expect(pins).toHaveLength(10)
    })
  })

  describe('error handling', () => {
    it('throws when requested count exceeds available valid PINs', () => {
      expect(() => generatePins({ length: 1, count: 100 })).toThrow(/only \d+ valid/)
    })

    it('throws with a descriptive message', () => {
      expect(() => generatePins({ length: 1, count: 100 })).toThrow(
        /Requested 100 PINs but only \d+ valid 1-digit PINs exist/
      )
    })
  })

  describe('long pins (length > 15)', () => {
    it('generates PINs with the correct length', () => {
      const pins = generatePins({ length: 20, count: 5, rules: [] })
      for (const pin of pins) {
        expect(pin).toHaveLength(20)
        expect(pin).toMatch(/^\d{20}$/)
      }
    })

    it('returns unique PINs', () => {
      const pins = generatePins({ length: 20, count: 50, rules: [] })
      expect(new Set(pins).size).toBe(50)
    })

    it('applies validation rules', () => {
      const rejectStartingWithZero = (pin: string) => pin.startsWith('0')
      const pins = generatePins({ length: 16, count: 10, rules: [rejectStartingWithZero] })

      for (const pin of pins) {
        expect(pin.startsWith('0')).toBe(false)
      }
    })

    it('applies blacklist', () => {
      const knownPin = '1'.repeat(20)
      const blackList = new Set([knownPin])
      const pins = generatePins({ length: 20, count: 10, rules: [], blackList })
      expect(pins).not.toContain(knownPin)
    })

    it('throws when max attempts exceeded', () => {
      const rejectAll = () => true
      expect(() => generatePins({ length: 16, count: 1, rules: [rejectAll] })).toThrow(
        /Could only generate/
      )
    })
  })
})