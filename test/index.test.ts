import { describe, expect, test } from 'vitest'

import clean, { createCleaner } from '../src'

describe('main export', () => {
  test('trim whitespace around string or undefined', () => {
    expect(clean(' a ')).toBe('a')
    expect(clean(' ')).toBe(undefined)
  })
  test('keep null value', () => {
    expect(clean(null)).toBe(null)
  })
  test('keep zero', () => {
    expect(clean(0)).toBe(0)
  })
  test('remove empty array', () => {
    expect(clean([])).toBe(undefined)
  })
  test('remove empty object', () => {
    expect(clean({})).toBe(undefined)
  })
  test('complex object', () => {
    const before = {
      one: ' ',
      two: ['', '', '', ['']],
      three: ' four ',
      descriptions: ['SAMPLE SET', '', '', { foo: '', bar: null }],
      badNews: [null, '', '', 'SAMPLE'],
      five: ['f ', ' ', ' do'],
      six: { thing: 'one', zap: null, un: undefined },
      func: () => {
        // Empty function for testing
      },
      width: '',
      height: 0,
      finish: false,
      start: true,
      'nathan.drake@example.com': 'Issue #1',
    }
    const after = clean(before)
    expect(after).toEqual({
      three: 'four',
      descriptions: ['SAMPLE SET', { bar: null }],
      badNews: [null, 'SAMPLE'],
      five: ['f', 'do'],
      six: { thing: 'one', zap: null },
      height: 0,
      finish: false,
      start: true,
      'nathan.drake@example.com': 'Issue #1',
    })
  })
})

describe('createCleaner', () => {
  const cleaner = createCleaner({ isNull: <T>(_x: T) => undefined as T })
  test('custom null handler', () => {
    const result1 = cleaner({ kai: null })
    const result2 = cleaner({ kai: null, foo: true })
    expect(result1).toBe(undefined)
    expect(result2).toEqual({ foo: true })
  })
})
