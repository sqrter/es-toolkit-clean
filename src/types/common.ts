/**
 * Common type definitions for the cleaner library
 */

/**
 * A cleaner function that processes a value and returns a cleaned version or undefined
 */
export type CleanerFunction = (value: unknown, clean: CleanerFunction) => unknown

/**
 * A transformer function that processes a value
 */
export type TransformerFunction<T = unknown, R = unknown> = (value: T) => R

/**
 * A boolean check function
 */
export type BooleanCheckFunction = (value: unknown) => boolean

/**
 * Recursive object type for cleaning
 */
export type CleanableObject = Record<string, unknown>

/**
 * Array type for cleaning
 */
export type CleanableArray = unknown[]
