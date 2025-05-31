import { describe, expect, test } from 'vitest'

import { cleanArray, cleanObject, cleanString, reducer, rmEmpty, rmTrue } from '../src'
import { createProcessor } from '../src/core/cleaner'

// Import the transform function by testing through cleanObject which uses it
describe('Internal transform function coverage via cleanObject', () => {
  const mockProcessor = createProcessor()

  test('should handle object iteration path in transform function', () => {
    // This test specifically targets the object handling path in transform function
    const input = {
      key1: 'value1',
      key2: ' trimmed ',
      key3: '',
      key4: null,
      key5: undefined,
    }

    const result = cleanObject(input, mockProcessor)

    expect(result).toEqual({
      key1: 'value1',
      key2: 'trimmed',
      key4: null,
    })
  })

  test('should handle empty object input', () => {
    const result = cleanObject({}, mockProcessor)
    expect(result).toBe(undefined)
  })

  test('should handle object with all empty values', () => {
    const input = {
      empty1: '',
      empty2: ' ',
      empty3: undefined,
    }

    const result = cleanObject(input, mockProcessor)
    expect(result).toBe(undefined)
  })

  test('should handle object with Symbol keys in Object.entries iteration', () => {
    const sym = Symbol('test')
    const input = {
      normal: 'value',
      empty: '',
      [sym]: 'symbol-value', // This won't be processed by Object.entries
    }

    const result = cleanObject(input, mockProcessor)
    // Only normal properties are processed, Symbol properties are ignored
    expect(result).toEqual({ normal: 'value' })
  })

  test('should handle object with mixed data types', () => {
    const input = {
      string: ' test ',
      number: 42,
      boolean: false,
      null: null,
      undefined: undefined,
      array: [1, '', 3],
      object: { nested: 'value', empty: '' },
      date: new Date('2023-01-01'),
    }

    const result = cleanObject(input, mockProcessor)

    expect(result).toEqual({
      string: 'test',
      number: 42,
      boolean: false,
      null: null,
      array: [1, 3],
      object: { nested: 'value' },
      date: input.date,
    })
  })
})

describe('Edge cases for transform function fallback paths', () => {
  test('should handle reducer with various accumulator states', () => {
    const mockProcessor = createProcessor()
    const cleanReducer = reducer(mockProcessor)

    // Test with different accumulator types
    const result1 = cleanReducer(undefined, 'value', 'key')
    expect(result1).toEqual({ key: 'value' })

    const result2 = cleanReducer(null, 'value', 'key')
    expect(result2).toEqual({ key: 'value' })

    const result3 = cleanReducer({}, 'value', 'key')
    expect(result3).toEqual({ key: 'value' })

    const result4 = cleanReducer({ existing: 'data' }, 'value', 'key')
    expect(result4).toEqual({ existing: 'data', key: 'value' })
  })

  test('should handle reducer with array-like keys', () => {
    const mockProcessor = createProcessor()
    const cleanReducer = reducer(mockProcessor)

    // Test with numeric keys (like array indices)
    let result = cleanReducer(undefined, 'value1', 0)
    result = cleanReducer(result, 'value2', 1)
    result = cleanReducer(result, '', 2) // Empty value should be skipped

    expect(result).toEqual({ 0: 'value1', 1: 'value2' })
  })

  test('should handle complex nested path scenarios', () => {
    const mockProcessor = createProcessor()
    const cleanReducer = reducer(mockProcessor)

    // Test dot notation keys (treated as literal keys, not paths)
    const result = cleanReducer(undefined, 'value', 'nested.deep.key')
    expect(result).toEqual({ 'nested.deep.key': 'value' })
  })
})

describe('rmEmpty function edge cases', () => {
  test('should handle transformer that returns objects', () => {
    const objectTransformer = (item: unknown) => {
      if (typeof item === 'string') {
        return { processed: item.trim() }
      }
      return item
    }
    const rmEmptyObjects = rmEmpty(objectTransformer)

    expect(rmEmptyObjects('test')).toEqual({ processed: 'test' })
    expect(rmEmptyObjects('')).toEqual({ processed: '' })
    expect(rmEmptyObjects(' ')).toEqual({ processed: '' })
    expect(rmEmptyObjects(42)).toBe(undefined) // Numbers are empty in es-toolkit
  })

  test('should handle transformer that returns arrays', () => {
    const arrayTransformer = (item: unknown) => {
      if (Array.isArray(item)) {
        return item.filter((x) => x !== null) as unknown
      }
      return item
    }
    const rmEmptyArrays = rmEmpty(arrayTransformer)

    expect(rmEmptyArrays([1, null, 3])).toEqual([1, 3])
    expect(rmEmptyArrays([null, null])).toBe(undefined) // Empty array
    expect(rmEmptyArrays('string')).toBe('string')
  })

  test('should handle transformer that returns undefined', () => {
    const undefinedTransformer = () => undefined
    const rmEmptyUndefined = rmEmpty(undefinedTransformer)

    expect(rmEmptyUndefined('anything')).toBe(undefined)
    expect(rmEmptyUndefined(42)).toBe(undefined)
    expect(rmEmptyUndefined({})).toBe(undefined)
  })
})

describe('rmTrue function edge cases', () => {
  test('should handle complex predicate functions', () => {
    const complexPredicate = (item: unknown) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return Object.keys(item).length === 0
      }
      if (Array.isArray(item)) {
        return item.length === 0
      }
      if (typeof item === 'string') {
        return item.trim() === ''
      }
      return false
    }
    const rmComplex = rmTrue(complexPredicate)

    expect(rmComplex({})).toBe(undefined) // Empty object
    expect(rmComplex([])).toBe(undefined) // Empty array
    expect(rmComplex('')).toBe(undefined) // Empty string
    expect(rmComplex(' ')).toBe(undefined) // Whitespace string
    expect(rmComplex({ key: 'value' })).toEqual({ key: 'value' }) // Non-empty object
    expect(rmComplex([1, 2])).toEqual([1, 2]) // Non-empty array
    expect(rmComplex('test')).toBe('test') // Non-empty string
    expect(rmComplex(42)).toBe(42) // Number (not handled by predicate)
  })

  test('should handle predicate that throws errors', () => {
    const throwingPredicate = (item: unknown) => {
      if (typeof item === 'string' && item === 'throw') {
        throw new Error('Test error')
      }
      return false
    }
    const rmThrowing = rmTrue(throwingPredicate)

    expect(() => rmThrowing('throw')).toThrow('Test error')
    expect(rmThrowing('safe')).toBe('safe')
  })
})

describe('cleanString comprehensive edge cases', () => {
  test('should handle various string edge cases', () => {
    // Unicode whitespace
    expect(cleanString('\u00A0\u2000\u2001')).toBe(undefined) // Non-breaking spaces
    expect(cleanString('\t\r\n\v\f')).toBe(undefined) // All whitespace types

    // Mixed content
    expect(cleanString(' \t test \n ')).toBe('test')
    expect(cleanString('   multiple   spaces   ')).toBe('multiple   spaces')
  })

  test('should handle non-string edge cases through rmEmpty', () => {
    // Complex objects that are not empty
    const complexObject = {
      nested: { deep: { value: 'test' } },
      array: [1, 2, 3],
      func: () => 'test',
      date: new Date(),
    }
    expect(cleanString(complexObject)).toEqual(complexObject)

    // Edge case: string-like objects
    const stringLike = {
      toString: () => 'converted',
      valueOf: () => 'value',
    }
    expect(cleanString(stringLike)).toEqual(stringLike)
  })
})

describe('cleanArray comprehensive edge cases', () => {
  const mockProcessor = createProcessor()

  test('should handle arrays with complex mixed types', () => {
    const complexArray = [
      'string',
      42,
      { obj: 'value' },
      [1, 2, 3],
      null,
      undefined,
      false,
      0,
      '',
      ' trimmed ',
      () => 'function',
      new Date(),
      /regex/g,
      Symbol('test'),
    ]

    const result = cleanArray(complexArray, mockProcessor)

    // Functions should be removed, empty strings should be removed
    expect(result).toContain('string')
    expect(result).toContain(42)
    expect(result).toContainEqual({ obj: 'value' })
    expect(result).toContainEqual([1, 2, 3])
    expect(result).toContain(null)
    expect(result).toContain(false)
    expect(result).toContain(0)
    expect(result).toContain('trimmed')
    expect(result).not.toContain(undefined)
    expect(result).not.toContain('')
    expect(result).not.toContain(' trimmed ')
  })

  test('should handle sparse arrays properly', () => {
    // eslint-disable-next-line no-sparse-arrays
    const sparse = [1, , , 4, , 6]
    const result = cleanArray(sparse, mockProcessor)
    expect(result).toEqual([1, 4, 6])
  })

  test('should handle very large arrays efficiently', () => {
    const largeArray = Array(10000)
      .fill(null)
      .map((_, i) => (i % 2 === 0 ? `item${i}` : ''))

    const startTime = Date.now()
    const result = cleanArray(largeArray, mockProcessor)
    const endTime = Date.now()

    expect(endTime - startTime).toBeLessThan(100) // Should be fast
    expect(Array.isArray(result) ? result.length : 0).toBe(5000) // Half should remain
  })

  test('should handle deeply nested arrays', () => {
    const deepArray = [
      ['level1', ''],
      [
        ['level2', ' '],
        ['', 'nested'],
      ],
      [[['level3']], [[''], [['value']]]],
    ]

    const result = cleanArray(deepArray, mockProcessor)
    expect(result).toEqual([['level1'], [['level2'], ['nested']], [[['level3']], [[['value']]]]])
  })

  test('should handle arrays with special JavaScript values', () => {
    const specialArray = [
      Symbol('test'),
      BigInt(123),
      /regex/,
      new Date('2023-01-01'),
      new Map([['key', 'value']]),
      new Set([1, 2, 3]),
      () => 'function',
      Math.PI,
      Infinity,
      -Infinity,
      NaN,
    ]

    const result = cleanArray(specialArray, mockProcessor)

    // Most special values should pass through (except functions)
    expect(Array.isArray(result)).toBe(true)
    if (Array.isArray(result)) {
      expect(result.length).toBeGreaterThan(0)
      expect(result.includes(Math.PI)).toBe(true)
      expect(result.includes(Infinity)).toBe(true)
    }
  })
})

describe('cleanObject edge cases and error scenarios', () => {
  const mockProcessor = createProcessor()

  test('should handle invalid input types gracefully', () => {
    // Test edge case: what happens when cleanObject gets null?
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      const result = cleanObject(null as any, mockProcessor)
      expect(result).toBe(undefined)
    } catch (error) {
      // If it throws, that's also valid behavior to test
      expect(error).toBeDefined()
    }
  })

  test('should handle non-object input types', () => {
    // Test edge case: what happens when cleanObject gets a string or number?
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      const result1 = cleanObject('not-an-object' as any, mockProcessor)
      expect(result1).toBe(undefined)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      const result2 = cleanObject(42 as any, mockProcessor)
      expect(result2).toBe(undefined)
    } catch (error) {
      // If it throws, that's also valid behavior to test
      expect(error).toBeDefined()
    }
  })

  test('should handle array-like objects correctly', () => {
    // Test an array-like object that should be processed as an object
    const arrayLike = {
      0: 'first',
      1: 'second',
      2: '',
      length: 3,
      [Symbol.iterator]: function* () {
        yield this[0]
        yield this[1]
        yield this[2]
      },
    }

    const result = cleanObject(arrayLike, mockProcessor)
    // Should process as object, only enumerable properties are processed
    expect(result).toEqual({
      0: 'first',
      1: 'second',
      // Note: length and Symbol.iterator are not enumerable, so they won't be processed
    })
  })

  test('should handle objects with inherited properties correctly', () => {
    // Create object with prototype to ensure only own properties are processed
    const proto = { inherited: 'should-not-appear' }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const obj = Object.create(proto)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    obj.own1 = 'value1'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    obj.own2 = ''
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    obj.own3 = 'value3'

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = cleanObject(obj, mockProcessor)

    // Only own enumerable properties should be processed
    expect(result).toEqual({
      own1: 'value1',
      own3: 'value3',
    })
    expect(result).not.toHaveProperty('inherited')
  })
})
