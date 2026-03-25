'use client'
import { ChangeEvent, SubmitEvent, useReducer, useRef } from 'react'
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
  batchSize: 10,
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
  pinLength: number
  pinCount: number
  error: string
  isLoading: boolean
  blacklist: Set<string>
  isStateChanged: boolean
  shownPins: number
}

type Action =
  | { type: 'setPins'; payload: Pin[] }
  | { type: 'setError'; payload: string }
  | { type: 'setRules'; payload: string }
  | { type: 'setLength'; payload: number }
  | { type: 'setPinCount'; payload: number }
  | { type: 'setError'; payload: string }
  | { type: 'setIsLoading'; payload: boolean }
  | { type: 'setBlacklist'; payload: Set<string> }
  | { type: 'setIsStateChanged', payload: boolean }
  | { type: 'setShownPins', payload: number }


const initialState: State = {
  generatedPins: [],
  rules: new Set(),
  pinLength: 4,
  pinCount: 10,
  error: '',
  isLoading: false,
  blacklist: new Set(),
  isStateChanged: false,
  shownPins: 0,
}

const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'setPins': {
      return { ...state, pins: payload, isLoading: false, isStateChanged: false, shownPins: 0 }
    }
    case 'setError': {
      return { ...state, error: payload, isLoading: false }
    }
    case 'setRules': {
      const newRules = new Set(state.rules)
      if (newRules.has(payload)) {
        newRules.delete(payload)
      } else {
        newRules.add(payload)
      }
      return { ...state, rules: newRules, isStateChanged: true }
    }
    case 'setLength': {
      return { ...state, pinLength: payload, isStateChanged: true }
    }
    case 'setPinCount': {
      return { ...state, pinCount: payload, isStateChanged: true }
    }
    case 'setIsLoading': {
      return { ...state, isLoading: payload }
    }
    case 'setBlacklist': {
      return { ...state, blacklist: payload, isStateChanged: true }
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
    {
      generatedPins,
      rules,
      pinCount,
      pinLength,
      error,
      blacklist,
      isStateChanged,
      shownPins,
    },
    dispatch,
  ] = useReducer(reducer, initialState)

  const handleGenerateClick = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const appliedRules = ruleOptions
      .filter(option => rules.has(option.name))
      .map(option => option.rule)

    try {
      const generatedPins = generatePins({
        length: pinLength,
        count: pinCount,
        rules: appliedRules,
        blackList: blacklist,
      })
      dispatch({ type: 'setPins', payload: generatedPins })
      batchIterator.current = batchPins(generatedPins, CONSTRAINTS.batchSize)
      handleShowMore()
    } catch (error) {
      dispatch({ type: 'setError', payload: error.message })
    }
  }

  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setLength', payload: Number(e.target.value) })
  }

  const handlePinCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setPinCount', payload: Number(e.target.value) })
  }

  const handleCheckboxClick = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setRules', payload: e.target.name })
  }

  const handleBlacklistChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const blacklist = new Set(
      e.target.value.split(',').map((pin) => pin.trim()),
    )

    const timeout = setTimeout(() => {
      dispatch({ type: 'setBlacklist', payload: blacklist })
      clearTimeout(timeout)
    })
  }

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
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Generate
          </button>
        </form>
        <div className="space-y-3">
          {error && (
            <p className="text-sm font-medium text-red-500 text-center">{error}</p>
          )}
          {shownPins > 0 && (
            <ul className="grid grid-cols-5 gap-2 text-sm text-gray-800 font-mono">
              {generatedPins.slice(0, shownPins).map((pin, i) => (
                <li key={i} className="rounded bg-gray-100 px-2 py-1 text-center">{pin}</li>
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
