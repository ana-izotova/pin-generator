'use client'
import { ChangeEvent, SubmitEvent, useReducer } from 'react'
import { Pin, ValidationRule } from '@/lib/types'
import {
  hasAllEven,
  hasAllOdds,
  hasConsecutiveDecrementalDigits,
  hasConsecutiveIdenticalDigits,
  hasConsecutiveIncrementalDigits,
  hasRepeatedPattern,
  isPalindrome,
} from '@/utils/validate-pin/validation-rules'
import { createPinValidator } from '@/utils/validate-pin/validate-pin'

const ruleOptions: { name: string; label: string; rule: ValidationRule }[] = [
  {
    name: 'hasConsecutiveIdenticalDigits',
    label: 'Should not have consecutive identical digits',
    rule: hasConsecutiveIdenticalDigits,
  },
  {
    name: 'hasConsecutiveIncrementalDigits',
    label: 'Should not have consecutive incremental digits',
    rule: hasConsecutiveIncrementalDigits,
  },
  {
    name: 'hasConsecutiveDecrementalDigits',
    label: 'Should not have consecutive decremental digits',
    rule: hasConsecutiveDecrementalDigits,
  },
  { name: 'isPalindrome', label: 'Should not be a palindrome', rule: isPalindrome },
  { name: 'hasAllOdds', label: 'Should not have all odd digits', rule: hasAllOdds },
  { name: 'hasAllEven', label: 'Should not have all even digits', rule: hasAllEven },
  {
    name: 'hasRepeatedPattern',
    label: 'Should not have a repeated pattern',
    rule: hasRepeatedPattern,
  },
]

interface PinValidatorState {
  pin: Pin
  rules: Set<string>
  isValid: boolean | null
  error: string | null
}

type Action =
  | { type: 'setPin'; payload: string }
  | { type: 'toggleRule'; payload: string }
  | { type: 'setValid'; payload: boolean }
  | { type: 'setError'; payload: string }

const initialState: PinValidatorState = {
  pin: '',
  rules: new Set<string>(),
  isValid: null,
  error: null,
}

const reducer = (state: PinValidatorState, action: Action): PinValidatorState => {
  switch (action.type) {
    case 'setPin': {
      return { ...state, pin: action.payload, isValid: null, error: null }
    }
    case 'toggleRule': {
      const newRules = new Set(state.rules)
      if (newRules.has(action.payload)) {
        newRules.delete(action.payload)
      } else {
        newRules.add(action.payload)
      }
      return { ...state, rules: newRules, isValid: null, error: null }
    }
    case 'setValid': {
      return { ...state, isValid: action.payload, error: null }
    }
    case 'setError': {
      return { ...state, error: action.payload, isValid: null }
    }
    default:
      return state
  }
}

export default function PinValidatorPage() {
  const [{ pin, rules, isValid, error }, dispatch] = useReducer(reducer, initialState)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setPin', payload: event.target.value })
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'toggleRule', payload: event.target.name })
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (pin.length < 3) {
      dispatch({ type: 'setError', payload: 'Pin should be at least 3 characters' })
      return
    }

    if (rules.size === 0) {
      dispatch({
        type: 'setError',
        payload: 'Select at least 1 validation rule',
      })
      return
    }

    const selectedRules = ruleOptions
      .filter(({ name }) => rules.has(name))
      .map(({ rule }) => rule)
    const validate = createPinValidator(selectedRules)
    dispatch({ type: 'setValid', payload: validate(pin) })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">PIN Validator</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="pinValidator" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your PIN
            </label>
            <input
              type="text"
              id="pinValidator"
              value={pin}
              placeholder="e.g. 1357"
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Validation rules</legend>
            {ruleOptions.map(({ name, label }) => (
              <label key={name}
                     className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  name={name}
                  checked={rules.has(name)}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-500"
          >
            Validate
          </button>
        </form>
        <div className="h-8 flex items-center justify-center">
          {error &&
            <p className={'text-sm font-medium text-red-400'}>
              {error}
            </p>
          }
          {isValid !== null && (
            <p className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {isValid ? 'Valid PIN' : 'Invalid PIN'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
