import { Pin, ValidationRule } from '@/lib/types'

export const hasConsecutiveIdenticalDigits: ValidationRule = (pin) => {
  for (let i = 0; i < pin.length; i++) {
    if (pin[i] === pin[i + 1]) {
      return true
    }
  }

  return false
}

export const hasConsecutiveIncrementalDigits: ValidationRule = (pin) => {
  for (let i = 0; i < pin.length - 2; i++) {
    const a = Number(pin[i])
    const b = Number(pin[i + 1])
    const c = Number(pin[i + 2])

    if (b === a + 1 && c === b + 1) {
      return true
    }
  }

  return false
}

export const hasConsecutiveDecrementalDigits: ValidationRule = (pin) => {
  for (let i = 0; i < pin.length - 2; i++) {
    const a = Number(pin[i])
    const b = Number(pin[i + 1])
    const c = Number(pin[i + 2])

    if (b === a - 1 && c === b - 1) {
      return true
    }
  }

  return false
}

export const isPalindrome: ValidationRule = (pin) => {
  return pin === pin.split('').reverse().join('')
}

export const hasAllEven: ValidationRule = (pin) => {
  return [...pin].every((digit) => Number(digit) % 2 === 0)
}

export const hasAllOdds: ValidationRule = (pin) => {
  return [...pin].every((digit) => Number(digit) % 2 !== 0)
}

export const hasRepeatedPattern: ValidationRule = (pin) => {
  for (let i = 2; i <= pin.length / 2; i++) {
    if (pin.length % i !== 0) {
      continue
    }

    const chunk = pin.slice(0, i)
    if (chunk.repeat(pin.length / i) === pin) {
      return true
    }
  }

  return false
}

export const isBlackListed = (pin: Pin, blackList: Set<Pin>): boolean => {
  return blackList.has(pin)
}
