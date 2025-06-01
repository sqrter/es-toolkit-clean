import { trim } from 'es-toolkit'
import { isUndefined } from 'es-toolkit/predicate'

import { type CleanableArray, type CleanableObject, type CleanerFunction } from '../types/common'
import { isEmpty } from '../types/validators'

/**
 * Remove empty values using a transformer function
 */
export const rmEmpty = (transformer: (item: unknown) => unknown) => (item: unknown) => {
  const res = transformer(item)
  return isEmpty(res) ? undefined : res
}

/**
 * Remove values that return true from transformer
 */
export const rmTrue = (transformer: (item: unknown) => boolean) => (item: unknown) => {
  return transformer(item) ? undefined : item
}

/**
 * Build up a new clean object by reducing over properties
 */
const reducer =
  (clean: CleanerFunction) =>
  (accumulator: Record<string, unknown>, value: unknown, key: string): Record<string, unknown> => {
    const cleanValue = clean(value, clean)
    if (isUndefined(cleanValue)) return accumulator

    // Simple property assignment since we're only using simple key paths
    accumulator[key] = cleanValue
    return accumulator
  }

/**
 * Simplified transform function specifically for our cleanObject use case.
 * Only handles objects and reduces them using the provided iteratee.
 */
function transform(
  object: CleanableObject,
  iteratee: (accumulator: Record<string, unknown>, value: unknown, key: string) => Record<string, unknown>,
  initialAccumulator: Record<string, unknown>,
): Record<string, unknown> {
  let accumulator = initialAccumulator

  for (const [key, value] of Object.entries(object)) {
    accumulator = iteratee(accumulator, value, key)
  }

  return accumulator
}

/**
 * Clean an object by removing empty/undefined properties
 */
export function cleanObject(obj: CleanableObject, clean: CleanerFunction): unknown {
  const result = transform(obj, reducer(clean), {})
  return isEmpty(result) ? undefined : result
}

/**
 * Clean a string by trimming whitespace and removing if empty
 */
export const cleanString = rmEmpty((item: unknown) => (typeof item === 'string' ? trim(item) : item))

/**
 * Clean an array by processing each item and filtering out undefined values
 */
export function cleanArray(items: CleanableArray, clean: CleanerFunction): unknown {
  const cleanedItems = items.map((x: unknown) => clean(x, clean))
  const filteredItems = cleanedItems.filter((x: unknown) => !isUndefined(x))
  return isEmpty(filteredItems) ? undefined : filteredItems
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @param {T} value The value to query.
 * @returns {string} Returns the `Object.prototype.toString.call` result.
 */
export function getTag<T>(value: T) {
  if (value == null) {
    // eslint-disable-next-line sonarjs/different-types-comparison
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return Object.prototype.toString.call(value)
}
