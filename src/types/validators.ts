import { compact, identity, pickBy, trim } from 'es-toolkit'
import { isLength, isPlainObject, isString, isTypedArray } from 'es-toolkit/predicate'

import { getTag } from '../utils/helpers'

/**
 * Determines if the provided value is a prototype object.
 *
 * This function checks whether the given object is the prototype property
 * of its constructor. If the constructor is not a function, it compares
 * against Object.prototype instead.
 *
 * @param value - The object to check
 * @returns Boolean indicating whether the object is a prototype
 */
export function isPrototype(value: object) {
  const constructor = value.constructor
  const prototype: object =
    typeof constructor === 'function' && constructor.prototype ? (constructor.prototype as object) : Object.prototype

  return value === prototype
}

/**
 * Checks if the given value is an arguments object.
 *
 * This function tests whether the provided value is an arguments object or not.
 * It returns `true` if the value is an arguments object, and `false` otherwise.
 *
 * This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to an arguments object.
 *
 * @param {unknown} value - The value to test if it is an arguments object.
 * @returns {value is IArguments} `true` if the value is an arguments, `false` otherwise.
 *
 * @example
 * const args = (function() { return arguments; })();
 * const strictArgs = (function() { 'use strict'; return arguments; })();
 * const value = [1, 2, 3];
 *
 * console.log(isArguments(args)); // true
 * console.log(isArguments(strictArgs)); // true
 * console.log(isArguments(value)); // false
 */
export function isArguments(value?: unknown): value is IArguments {
  return value !== null && typeof value === 'object' && getTag(value) === '[object Arguments]'
}

/**
 * Checks if `value` is array-like.
 *
 * @param {unknown} value The value to check.
 * @returns {value is ArrayLike<unknown>} Returns `true` if `value` is array-like, else `false`.
 *
 * @example
 * isArrayLike([1, 2, 3]); // true
 * isArrayLike('abc'); // true
 * isArrayLike({ 0: 'a', length: 1 }); // true
 * isArrayLike({}); // false
 * isArrayLike(null); // false
 * isArrayLike(undefined); // false
 */
export function isArrayLike(value?: unknown): value is ArrayLike<unknown> {
  return value != null && typeof value !== 'function' && isLength((value as ArrayLike<unknown>).length)
}

/**
 * Checks if a given value is empty.
 *
 * - If the given value is a string, checks if it is an empty string.
 * - If the given value is an array, `Map`, or `Set`, checks if its size is 0.
 * - If the given value is an [array-like object](../predicate/isArrayLike.md), checks if its length is 0.
 * - If the given value is an object, checks if it is an empty object with no properties.
 * - Primitive values (strings, booleans, numbers, or bigints) are considered empty.
 *
 * @param {unknown} [value] - The value to check.
 * @returns {boolean} `true` if the value is empty, `false` otherwise.
 *
 * @example
 * isEmpty(); // true
 * isEmpty(null); // true
 * isEmpty(""); // true
 * isEmpty([]); // true
 * isEmpty({}); // true
 * isEmpty(new Map()); // true
 * isEmpty(new Set()); // true
 * isEmpty("hello"); // false
 * isEmpty([1, 2, 3]); // false
 * isEmpty({ a: 1 }); // false
 * isEmpty(new Map([["key", "value"]])); // false
 * isEmpty(new Set([1, 2, 3])); // false
 */
export function isEmpty(value?: unknown): boolean {
  if (value == null) {
    return true
  }

  // Objects like { "length": 0 } are not empty in lodash
  if (isArrayLike(value)) {
    if (
      typeof (value as { splice?: unknown }).splice !== 'function' &&
      typeof value !== 'string' &&
      (typeof Buffer === 'undefined' || !Buffer.isBuffer(value)) &&
      !isTypedArray(value) &&
      !isArguments(value)
    ) {
      return false
    }

    return value.length === 0
  }

  if (typeof value === 'object') {
    if (value instanceof Map || value instanceof Set) {
      return value.size === 0
    }

    const keys = Object.keys(value)

    if (isPrototype(value)) {
      return keys.filter((x) => x !== 'constructor').length === 0
    }

    return keys.length === 0
  }

  return true
}

/**
 * Checks if a value is an array
 */
export function isArray(value?: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * Checks if a value is a number (including String objects)
 */
export function isNumber(value?: unknown): value is number {
  return typeof value === 'number' || value instanceof Number
}

/**
 * Checks if a value is an empty string (including whitespace-only strings)
 */
export const isEmptyString = (value: unknown): boolean => isString(value) && isEmpty(trim(value))

/**
 * Checks if an object is empty (has no truthy properties)
 */
export const isEmptyObject = (value: unknown): boolean => isPlainObject(value) && isEmpty(pickBy(value, identity))

/**
 * Checks if an array contains only empty values (shallow check)
 */
export const isEmptyArr = (value: unknown): boolean => isArray(value) && isEmpty(compact(value))

/**
 * Filters out empty strings, objects, and arrays from an array
 */
export const rejectEmpty = (arr: unknown[]): unknown[] =>
  arr.filter((item: unknown) => !isEmptyString(item) && !isEmptyObject(item) && !isEmptyArr(item))

/**
 * Checks if an array is effectively empty (includes one level of recursion)
 * Note: Only does one level of recursion
 */
export const isEmptyArray = (value: unknown): boolean => isArray(value) && isEmpty(compact(rejectEmpty(value)))

/**
 * Checks if a value is object-like (includes both plain objects and class instances)
 * This is more inclusive than isPlainObject and will catch class instances
 * but excludes special JavaScript objects like Date, RegExp, Map, Set, etc.
 */
export function isObjectLike(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || isArray(value) || isArguments(value)) {
    return false
  }

  // Exclude special JavaScript objects that should not be treated as generic objects
  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof Error ||
    value instanceof Promise
  ) {
    return false
  }

  // Exclude plain objects (let isPlainObject handle those)
  return !isPlainObject(value)
}
