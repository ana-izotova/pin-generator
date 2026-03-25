import { describe, expect, it } from 'vitest'
import { pinGenerator } from './generate-pins'
import { PIN_PATTERN, PIN_TOTAL_QUANTITY } from './lib/const'

describe('pinGenerator', () => {
  const pins = pinGenerator()

  it('should return an array', () => {
    expect(Array.isArray(pins)).toBe(true)
  })

  it(`should return exactly ${PIN_TOTAL_QUANTITY} PIN codes`, () => {
    expect(pins).toHaveLength(PIN_TOTAL_QUANTITY)
  })

  it('should return all unique PIN codes', () => {
    const uniquePins = new Set(pins)
    expect(uniquePins.size).toBe(pins.length)
  })

  describe('each PIN', () => {
    it('should match the expected PIN pattern', () => {
      for (const pin of pins) {
        expect(pin).toMatch(PIN_PATTERN)
      }
    })

    it('no PIN should have consecutive identical digits', () => {
      const invalid = pins.filter(pin =>
        pin.split('').some((d, i) => i > 0 && d === pin[i - 1])
      )
      expect(invalid, `Found invalid PINs: ${invalid.slice(0, 10).join(', ')}`).toEqual([])
    })

    it('no PIN should have three consecutive incrementing digits', () => {
      const invalid = pins.filter((pin) => {
        for (let i = 0; i < pin.length - 2; i++) {
          const a = Number(pin[i])
          const b = Number(pin[i + 1])
          const c = Number(pin[i + 2])
          if (b === a + 1 && c === b + 1) {
            return true
          }
        }
        return false
      })
      expect(invalid, `Found invalid PINs: ${invalid.slice(0, 10).join(', ')}`).toEqual([])
    })
  })

  it('should return PINs in random order (not sorted)', () => {
    const sorted = [...pins].sort() // sort as strings
    expect(pins).not.toEqual(sorted)
  })

  it('should return different results on subsequent calls', () => {
    const pins2 = pinGenerator()
    expect(pins).not.toEqual(pins2)
  })
})
