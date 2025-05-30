import { cleaner, createCleaner, createProcessor, processValue } from './core/cleaner'
import { defaultProcessors } from './core/processors'

// Re-export core functionality
export * from './types/transformers'
export * from './types/validators'

// Main API exports
export {
  // Core functionality
  createProcessor,
  createCleaner,
  processValue,
  cleaner,

  // Configuration
  defaultProcessors,
}

// Default export
export default cleaner
