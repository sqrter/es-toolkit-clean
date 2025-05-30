import { describe, expect, test } from 'vitest'

import { cleanArray, cleanObject, cleanString } from '../src'

describe('cleanString', () => {
  test('trim whitespace around string or undefined', () => {
    expect(cleanString(' a ')).toBe('a')
    expect(cleanString(' ')).toBe(undefined)
  })
})

describe('cleanArray and cleanObject', () => {
  test('basic functionality', () => {
    expect(cleanArray).toBeDefined()
    expect(cleanObject).toBeDefined()
  })
})
