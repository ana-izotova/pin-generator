import { describe, expect, it } from 'vitest'
import {
  hasConsecutiveIdenticalDigits,
  hasConsecutiveIncrementalDigits,
  hasConsecutiveDecrementalDigits,
  isPalindrome,
  hasAllEven,
  hasAllOdds,
  hasRepeatedPattern,
  isBlackListed,
} from './validation-rules'

describe('hasConsecutiveIdenticalDigits', () => {
  describe('returns true when consecutive identical digits exist', () => {
    it.each([
      ['1100', 'pair at start'],
      ['0110', 'pair in middle'],
      ['0011', 'pair at end'],
      ['1111', 'all identical'],
      ['0000', 'all zeros'],
      ['9900', 'pair of 9s at start'],
      ['1223', 'pair of 2s in middle'],
      ['4566', 'pair at end'],
      ['11234', 'pair at start of 5-digit'],
      ['112233', 'multiple pairs'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveIdenticalDigits(pin)).toBe(true)
    })
  })

  describe('returns false when no consecutive identical digits', () => {
    it.each([
      ['1234', 'all different sequential'],
      ['1357', 'all different non-sequential'],
      ['0102', 'repeated but not consecutive'],
      ['9090', 'alternating digits'],
      ['1010', 'alternating 1 and 0'],
      ['5', 'single digit'],
      ['12', 'two different digits'],
      ['', 'empty string'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveIdenticalDigits(pin)).toBe(false)
    })
  })
})

describe('hasConsecutiveIncrementalDigits', () => {
  describe('returns true when 3+ consecutive incrementing digits exist', () => {
    it.each([
      ['1230', '123 at start'],
      ['0123', '0123 — full sequence'],
      ['4567', '456 and 567'],
      ['6789', '678 and 789'],
      ['0345', '345 at positions 1-3'],
      ['01234', '5-digit ascending run'],
      ['9012345', 'long ascending run'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveIncrementalDigits(pin)).toBe(true)
    })
  })

  describe('returns false when no 3 consecutive incrementing digits', () => {
    it.each([
      ['1350', 'incrementing but not consecutive values'],
      ['9876', 'decrementing — not incrementing'],
      ['1324', 'out of order'],
      ['8901', 'no wrap-around (9→0 is not +1)'],
      ['1199', 'pairs, not increments'],
      ['0000', 'all same'],
      ['12', 'only 2 digits incrementing'],
      ['', 'empty string'],
      ['5', 'single digit'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveIncrementalDigits(pin)).toBe(false)
    })
  })
})

describe('hasConsecutiveDecrementalDigits', () => {
  describe('returns true when 3+ consecutive decrementing digits exist', () => {
    it.each([
      ['3210', '321 at start'],
      ['9876', '987 and 876'],
      ['5432', '543 and 432'],
      ['0321', '321 at positions 1-3'],
      ['8765', '876 and 765'],
      ['43210', '5-digit descending run'],
      ['9210', '921 at start'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveDecrementalDigits(pin)).toBe(true)
    })
  })

  describe('returns false when no 3 consecutive decrementing digits', () => {
    it.each([
      ['1234', 'incrementing — not decrementing'],
      ['9753', 'decrementing but not consecutive values'],
      ['1090', '1→0→9 is not decrementing (no wrap-around)'],
      ['0000', 'all same'],
      ['1122', 'pairs'],
      ['98', 'only 2 digits decrementing'],
      ['', 'empty string'],
      ['7', 'single digit'],
      ['9713', 'gaps between decrements'],
    ])('"%s" (%s)', (pin) => {
      expect(hasConsecutiveDecrementalDigits(pin)).toBe(false)
    })
  })
})

describe('isPalindrome', () => {
  describe('returns true for palindromes', () => {
    it.each([
      ['1221', '4-digit palindrome'],
      ['0000', 'all zeros'],
      ['1111', 'all same'],
      ['9009', 'starts and ends with 9'],
      ['5005', 'starts and ends with 5'],
      ['12321', '5-digit palindrome'],
      ['1', 'single digit'],
      ['11', 'two same digits'],
      ['', 'empty string'],
    ])('"%s" (%s)', (pin) => {
      expect(isPalindrome(pin)).toBe(true)
    })
  })

  describe('returns false for non-palindromes', () => {
    it.each([
      ['1234', 'sequential'],
      ['1200', 'not mirrored'],
      ['1223', 'close but not palindrome'],
      ['9012', 'no symmetry'],
      ['12', 'two different digits'],
      ['12345', 'odd-length non-palindrome'],
    ])('"%s" (%s)', (pin) => {
      expect(isPalindrome(pin)).toBe(false)
    })
  })
})

describe('hasAllEven', () => {
  describe('returns true when all digits are even', () => {
    it.each([
      ['2468', 'all different even'],
      ['0000', 'all zeros (0 is even)'],
      ['2222', 'all same even'],
      ['0246', 'starting with 0'],
      ['8642', 'descending even'],
      ['20', 'two even digits'],
      ['024680', '6-digit all even'],
    ])('"%s" (%s)', (pin) => {
      expect(hasAllEven(pin)).toBe(true)
    })
  })

  describe('returns false when any digit is odd', () => {
    it.each([
      ['1234', 'starts with odd'],
      ['2461', 'ends with odd'],
      ['2438', 'odd in middle'],
      ['1357', 'all odd'],
      ['0001', 'single odd at end'],
      ['9000', 'single odd at start'],
    ])('"%s" (%s)', (pin) => {
      expect(hasAllEven(pin)).toBe(false)
    })
  })
})

describe('hasAllOdds', () => {
  describe('returns true when all digits are odd', () => {
    it.each([
      ['1357', 'all different odd'],
      ['1111', 'all same odd'],
      ['9999', 'all nines'],
      ['1379', 'ascending odd'],
      ['9753', 'descending odd'],
      ['13', 'two odd digits'],
      ['135791', '6-digit all odd'],
    ])('"%s" (%s)', (pin) => {
      expect(hasAllOdds(pin)).toBe(true)
    })
  })

  describe('returns false when any digit is even', () => {
    it.each([
      ['1350', 'ends with even'],
      ['2135', 'starts with even'],
      ['1325', 'even in middle'],
      ['2468', 'all even'],
      ['0000', 'all zeros (0 is even)'],
      ['1110', 'single even at end'],
    ])('"%s" (%s)', (pin) => {
      expect(hasAllOdds(pin)).toBe(false)
    })
  })
})

describe('hasRepeatedPattern', () => {
  describe('returns true when pin is a repeated pattern', () => {
    it.each([
      ['1212', '"12" repeated twice'],
      ['abab', '"ab" repeated twice'],
      ['123123', '"123" repeated twice'],
      ['abcabc', '"abc" repeated twice'],
      ['12121212', '"12" repeated four times'],
      ['aabbaabb', '"aabb" repeated twice'],
      ['1111', '"11" repeated twice'],
      ['0000', '"00" repeated twice'],
    ])('"%s" (%s)', (pin) => {
      expect(hasRepeatedPattern(pin)).toBe(true)
    })
  })

  describe('returns false when pin has no repeating pattern', () => {
    it.each([
      ['1234', 'all different'],
      ['1213', 'similar but not repeating'],
      ['12123', 'odd length, "12" does not divide evenly'],
      ['123', '3-digit — no pattern of length 2+ divides it into equal parts'],
      ['', 'empty string'],
      ['1', 'single character'],
      ['12', 'two characters — no pattern of length ≥2 fits'],
    ])('"%s" (%s)', (pin) => {
      expect(hasRepeatedPattern(pin)).toBe(false)
    })
  })
})

describe('isBlackListed', () => {
  const blackList = new Set(['1234', '0000', '9999', '1111'])

  it('returns true for a blacklisted pin', () => {
    expect(isBlackListed('1234', blackList)).toBe(true)
  })

  it('returns true for each blacklisted entry', () => {
    for (const pin of blackList) {
      expect(isBlackListed(pin, blackList)).toBe(true)
    }
  })

  it('returns false for a non-blacklisted pin', () => {
    expect(isBlackListed('5678', blackList)).toBe(false)
  })

  it('returns false for all pins not in the set', () => {
    expect(isBlackListed('0001', blackList)).toBe(false)
    expect(isBlackListed('9998', blackList)).toBe(false)
    expect(isBlackListed('4321', blackList)).toBe(false)
  })

  it('returns false with an empty blacklist', () => {
    expect(isBlackListed('1234', new Set())).toBe(false)
  })
})