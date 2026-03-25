import type { Pin } from '@/lib/types'
import { PIN_LENGTH, PIN_TOTAL_QUANTITY, TOTAL_COMBINATIONS } from '@/lib/const'
import { isValidPin } from '@/utils/validate-pin'

export const generatePins = (): Pin[] => {
  const pins = new Set<Pin>()
  while (pins.size < PIN_TOTAL_QUANTITY) {
    const pin = String(Math.floor(Math.random() * TOTAL_COMBINATIONS)).padStart(PIN_LENGTH, '0')
    if (isValidPin(pin)) {
      pins.add(pin)
    }
  }
  return [...pins]
}
