import { identity, noop } from 'es-toolkit/function'

import { cleanArray, cleanObject, cleanString } from '../utils/helpers'

/**
 * Default processors for each data type
 * These define how each type should be cleaned by default
 */
export const defaultProcessors = {
  isArray: cleanArray,
  isBoolean: identity,
  isDate: identity,
  isFunction: noop as (_?: unknown) => boolean | void,
  isNull: identity,
  isNumber: identity,
  isPlainObject: cleanObject,
  isString: cleanString,
  isUndefined: noop as (_?: unknown) => boolean | void,
}

export type ProcessorConfig = typeof defaultProcessors
