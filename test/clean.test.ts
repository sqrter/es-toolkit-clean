import { describe, expect, test } from 'vitest'

import { cleanArray, cleanObject, cleanString, reducer, rmEmpty, rmTrue } from '../src'
import { createProcessor } from '../src/core/cleaner'

describe('cleanString', () => {
  test('should trim whitespace and return cleaned string', () => {
    expect(cleanString(' a ')).toBe('a')
    expect(cleanString('hello world')).toBe('hello world')
    expect(cleanString('  test  ')).toBe('test')
  })

  test('should return undefined for empty strings', () => {
    expect(cleanString(' ')).toBe(undefined)
    expect(cleanString('')).toBe(undefined)
    expect(cleanString('\t\n')).toBe(undefined)
  })

  test('should handle non-string values', () => {
    // cleanString runs through rmEmpty, and es-toolkit isEmpty considers primitives as empty
    expect(cleanString(42)).toBe(undefined) // Numbers are considered empty
    expect(cleanString(null)).toBe(undefined) // null is considered empty
    expect(cleanString(undefined)).toBe(undefined) // undefined is considered empty
    expect(cleanString({})).toBe(undefined) // Empty object becomes undefined
    expect(cleanString([])).toBe(undefined) // Empty array becomes undefined
    expect(cleanString([1, 2])).toEqual([1, 2]) // Non-empty array passes through
    expect(cleanString({ key: 'value' })).toEqual({ key: 'value' }) // Non-empty object passes through
  })
})

describe('cleanArray', () => {
  const mockProcessor = createProcessor()

  test('should clean arrays and remove undefined values', () => {
    const input = ['hello', ' ', '', null, undefined, 0, false]
    const result = cleanArray(input, mockProcessor)
    expect(result).toEqual(['hello', null, 0, false])
  })

  test('should return undefined for arrays that become empty after cleaning', () => {
    const input = [' ', '', undefined]
    const result = cleanArray(input, mockProcessor)
    expect(result).toBe(undefined)
  })

  test('should handle nested arrays', () => {
    const input = [['hello', ' '], [' ', ''], ['world']]
    const result = cleanArray(input, mockProcessor)
    expect(result).toEqual([['hello'], ['world']])
  })

  test('should handle mixed data types', () => {
    const input = [{ name: 'test', empty: '' }, ' valid ', 42, null, [1, ' ', 3]]
    const result = cleanArray(input, mockProcessor)
    expect(result).toEqual([{ name: 'test' }, 'valid', 42, null, [1, 3]])
  })

  test('should return undefined for empty input array', () => {
    const result = cleanArray([], mockProcessor)
    expect(result).toBe(undefined)
  })
})

describe('cleanObject', () => {
  const mockProcessor = createProcessor()

  test('should clean objects and remove undefined properties', () => {
    const input = {
      name: 'test',
      empty: '',
      space: ' ',
      valid: 'value',
      number: 42,
      nullValue: null,
    }
    const result = cleanObject(input, mockProcessor)
    expect(result).toEqual({
      name: 'test',
      valid: 'value',
      number: 42,
      nullValue: null,
    })
  })

  test('should return undefined for objects that become empty after cleaning', () => {
    const input = { empty: '', space: ' ', undef: undefined }
    const result = cleanObject(input, mockProcessor)
    expect(result).toBe(undefined)
  })

  test('should handle nested objects', () => {
    const input = {
      user: {
        name: 'John',
        email: '',
        profile: {
          bio: ' ',
          age: 30,
        },
      },
      settings: {
        theme: '',
        lang: '',
      },
    }
    const result = cleanObject(input, mockProcessor)
    expect(result).toEqual({
      user: {
        name: 'John',
        profile: {
          age: 30,
        },
      },
    })
  })

  test('should handle arrays within objects', () => {
    const input = {
      items: ['valid', '', ' ', 'another'],
      emptyItems: ['', ' '],
      name: 'test',
    }
    const result = cleanObject(input, mockProcessor)
    expect(result).toEqual({
      items: ['valid', 'another'],
      name: 'test',
    })
  })
})

describe('rmEmpty', () => {
  test('should remove empty results from transformer', () => {
    const trimTransformer = (item: unknown) => (typeof item === 'string' ? item.trim() : item)
    const rmEmptyTrim = rmEmpty(trimTransformer)

    expect(rmEmptyTrim(' hello ')).toBe('hello')
    expect(rmEmptyTrim(' ')).toBe(undefined)
    expect(rmEmptyTrim('')).toBe(undefined)
    expect(rmEmptyTrim('test')).toBe('test')
    // rmEmpty transforms first, then checks if result is empty using es-toolkit isEmpty
    expect(rmEmptyTrim(42)).toBe(undefined) // Numbers are considered empty by es-toolkit
    expect(rmEmptyTrim(0)).toBe(undefined) // 0 is considered empty
    expect(rmEmptyTrim(false)).toBe(undefined) // false is considered empty
  })

  test('should work with array transformer', () => {
    const filterTransformer = (item: unknown) => (Array.isArray(item) ? item.filter((x) => x !== null) : item)
    const rmEmptyFilter = rmEmpty(filterTransformer)

    expect(rmEmptyFilter([1, null, 2])).toEqual([1, 2])
    expect(rmEmptyFilter([null, null])).toBe(undefined)
    expect(rmEmptyFilter([])).toBe(undefined)
    expect(rmEmptyFilter('string')).toBe('string')
  })
})

describe('rmTrue', () => {
  test('should remove values when transformer returns true', () => {
    const isEmptyString = (item: unknown) => typeof item === 'string' && item.trim() === ''
    const rmEmptyStrings = rmTrue(isEmptyString)

    expect(rmEmptyStrings('hello')).toBe('hello')
    expect(rmEmptyStrings(' ')).toBe(undefined)
    expect(rmEmptyStrings('')).toBe(undefined)
    expect(rmEmptyStrings(42)).toBe(42)
    expect(rmEmptyStrings(null)).toBe(null)
  })

  test('should work with number predicates', () => {
    const isZero = (item: unknown) => item === 0
    const rmZeros = rmTrue(isZero)

    expect(rmZeros(1)).toBe(1)
    expect(rmZeros(0)).toBe(undefined)
    expect(rmZeros(-1)).toBe(-1)
    expect(rmZeros('0')).toBe('0')
  })
})

describe('reducer', () => {
  const mockProcessor = createProcessor()
  const cleanReducer = reducer(mockProcessor)

  test('should build clean object by reducing properties', () => {
    let result: unknown = {}
    result = cleanReducer(result, 'value', 'key1')
    result = cleanReducer(result, '', 'key2') // should be removed
    result = cleanReducer(result, 42, 'key3')
    result = cleanReducer(result, ' ', 'key4') // should be removed

    expect(result).toEqual({
      key1: 'value',
      key3: 42,
    })
  })

  test('should handle undefined result accumulator', () => {
    let result: unknown = undefined
    result = cleanReducer(result, 'value', 'key1')
    result = cleanReducer(result, 42, 'key2')

    expect(result).toEqual({
      key1: 'value',
      key2: 42,
    })
  })

  test('should skip undefined cleaned values', () => {
    let result: unknown = {}
    result = cleanReducer(result, 'value', 'key1')
    result = cleanReducer(result, undefined, 'key2')
    result = cleanReducer(result, null, 'key3')

    expect(result).toEqual({
      key1: 'value',
      key3: null,
    })
  })

  test('should handle nested property paths', () => {
    let result: unknown = {}
    result = cleanReducer(result, 'value', 'nested.key')

    // Note: The reducer uses literal key names, not nested paths
    expect(result).toEqual({
      'nested.key': 'value',
    })
  })
})
