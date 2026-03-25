import { describe, expect, it, vi } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns a new array, not the original', () => {
    const original = [1, 2, 3, 4]
    const result = shuffle(original)
    expect(result).not.toBe(original)
  })

  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4]
    const copy = [...original]
    shuffle(original)
    expect(original).toEqual(copy)
  })

  it('preserves all elements (same length and contents)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = shuffle(original)
    expect(result).toHaveLength(original.length)
    expect(result.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b))
  })

  it('preserves duplicate elements', () => {
    const original = [1, 1, 2, 2, 3, 3]
    const result = shuffle(original)
    expect(result.sort((a, b) => a - b)).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('returns an empty array when given an empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('returns a single-element array unchanged', () => {
    expect(shuffle([42])).toEqual([42])
  })

  it('actually changes the order for a sufficiently large array', () => {
    const original = Array.from({ length: 50 }, (_, i) => i)
    const result = shuffle(original)
    // Extremely unlikely (1/50! chance) that a shuffle returns the same order
    expect(result).not.toEqual(original)
  })

  describe('uses Fisher-Yates correctly', () => {
    it('produces the expected result with a controlled Math.random', () => {
      // For a 4-element array [0,1,2,3], Fisher-Yates iterates i=3,2,1
      // Mock Math.random to return 0.5 each time:
      //   i=3: j = floor(0.5 * 3) = 1 → swap [3] and [1]  → [0,3,2,1]
      //   i=2: j = floor(0.5 * 2) = 1 → swap [2] and [1]  → [0,2,3,1]
      //   i=1: j = floor(0.5 * 1) = 0 → swap [1] and [0]  → [2,0,3,1]
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const result = shuffle([0, 1, 2, 3])
      expect(result).toEqual([2, 0, 3, 1])

      vi.restoreAllMocks()
    })

    it('returns the reversed array when Math.random always returns 0', () => {
      // j is always 0, so each element swaps with index 0
      //   i=3: swap [3],[0] → [3,1,2,0]
      //   i=2: swap [2],[0] → [2,1,3,0]
      //   i=1: swap [1],[0] → [1,2,3,0]
      vi.spyOn(Math, 'random').mockReturnValue(0)

      const result = shuffle([0, 1, 2, 3])
      expect(result).toEqual([1, 2, 3, 0])

      vi.restoreAllMocks()
    })
  })
})
