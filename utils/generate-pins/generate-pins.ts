import type { Pin, PinGeneratorOptions } from '@/lib/types'
import { PIN_LENGTH, PIN_TOTAL_QUANTITY } from '@/lib/const'
import {
  hasConsecutiveIdenticalDigits,
  hasConsecutiveIncrementalDigits,
  isBlackListed,
} from '@/utils/validate-pin/validation-rules'
import { createPinValidator } from '@/utils/validate-pin/validate-pin'
import { shuffle } from '@/utils/shuffle'

const MAX_ATTEMPTS_MULTIPLIER = 100

const isAcceptablePin = (pin: Pin, isValidPin: (pin: Pin) => boolean, blackList?: Set<Pin>) => {
  if (blackList && isBlackListed(pin, blackList)) return false
  return isValidPin(pin)
}

const generateRandomPin = (length: number): Pin => {
  let pin = ''
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10)
  }
  return pin
}

export const generatePins = ({
 length = PIN_LENGTH,
 count = PIN_TOTAL_QUANTITY,
 rules = [hasConsecutiveIdenticalDigits, hasConsecutiveIncrementalDigits],
 blackList,
}: PinGeneratorOptions = {}): Pin[] => {
  const isValidPin = createPinValidator(rules)

  if (length > 15) {
    const pins = new Set<Pin>()
    let attempts = 0
    const maxAttempts = count * MAX_ATTEMPTS_MULTIPLIER

    while (pins.size < count && attempts < maxAttempts) {
      const pin = generateRandomPin(length)
      if (isAcceptablePin(pin, isValidPin, blackList)) {
        pins.add(pin)
      }
      attempts++
    }

    if (pins.size < count) {
      throw new Error(
        `Could only generate ${pins.size} of ${count} requested PINs after ${maxAttempts} attempts`,
      )
    }

    return [...pins]
  }

  const pool: Pin[] = []
  const totalCombinations = 10 ** length

  for (let i = 0; i < totalCombinations; i++) {
    const pin = String(i).padStart(length, '0')
    if (isAcceptablePin(pin, isValidPin, blackList)) {
      pool.push(pin)
    }
  }

  if (count > pool.length) {
    throw new Error(
      `Requested ${count} PINs but only ${pool.length} valid ${length}-digit PINs exist`,
    )
  }

  return shuffle(pool).slice(0, count)
}
