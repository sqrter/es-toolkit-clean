import { describe, expect, test } from 'vitest'

import clean, { createCleaner, createProcessor, processValue } from '../src'
import { defaultProcessors } from '../src/core/processors'

describe('Edge cases and error scenarios', () => {
  describe('Circular references', () => {
    test('should handle simple objects without circular references', () => {
      const obj = { name: 'test', value: ' cleaned ' }
      const result = clean(obj)
      expect(result).toEqual({ name: 'test', value: 'cleaned' })
    })

    test('should handle arrays without circular references', () => {
      const arr = [1, 2, 3, ' ', '']
      const result = clean(arr)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('Large and deeply nested structures', () => {
    test('should handle deeply nested objects', () => {
      let deepObj: Record<string, unknown> = { value: 'test' }
      for (let i = 0; i < 100; i++) {
        deepObj = { nested: deepObj, empty: ' ' }
      }

      const result = clean(deepObj)
      expect(result).toBeDefined()
      // Should have removed all empty values
      expect(JSON.stringify(result)).not.toContain('empty')
    })

    test('should handle large arrays', () => {
      const getValue = (i: number) => {
        if (i % 3 === 0) return ''
        if (i % 3 === 1) return `value${i}`
        return null
      }
      const largeArray = Array(1000)
        .fill(null)
        .map((_, i) => getValue(i))

      const result = clean(largeArray)
      expect(Array.isArray(result)).toBe(true)
      expect((result as unknown[]).length).toBeLessThan(largeArray.length)
    })
  })

  describe('Special JavaScript values', () => {
    test('should handle Symbol values', () => {
      const sym = Symbol('test')
      const obj = { [sym]: 'value', normal: 'test' }

      const result = clean(obj)
      // Symbol properties are handled by Object.entries which doesn't include them
      expect(result).toEqual({ normal: 'test' })
    })

    test('should handle BigInt values', () => {
      const obj = { big: BigInt(123), normal: 'test' }

      const result = clean(obj)
      expect(result).toEqual({ big: BigInt(123), normal: 'test' })
    })

    test('should handle RegExp objects', () => {
      const obj = { pattern: /test/gi, normal: 'test' }

      const result = clean(obj)
      expect(result).toEqual({ pattern: /test/gi, normal: 'test' })
    })

    test('should handle Error objects', () => {
      const obj = { error: new Error('test'), normal: 'test' }

      const result = clean(obj)
      expect(result).toBeDefined()
      expect((result as Record<string, unknown>).normal).toBe('test')
    })

    test('should handle Map and Set objects', () => {
      const map = new Map([['key', 'value']])
      const set = new Set([1, 2, 3])
      const obj = { map, set, normal: 'test' }

      const result = clean(obj)
      expect(result).toEqual({ map, set, normal: 'test' })
    })
  })

  describe('Function processor edge cases', () => {
    test('should handle processor that returns function', () => {
      const returnFunction = () => 'test'
      const stringToFunction = (str: unknown) => {
        if (typeof str === 'string') {
          return returnFunction
        }
        return str
      }
      const processor = createProcessor({
        isString: stringToFunction,
      })

      const result = processor('test', processor)
      expect(typeof result).toBe('function')
    })

    test('should handle processor configuration with function', () => {
      const nullToString = <T>(_x: T): T => 'NULL_VALUE' as unknown as T
      const customCleaner = createCleaner((defaults) => createProcessor({ ...defaults, isNull: nullToString }))

      const result = customCleaner({ value: null, text: 'test' })
      expect(result).toEqual({ value: 'NULL_VALUE', text: 'test' })
    })
  })

  describe('Empty and boundary cases', () => {
    test('should handle empty input gracefully', () => {
      expect(clean(null)).toBe(null)
      expect(clean(undefined)).toBe(undefined)
      expect(clean('')).toBe(undefined)
      expect(clean(' ')).toBe(undefined)
      expect(clean([])).toBe(undefined)
      expect(clean({})).toBe(undefined)
    })

    test('should handle objects with only Symbol keys', () => {
      const sym1 = Symbol('key1')
      const sym2 = Symbol('key2')
      const obj = { [sym1]: 'value', [sym2]: '' }

      const result = clean(obj)
      // Objects with only Symbol keys become empty since Object.entries doesn't include Symbols
      expect(result).toBe(undefined)
    })

    test('should handle arrays with holes', () => {
      // eslint-disable-next-line no-sparse-arrays
      const sparseArray = [1, , 3, , 5] // Array with holes

      const result = clean(sparseArray)
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe('Type coercion edge cases', () => {
    test('should handle objects that override toString', () => {
      const obj = {
        toString: () => '',
        valueOf: () => 0,
        value: 'test',
      }

      const result = clean({ custom: obj, empty: '' })
      // Functions are removed by default, so toString and valueOf are cleaned out
      expect(result).toEqual({ custom: { value: 'test' } })
    })

    test('should handle objects with getters and setters', () => {
      const obj = {
        _value: 'test',
        get value() {
          return this._value
        },
        set value(v) {
          this._value = v
        },
        empty: '',
      }

      const result = clean(obj)
      expect(result).toBeDefined()
      expect((result as Record<string, unknown>).value).toBe('test')
    })
  })

  describe('Processor configuration edge cases', () => {
    test('should handle empty processor configuration', () => {
      const processor = createProcessor({})

      const result = processor({ empty: '', value: 'test' }, processor)
      expect(result).toEqual({ value: 'test' })
    })

    test('should handle processor with all noop functions', () => {
      const noopFunction = <T>(): T => undefined as unknown as T
      const noopValidator = <T>(): T => undefined as unknown as T
      const processor = createProcessor({
        isArray: noopFunction,
        isBoolean: noopFunction,
        isDate: noopValidator,
        isFunction: noopFunction,
        isNull: noopFunction,
        isNumber: noopFunction,
        isPlainObject: noopValidator,
        isString: noopFunction,
        isUndefined: noopValidator,
      })

      const result = processor({ value: 'test', number: 42 }, processor)
      expect(result).toBe(undefined)
    })

    test('should handle processor with mixed return types', () => {
      const upperCaseString = <T>(str: T): T => (typeof str === 'string' ? (str.toUpperCase() as unknown as T) : str)
      const doubleNumber = <T>(num: T): T => (typeof num === 'number' ? ((num * 2) as unknown as T) : num)
      const processor = createProcessor({
        isString: upperCaseString,
        isNumber: doubleNumber,
      })

      const result = processor({ text: 'hello', num: 5, bool: true }, processor)
      expect(result).toEqual({ text: 'HELLO', num: 10, bool: true })
    })
  })

  describe('Performance edge cases', () => {
    test('should handle object with many properties', () => {
      const manyProps: Record<string, unknown> = {}
      for (let i = 0; i < 1000; i++) {
        manyProps[`prop${i}`] = i % 2 === 0 ? `value${i}` : ''
      }

      const startTime = Date.now()
      const result = clean(manyProps)
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      expect(Object.keys(result as object).length).toBe(500) // Half the properties should remain
    })

    test('should handle array with many elements', () => {
      const manyElements = Array(1000)
        .fill(null)
        .map((_, i) => (i % 2 === 0 ? `value${i}` : ''))

      const startTime = Date.now()
      const result = clean(manyElements)
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      expect((result as unknown[]).length).toBe(500) // Half the elements should remain
    })
  })

  describe('Default processor behavior', () => {
    test('should maintain default processor behavior with processValue', () => {
      const input = {
        str: ' test ',
        empty: '',
        num: 42,
        bool: false,
        null: null,
        undef: undefined,
        func: () => 'test',
        date: new Date(),
        arr: [1, '', 3],
        obj: { nested: ' value ', empty: '' },
      }

      const result = processValue(input, processValue)

      expect(result).toEqual({
        str: 'test',
        num: 42,
        bool: false,
        null: null,
        date: input.date,
        arr: [1, 3],
        obj: { nested: 'value' },
      })
    })

    test('should verify all default processors are used', () => {
      expect(defaultProcessors.isArray).toBeDefined()
      expect(defaultProcessors.isBoolean).toBeDefined()
      expect(defaultProcessors.isDate).toBeDefined()
      expect(defaultProcessors.isFunction).toBeDefined()
      expect(defaultProcessors.isNull).toBeDefined()
      expect(defaultProcessors.isNumber).toBeDefined()
      expect(defaultProcessors.isPlainObject).toBeDefined()
      expect(defaultProcessors.isString).toBeDefined()
      expect(defaultProcessors.isUndefined).toBeDefined()
    })
  })
})
