# es-toolkit-clean

A lightweight, TypeScript-first library for cleaning JavaScript objects by removing undefined values, empty strings, empty arrays, functions, and other unwanted properties. Built on [es-toolkit](https://github.com/toss/es-toolkit) for superior performance.

## Why es-toolkit-clean?

Sometimes API responses contain properties filled with empty strings, undefined values, or functions that you want to remove. This library provides a configurable way to clean your data structures, similar to a more powerful version of `_.compact` for objects.

## Features

- 🧹 **Smart cleaning** - Removes empty strings, undefined values, empty arrays, and functions by default
- 🔧 **Fully configurable** - Customize how each data type should be processed
- 📦 **Lightweight** - Small bundle size (ESM: ~3.2KB, CJS: ~6.4KB) with tree-shaking support
- 📱 **Universal** - Works in Node.js, browsers, and edge environments  
- 🚀 **TypeScript-first** - Full TypeScript support with comprehensive type definitions
- ⚡ **High performance** - Built on es-toolkit for optimal speed
- 🎯 **Dual format** - Supports both ESM and CommonJS

## Installation

```bash
npm install es-toolkit-clean
```

```bash
pnpm add es-toolkit-clean
```

```bash
yarn add es-toolkit-clean
```

## Quick Start

```javascript
import clean from 'es-toolkit-clean'

const messy = {
  name: 'John',
  email: '',           // Empty string - will be removed
  age: 0,             // Zero - will be kept
  active: true,       // Boolean - will be kept  
  score: null,        // Null - will be kept
  undefined: undefined, // Undefined - will be removed
  fn: () => {},       // Function - will be removed
  tags: ['', 'valid', ' '], // Mixed array - empty strings removed
  nested: {
    value: 'keep',
    empty: '',
    spaces: '   '
  }
}

const cleaned = clean(messy)
console.log(cleaned)
// Output:
// {
//   name: 'John',
//   age: 0,
//   active: true,
//   score: null,
//   tags: ['valid'],
//   nested: { value: 'keep' }
// }
```

## Core API

### `clean(obj)` - Default Export

The main function for cleaning any data structure with default settings.

```javascript
import clean from 'es-toolkit-clean'

// Clean an object
const result = clean({ name: 'test', empty: '', valid: 42 })
// → { name: 'test', valid: 42 }

// Clean an array
const cleanArray = clean(['valid', '', ' ', 'another'])
// → ['valid', 'another']

// Clean a string
const cleanString = clean('  hello world  ')
// → 'hello world'
```

### `createCleaner(config)` - Custom Cleaning

Create a custom cleaner with specific configuration for different data types.

```javascript
import { createCleaner, defaultProcessors } from 'es-toolkit-clean'

// Remove null values (default behavior keeps them)
const strictCleaner = createCleaner({
  ...defaultProcessors,
  isNull: () => undefined  // Remove nulls instead of keeping them
})

const result = strictCleaner({ 
  name: 'test', 
  value: null, 
  empty: '' 
})
// → { name: 'test' }

// Keep functions (default behavior removes them)
const keepFunctions = createCleaner({
  ...defaultProcessors,
  isFunction: (fn) => fn  // Keep functions instead of removing them
})

const withFn = keepFunctions({ 
  name: 'test', 
  callback: () => 'hello',
  empty: ''
})
// → { name: 'test', callback: [Function] }
```

### `createProcessor(config)` - Custom Value Processing

Create a custom processor for handling individual values.

```javascript
import { createProcessor, defaultProcessors } from 'es-toolkit-clean'

// Custom string processing
const customProcessor = createProcessor({
  ...defaultProcessors,
  isString: (str) => {
    const trimmed = str.trim()
    return trimmed ? trimmed.toUpperCase() : undefined
  }
})

const processor = customProcessor
const result = processor('  hello world  ', processor)
// → 'HELLO WORLD'
```

### `processValue(value, processor)` - Process Single Values

Process individual values using the default or a custom processor.

```javascript
import { processValue, createProcessor } from 'es-toolkit-clean'

// Using default processor
const cleaned = processValue('  hello  ', processValue)
// → 'hello'

// Using custom processor
const upperProcessor = createProcessor({
  isString: (str) => str.trim().toUpperCase() || undefined
})
const result = processValue('  hello  ', upperProcessor)
// → 'HELLO'
```

## Configuration Options

The `defaultProcessors` object defines how each data type is handled:

```javascript
import { defaultProcessors } from 'es-toolkit-clean'

// Default configuration:
const config = {
  isArray: cleanArray,        // Recursively clean arrays, remove if empty
  isBoolean: identity,        // Keep all boolean values  
  isDate: identity,          // Keep all date values
  isFunction: noop,          // Remove all functions
  isNull: identity,          // Keep all null values
  isNumber: identity,        // Keep all number values (including 0)
  isPlainObject: cleanObject, // Recursively clean objects, remove if empty  
  isString: cleanString,     // Trim whitespace, remove if empty
  isUndefined: noop,         // Remove all undefined values
}
```

### Customization Examples

```javascript
import { createCleaner, defaultProcessors } from 'es-toolkit-clean'

// Remove all falsy values except 0
const removeFalsy = createCleaner({
  ...defaultProcessors,
  isNull: () => undefined,
  isBoolean: (val) => val || undefined,
  isString: (str) => str.trim() || undefined
})

// Custom number processing
const positiveNumbers = createCleaner({
  ...defaultProcessors,
  isNumber: (num) => num > 0 ? num : undefined
})

// Custom array processing  
const nonEmptyArrays = createCleaner({
  ...defaultProcessors,
  isArray: (arr, clean) => {
    const cleaned = arr.map(item => clean(item, clean))
      .filter(item => item !== undefined)
    return cleaned.length >= 2 ? cleaned : undefined // Require at least 2 items
  }
})
```

## Advanced Examples

### Complex Object Cleaning

```javascript
import clean from 'es-toolkit-clean'

const apiResponse = {
  user: {
    id: 123,
    name: 'John Doe',
    email: '',
    phone: '   ',
    profile: {
      bio: '',
      avatar: 'https://example.com/avatar.jpg',
      settings: {
        theme: '',
        notifications: true,
        metadata: {}
      }
    }
  },
  posts: [
    { title: 'Hello', content: '', tags: ['', 'intro'] },
    { title: '', content: '', tags: [] },
    { title: 'World', content: 'Content here', tags: ['update', ''] }
  ],
  emptyArray: [],
  nullValue: null,
  undefinedValue: undefined
}

const cleaned = clean(apiResponse)
console.log(cleaned)
// Output:
// {
//   user: {
//     id: 123,
//     name: 'John Doe',
//     profile: {
//       avatar: 'https://example.com/avatar.jpg',
//       settings: {
//         notifications: true
//       }
//     }
//   },
//   posts: [
//     { title: 'Hello', tags: ['intro'] },
//     { title: 'World', content: 'Content here', tags: ['update'] }
//   ],
//   nullValue: null
// }
```

### Working with Different Data Types

```javascript
import clean from 'es-toolkit-clean'

// Array cleaning
const messyArray = ['valid', '', '  ', null, undefined, 0, false, 'another']
const cleanedArray = clean(messyArray)
// → ['valid', null, 0, false, 'another']

// String cleaning  
const messyString = '   hello world   '
const cleanedString = clean(messyString)
// → 'hello world'

// Nested structures
const nested = {
  level1: {
    level2: {
      level3: {
        value: '',
        keep: 'this'
      },
      empty: ''
    },
    alsoEmpty: []
  }
}
const cleanedNested = clean(nested)
// → { level1: { level2: { level3: { keep: 'this' } } } }
```

## Helper Functions

The library also exports individual helper functions for specific use cases:

```javascript
import { cleanArray, cleanObject, cleanString } from 'es-toolkit-clean'

// Clean individual strings
const cleaned = cleanString('  hello  ') // → 'hello'
const empty = cleanString('   ') // → undefined

// Clean arrays with custom processor
import { createProcessor } from 'es-toolkit-clean'
const processor = createProcessor()
const cleanedArray = cleanArray(['test', '', 'valid'], processor)
// → ['test', 'valid']

// Clean objects with custom processor  
const cleanedObject = cleanObject({ 
  name: 'test', 
  empty: '', 
  value: 42 
}, processor)
// → { name: 'test', value: 42 }
```

## TypeScript Support

The library is written in TypeScript and provides comprehensive type definitions:

```typescript
import clean, { 
  createCleaner, 
  createProcessor, 
  defaultProcessors,
  type ProcessorConfig,
  type CleanerFunction 
} from 'es-toolkit-clean'

// Custom processor with full type safety
const customCleaner: CleanerFunction = createCleaner({
  ...defaultProcessors,
  isString: (str: string): string | undefined => {
    return str.length > 5 ? str.toLowerCase() : undefined
  }
})

interface User {
  name: string
  email?: string
  age: number
}

const user: User = { name: 'John', email: '', age: 25 }
const cleaned = clean(user) // Fully typed
```

## Performance

Built on es-toolkit, this library offers excellent performance characteristics:

- **Tree-shakable**: Only include the functions you use
- **Zero dependencies**: Apart from es-toolkit core functions
- **Optimized algorithms**: Efficient recursive processing
- **Memory efficient**: Creates new objects without mutating originals

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## API Reference

### Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `clean(obj)` | Clean any data structure with default settings | `obj: unknown` | `unknown` |
| `createCleaner(config)` | Create custom cleaner function | `config: Partial<ProcessorConfig>` | `(obj: unknown) => unknown` |
| `createProcessor(config)` | Create custom value processor | `config: Partial<ProcessorConfig>` | `CleanerFunction` |
| `processValue(value, processor)` | Process single value | `value: unknown, processor: CleanerFunction` | `unknown` |

### Configuration

| Property | Type | Default Behavior | Customizable |
|----------|------|------------------|--------------|
| `isArray` | `(arr: unknown[], clean: CleanerFunction) => unknown` | Recursively clean, remove if empty | ✅ |
| `isBoolean` | `(val: boolean) => unknown` | Keep all booleans | ✅ |
| `isDate` | `(date: Date) => unknown` | Keep all dates | ✅ |
| `isFunction` | `(fn: Function) => unknown` | Remove all functions | ✅ |
| `isNull` | `(val: null) => unknown` | Keep all nulls | ✅ |
| `isNumber` | `(num: number) => unknown` | Keep all numbers | ✅ |
| `isPlainObject` | `(obj: Record<string, unknown>, clean: CleanerFunction) => unknown` | Recursively clean, remove if empty | ✅ |
| `isString` | `(str: string) => unknown` | Trim, remove if empty | ✅ |
| `isUndefined` | `(val: undefined) => unknown` | Remove all undefined | ✅ |

## License

MIT © [Serhii Siryk](https://github.com/sqrter)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.
