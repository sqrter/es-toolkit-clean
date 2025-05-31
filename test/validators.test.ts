import { describe, expect, test } from 'vitest'

import {
  isArray,
  isBoolean,
  isDate,
  isEmptyArr,
  isEmptyArray,
  isEmptyObject,
  isEmptyString,
  isFunction,
  isNull,
  isNumber,
  isPlainObject,
  isString,
  isUndefined,
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

  describe('isBoolean', () => {
    test('should identify booleans correctly', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
      expect(isBoolean(Boolean(1))).toBe(true)
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean('true')).toBe(false)
      expect(isBoolean(null)).toBe(false)
    })
  })

  describe('isDate', () => {
    test('should identify dates correctly', () => {
      expect(isDate(new Date())).toBe(true)
      expect(isDate(new Date('2023-01-01'))).toBe(true)
      expect(isDate(Date.now())).toBe(false)
      expect(isDate('2023-01-01')).toBe(false)
      expect(isDate(null)).toBe(false)
    })
  })

  describe('isFunction', () => {
    test('should identify functions correctly', () => {
      expect(
        isFunction(() => {
          // empty function
        }),
      ).toBe(true)
      expect(
        isFunction(function () {
          // empty function
        }),
      ).toBe(true)
      expect(isFunction(() => Promise.resolve())).toBe(true)
      expect(isFunction(Date)).toBe(true)
      expect(isFunction('function')).toBe(false)
      expect(isFunction({})).toBe(false)
      expect(isFunction(null)).toBe(false)
    })
  })

  describe('isNull', () => {
    test('should identify null correctly', () => {
      expect(isNull(null)).toBe(true)
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
      expect(isNull('')).toBe(false)
      expect(isNull(false)).toBe(false)
      expect(isNull({})).toBe(false)
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

  describe('isPlainObject', () => {
    test('should identify plain objects correctly', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ key: 'value' })).toBe(true)
      expect(isPlainObject(Object.create(null))).toBe(true)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(null)).toBe(false)
    })
  })

  describe('isString', () => {
    test('should identify strings correctly', () => {
      expect(isString('')).toBe(true)
      expect(isString('hello')).toBe(true)
      expect(isString(String('test'))).toBe(true)
      expect(isString(42)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString({})).toBe(false)
    })
  })

  describe('isUndefined', () => {
    test('should identify undefined correctly', () => {
      expect(isUndefined(undefined)).toBe(true)
      expect(isUndefined(void 0)).toBe(true)
      expect(isUndefined(null)).toBe(false)
      expect(isUndefined('')).toBe(false)
      expect(isUndefined(0)).toBe(false)
      expect(isUndefined(false)).toBe(false)
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
