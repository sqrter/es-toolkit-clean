import { isEmpty, isUndefined, set, trim } from 'es-toolkit/compat'

import { type CleanableArray, type CleanableObject, type CleanerFunction } from '../types/common'

// Custom transform function to replace lodash/fp reduce.convert({ cap: false })
const transform = (
  iteratee: (acc: unknown, value: unknown, key: string | number) => unknown,
  accumulator: unknown,
  collection: CleanableObject | CleanableArray,
) => {
  // Handle objects
  if (typeof collection === 'object' && !Array.isArray(collection)) {
    let result = accumulator
    for (const [key, value] of Object.entries(collection)) {
      result = iteratee(result, value, key)
    }
    return result
  }

  // Handle arrays
  if (Array.isArray(collection)) {
    let result = accumulator
    for (let i = 0; i < collection.length; i++) {
      result = iteratee(result, collection[i], i)
    }
    return result
  }

  return accumulator
}

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
export const reducer = (clean: CleanerFunction) => (result: unknown, value: unknown, key: string | number) => {
  const cleanValue = clean(value, clean)
  return isUndefined(cleanValue) ? result : set(result || {}, [key], cleanValue)
}

/**
 * Clean an object by removing empty/undefined properties
 */
export function cleanObject(obj: CleanableObject, clean: CleanerFunction): unknown {
  return transform(reducer(clean), undefined, obj)
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
