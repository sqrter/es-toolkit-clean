import { isBoolean, isDate, isFunction, isNull, isPlainObject, isString, isUndefined } from 'es-toolkit/predicate'

import { type CleanerFunction } from '../types/common'
import { isArray, isNumber, isObjectLike } from '../types/validators'
import { defaultProcessors, type ProcessorConfig } from './processors'

/**
 * Creates a value processor function with custom configuration
 * This replaces the old "buildGetValue" function with a clearer name
 */
export function createProcessor(processorConfig: Partial<ProcessorConfig> = {}): CleanerFunction {
  const processors = { ...defaultProcessors, ...processorConfig }

  return function processValue(node: unknown, clean: CleanerFunction): unknown {
    if (isArray(node)) return processors.isArray(node, clean)
    if (isObjectLike(node)) return processors.isObjectLike(node, clean)
    if (isPlainObject(node)) return processors.isPlainObject(node as Record<string, unknown>, clean)
    if (isUndefined(node)) return processors.isUndefined(node)
    if (isFunction(node)) return processors.isFunction(node)
    if (isBoolean(node)) return processors.isBoolean(node)
    if (isNull(node)) return processors.isNull(node)
    if (isNumber(node)) return processors.isNumber(node)
    if (isString(node)) return processors.isString(node)
    if (isDate(node)) return processors.isDate(node)
    return node
  }
}

/**
 * Default value processor using standard configuration
 * This replaces the old "getValue" export
 */
export const processValue = createProcessor()

/**
 * Creates a cleaner function that can be customized
 * This replaces the old "buildCleaner" function
 */
export function createCleaner(
  processorConfig: Partial<ProcessorConfig> | ((defaultProcessors: ProcessorConfig) => CleanerFunction),
): (node: unknown) => unknown {
  const processor: CleanerFunction = isFunction(processorConfig)
    ? processorConfig(defaultProcessors)
    : createProcessor(processorConfig)

  return (node: unknown) => processor(node, processor)
}

/**
 * Default cleaner function for cleaning any data structure
 * This replaces the old "cleaner" export
 */
export const cleaner = (obj: unknown) => processValue(obj, processValue)
