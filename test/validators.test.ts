import { describe, expect, test } from 'vitest'

import {
  isArguments,
  isArray,
  isArrayLike,
  isEmpty,
  isEmptyArr,
  isEmptyArray,
  isEmptyObject,
  isEmptyString,
  isNumber,
  isPrototype,
  rejectEmpty,
} from '../src/types/validators'

describe('Type checking validators', () => {
  describe('isArray', () => {
    test('should identify arrays correctly', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray([])).toBe(true)
      expect(isArray({})).toBe(false)
      expect(isArray('array')).toBe(false)
      expect(isArray(null)).toBe(false)
    })
  })

  describe('isNumber', () => {
    test('should identify numbers correctly', () => {
      expect(isNumber(0)).toBe(true)
      expect(isNumber(42)).toBe(true)
      expect(isNumber(-1)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(Infinity)).toBe(true)
      expect(isNumber(NaN)).toBe(true)
      expect(isNumber('42')).toBe(false)
      expect(isNumber(null)).toBe(false)
    })
  })

  describe('isArguments', () => {
    test('should identify arguments objects correctly', () => {
      const args = (function () {
        // eslint-disable-next-line prefer-rest-params
        return arguments
      })()
      const strictArgs = (function () {
        'use strict'
        // eslint-disable-next-line prefer-rest-params
        return arguments
      })()

      expect(isArguments(args)).toBe(true)
      expect(isArguments(strictArgs)).toBe(true)
      expect(isArguments([1, 2, 3])).toBe(false)
      expect(isArguments({})).toBe(false)
      expect(isArguments(null)).toBe(false)
      expect(isArguments()).toBe(false)
    })
  })

  describe('isArrayLike', () => {
    test('should identify array-like objects correctly', () => {
      expect(isArrayLike([1, 2, 3])).toBe(true)
      expect(isArrayLike('abc')).toBe(true)
      expect(isArrayLike({ 0: 'a', length: 1 })).toBe(true)
      expect(isArrayLike({ length: 0 })).toBe(true)
      expect(isArrayLike({})).toBe(false)
      expect(isArrayLike(null)).toBe(false)
      expect(isArrayLike()).toBe(false)
      expect(isArrayLike(() => undefined)).toBe(false)
    })
  })

  describe('isEmpty', () => {
    test('should identify empty values correctly', () => {
      expect(isEmpty()).toBe(true)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty()).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty(new Map())).toBe(true)
      expect(isEmpty(new Set())).toBe(true)

      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(new Map([['key', 'value']]))).toBe(false)
      expect(isEmpty(new Set([1, 2, 3]))).toBe(false)
    })

    test('should handle array-like objects with special conditions', () => {
      // Test the specific branches in isEmpty that check for array-like behavior
      const arrayLikeWithoutSplice = { 0: 'a', 1: 'b', length: 2 }
      expect(isEmpty(arrayLikeWithoutSplice)).toBe(false)

      // Test with actual arguments object
      const args = (function (...params) {
        return params
      })(1, 2, 3)
      expect(isEmpty(args)).toBe(false)

      // Test with empty arguments
      const emptyArgs = (function (...params) {
        return params
      })()
      expect(isEmpty(emptyArgs)).toBe(true)
    })

    test('should handle prototype objects', () => {
      class TestConstructor {
        customProp?: string
      }
      TestConstructor.prototype.customProp = 'test'

      const proto = TestConstructor.prototype
      expect(isEmpty(proto)).toBe(false) // Has customProp

      // Test empty prototype (only constructor)
      function EmptyConstructor(): void {
        // Empty constructor for testing
      }
      expect(isEmpty(EmptyConstructor.prototype)).toBe(true)
    })
  })

  describe('isPrototype', () => {
    test('should identify prototype objects correctly', () => {
      class TestConstructor {
        // Constructor for testing prototypes
      }
      expect(isPrototype(TestConstructor.prototype)).toBe(true)
      expect(isPrototype(Object.prototype)).toBe(true)
      expect(isPrototype(Array.prototype)).toBe(true)

      expect(isPrototype({})).toBe(false)
      expect(isPrototype([])).toBe(false)
      const testInstance: object = new TestConstructor()
      expect(isPrototype(testInstance)).toBe(false)
    })

    test('should handle objects without constructor', () => {
      const objWithoutConstructor = Object.create(null) as object
      expect(isPrototype(objWithoutConstructor)).toBe(false)
    })
  })
})

describe('Empty value validators', () => {
  describe('isEmptyString', () => {
    test('should identify empty strings correctly', () => {
      expect(isEmptyString('')).toBe(true)
      expect(isEmptyString(' ')).toBe(true)
      expect(isEmptyString('  \t\n  ')).toBe(true)
      expect(isEmptyString('hello')).toBe(false)
      expect(isEmptyString(' hello ')).toBe(false)
      expect(isEmptyString(null)).toBe(false)
      expect(isEmptyString(0)).toBe(false)
    })
  })

  describe('isEmptyObject', () => {
    test('should identify empty objects correctly', () => {
      expect(isEmptyObject({})).toBe(true)
      expect(isEmptyObject({ key: null })).toBe(true)
      expect(isEmptyObject({ key: undefined })).toBe(true)
      expect(isEmptyObject({ key: false })).toBe(true)
      expect(isEmptyObject({ key: 0 })).toBe(true)
      expect(isEmptyObject({ key: '' })).toBe(true)
      expect(isEmptyObject({ key: 'value' })).toBe(false)
      expect(isEmptyObject({ key: 1 })).toBe(false)
      expect(isEmptyObject({ key: true })).toBe(false)
      expect(isEmptyObject([])).toBe(false)
      expect(isEmptyObject(null)).toBe(false)
    })
  })

  describe('isEmptyArr', () => {
    test('should identify empty arrays correctly', () => {
      expect(isEmptyArr([])).toBe(true)
      expect(isEmptyArr([null])).toBe(true)
      expect(isEmptyArr([undefined])).toBe(true)
      expect(isEmptyArr([false])).toBe(true)
      expect(isEmptyArr([0])).toBe(true)
      expect(isEmptyArr([''])).toBe(true)
      expect(isEmptyArr([null, undefined, false, 0, ''])).toBe(true)
      expect(isEmptyArr(['value'])).toBe(false)
      expect(isEmptyArr([1])).toBe(false)
      expect(isEmptyArr([true])).toBe(false)
      expect(isEmptyArr([{}])).toBe(false)
      expect(isEmptyArr({})).toBe(false)
      expect(isEmptyArr(null)).toBe(false)
    })
  })

  describe('rejectEmpty', () => {
    test('should filter out empty values from arrays', () => {
      const input = [
        'valid',
        '',
        '   ',
        { key: 'value' },
        {},
        { empty: null },
        [1, 2, 3],
        [],
        [null, undefined],
        42,
        0,
        true,
        false,
        null,
        undefined,
      ]

      const result = rejectEmpty(input)

      expect(result).toContain('valid')
      expect(result).toContainEqual({ key: 'value' })
      expect(result).toContainEqual([1, 2, 3])
      expect(result).toContain(42)
      expect(result).toContain(0)
      expect(result).toContain(true)
      expect(result).toContain(false)
      expect(result).toContain(null)
      expect(result).toContain(undefined)

      expect(result).not.toContain('')
      expect(result).not.toContain('   ')
      expect(result).not.toContainEqual({})
      expect(result).not.toContainEqual({ empty: null })
      expect(result).not.toContainEqual([])
      expect(result).not.toContainEqual([null, undefined])
    })

    test('should handle edge cases', () => {
      expect(rejectEmpty([])).toEqual([])
      expect(rejectEmpty([1, 2, 3])).toEqual([1, 2, 3])
      expect(rejectEmpty(['', {}, []])).toEqual([])
    })
  })

  describe('isEmptyArray', () => {
    test('should identify effectively empty arrays', () => {
      expect(isEmptyArray([])).toBe(true)
      expect(isEmptyArray([null, undefined, false, 0, ''])).toBe(true)
      expect(isEmptyArray(['', {}, []])).toBe(true)
      // Note: isEmptyArray only does one level of recursion as documented
      expect(isEmptyArray([[], [''], [{}]])).toBe(false) // Contains nested arrays
      expect(isEmptyArray(['value'])).toBe(false)
      expect(isEmptyArray([1])).toBe(false)
      expect(isEmptyArray([true])).toBe(false)
      expect(isEmptyArray([{ key: 'value' }])).toBe(false)
      expect(isEmptyArray([[1, 2, 3]])).toBe(false)
      expect(isEmptyArray({})).toBe(false)
      expect(isEmptyArray(null)).toBe(false)
    })

    test('should handle nested empty structures', () => {
      // isEmptyArray only does one level of recursion, so deeply nested structures are not considered empty
      expect(isEmptyArray([[], [[]], [[[]]]])).toBe(false)
      expect(isEmptyArray([{}, [{}], [[{}]]])).toBe(false)
      expect(isEmptyArray(['', [''], [['']]])).toBe(false)

      // But simple one-level empty structures are detected
      expect(isEmptyArray([[], {}, ''])).toBe(true)
    })
  })
})
