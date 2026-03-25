import type { Pin, ValidationRule } from '@/lib/types'

export const createPinValidator = (validationRules: ValidationRule[]) => (pin: Pin): boolean => {
  return validationRules.every((rule) => !rule(pin))
}
