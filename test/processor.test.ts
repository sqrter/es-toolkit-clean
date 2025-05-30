import { noop } from 'es-toolkit/compat'
import { describe, expect, test } from 'vitest'

import { createProcessor, processValue } from '../src'

describe('processValue', () => {
  test('trim whitespace around string or undefined', () => {
    expect(processValue(' a ', processValue)).toBe('a')
    expect(processValue(' ', processValue)).toBe(undefined)
  })
  test('keep null value', () => {
    expect(processValue(null, processValue)).toBe(null)
  })
})

describe('createProcessor', () => {
  const clean = createProcessor({ isNull: noop })
  test('custom null handler', () => {
    expect(clean(null, clean)).toBe(undefined)
    expect(clean({ kai: null }, clean)).toBe(undefined)
    expect(clean({ kai: null, foo: true }, clean)).toEqual({ foo: true })
  })
})
