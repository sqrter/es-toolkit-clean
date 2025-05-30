import {
  compact,
  identity,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isFunction,
  isNull,
  isNumber,
  isPlainObject,
  isString,
  isUndefined,
  pickBy,
  trim,
} from 'es-toolkit/compat'

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
 * Type checking utilities re-exported for convenience
 */
export { isArray, isBoolean, isDate, isFunction, isNull, isNumber, isPlainObject, isString, isUndefined }
