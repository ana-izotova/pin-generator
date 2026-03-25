export type Pin = string

export type ValidationRule = (pin: Pin) => boolean

export interface PinGeneratorOptions {
  length?: number
  rules?: ValidationRule[]
  blackList?: Set<Pin>
  count?: number
}
