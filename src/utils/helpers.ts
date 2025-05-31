import { isEmpty, isUndefined, set, transform, trim } from 'es-toolkit/compat'

import { type CleanableArray, type CleanableObject, type CleanerFunction } from '../types/common'

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
  if (isUndefined(cleanValue)) return result

  // Ensure we have a proper object to work with
  const accumulator = result && typeof result === 'object' && !Array.isArray(result) ? result : {}
  return set(accumulator, [key], cleanValue)
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
