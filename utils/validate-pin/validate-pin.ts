import type { Pin } from '@/lib/types'

export const isValidPin = (pin: Pin): boolean => {
  for (let i = 0; i < pin.length - 1; i++) {
    if (pin[i] === pin[i + 1]) {
      return false
    }
  }

  for (let i = 0; i < pin.length - 2; i++) {
    const a = Number(pin[i])
    const b = Number(pin[i + 1])
    const c = Number(pin[i + 2])
    if (b === a + 1 && c === b + 1) {
      return false
    }
  }

  return true
}
