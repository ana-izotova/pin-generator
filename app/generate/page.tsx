'use client'
import { ChangeEvent, SubmitEvent, useCallback, useReducer, useRef } from 'react'
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
import { generatePins } from '@/utils/generate-pins'

const CONSTRAINTS = {
  pinLength: {
    MIN: 3,
    MAX: 20,
  },
  pinCount: {
    MIN: 1,
    MAX: 100,
  },
  batchSize: 20,
}

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
  {
    name: 'isPalindrome',
    label: 'Should not be a palindrome',
    rule: isPalindrome,
  },
  {
    name: 'hasAllOdds',
    label: 'Should not have all odd digits',
    rule: hasAllOdds,
  },
  {
    name: 'hasAllEven',
    label: 'Should not have all even digits',
    rule: hasAllEven,
  },
  {
    name: 'hasRepeatedPattern',
    label: 'Should not have a repeated pattern',
    rule: hasRepeatedPattern,
  },
]

function* batchPins(pins: Pin[], batchSize: number) {
  for (let i = 0; i < pins.length; i += batchSize) {
    yield pins.slice(i, i + batchSize)
  }
}

interface State {
  generatedPins: Pin[]
  rules: Set<string>
  pinLength: string
  pinCount: string
  error: string
  isLoading: boolean
  blacklist: Set<string>
  shownPins: number
}

type Action =
  | { type: 'setPins'; payload: Pin[] }
  | { type: 'setError'; payload: string }
  | { type: 'setRules'; payload: string }
  | { type: 'setLength'; payload: string }
  | { type: 'setPinCount'; payload: string }
  | { type: 'setBlacklist'; payload: Set<string> }
  | { type: 'setIsLoading'; payload: boolean }
  | { type: 'setShownPins'; payload: number }


const initialState: State = {
  generatedPins: [],
  rules: new Set(),
  pinLength: '4',
  pinCount: '10',
  error: '',
  isLoading: false,
  blacklist: new Set(),
  shownPins: 0,
}

const reducer = (state: State, { type, payload }: Action): State => {
  switch (type) {
    case 'setPins': {
      return { ...state, generatedPins: payload, error: '', isLoading: false, shownPins: 0 }
    }
    case 'setError': {
      return { ...state, error: payload, isLoading: false }
    }
    case 'setIsLoading': {
      return { ...state, isLoading: payload }
    }
    case 'setRules': {
      const newRules = new Set(state.rules)
      if (newRules.has(payload)) {
        newRules.delete(payload)
      } else {
        newRules.add(payload)
      }
      return { ...state, rules: newRules, generatedPins: [], shownPins: 0, error: '' }
    }
    case 'setLength': {
      return { ...state, pinLength: payload, generatedPins: [], shownPins: 0, error: '' }
    }
    case 'setPinCount': {
      return { ...state, pinCount: payload, generatedPins: [], shownPins: 0, error: '' }
    }
    case 'setBlacklist': {
      return { ...state, blacklist: payload, generatedPins: [], shownPins: 0, error: '' }
    }
    case 'setShownPins': {
      return { ...state, shownPins: state.shownPins + payload }
    }
    default: {
      return state
    }
  }
}


export default function PinGeneratorPage() {
  const [
    { generatedPins, rules, pinCount, pinLength, error, isLoading, blacklist, shownPins },
    dispatch,
  ] = useReducer(reducer, initialState)

  const handleGenerateClick = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const appliedRules = ruleOptions
      .filter(option => rules.has(option.name))
      .map(option => option.rule)

    const length = Number(pinLength)
    const count = Number(pinCount)

    if (!length || !count) {
      dispatch({ type: 'setError', payload: 'Please enter valid numbers' })
      return
    }

    dispatch({ type: 'setIsLoading', payload: true })

    try {
      const generatedPins = generatePins({
        length,
        count,
        rules: appliedRules,
        blackList: blacklist,
      })
      dispatch({ type: 'setPins', payload: generatedPins })
      batchIterator.current = batchPins(generatedPins, CONSTRAINTS.batchSize)
      handleShowMore()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate PINs'
      dispatch({ type: 'setError', payload: message })
    }
  }

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setLength', payload: e.target.value })
  }

  const handlePinCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setPinCount', payload: e.target.value })
  }

  const handleCheckboxClick = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setRules', payload: e.target.name })
  }

  const blacklistTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBlacklistChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    if (blacklistTimeout.current) {
      clearTimeout(blacklistTimeout.current)
    }

    blacklistTimeout.current = setTimeout(() => {
      const blacklist = new Set(
        value.split(',').map((pin) => pin.trim()).filter(Boolean),
      )
      dispatch({ type: 'setBlacklist', payload: blacklist })
    }, 300)
  }, [])

  const batchIterator = useRef<Generator<Pin[]> | null>(null)

  const handleShowMore = () => {
    if (!batchIterator.current) return
    const { value, done } = batchIterator.current.next()
    if (done) {
      dispatch({ type: 'setError', payload: 'No more pins to show' })
      return
    }
    dispatch({ type: 'setShownPins', payload: value.length })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">PIN Generator</h1>
        <form onSubmit={handleGenerateClick} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col text-sm font-medium text-gray-700 gap-1">
              PIN length
              <input
                name="pinLength"
                type="number"
                value={pinLength}
                onChange={handleLengthChange}
                min={CONSTRAINTS.pinLength.MIN}
                max={CONSTRAINTS.pinLength.MAX}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-gray-700 gap-1">
              PIN count
              <input
                name="pinCount"
                type="number"
                value={pinCount}
                onChange={handlePinCountChange}
                min={CONSTRAINTS.pinCount.MIN}
                max={CONSTRAINTS.pinCount.MAX}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Validation rules</legend>
            {ruleOptions.map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  name={name}
                  type="checkbox"
                  checked={rules.has(name)}
                  onChange={handleCheckboxClick}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="space-y-1">
            <label htmlFor="blacklist" className="block text-sm font-medium text-gray-700">
              Blacklisted PINs (comma-separated)
            </label>
            <textarea
              id="blacklist"
              onChange={handleBlacklistChange}
              placeholder="e.g. 1234, 0000, 9999"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        <div className="space-y-3">
          {error && (
            <p className="text-sm font-medium text-red-500 text-center">{error}</p>
          )}
          {shownPins > 0 && (
            <ul className="flex flex-wrap justify-center-safe gap-2 text-sm text-gray-800 font-mono">
              {generatedPins.slice(0, shownPins).map((pin, i) => (
                <li key={i} className="rounded bg-gray-100 px-2 py-1 text-center break-all">{pin}</li>
              ))}
            </ul>
          )}
          {shownPins > 0 && shownPins < generatedPins.length && (
            <button
              type="button"
              onClick={handleShowMore}
              className="w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
