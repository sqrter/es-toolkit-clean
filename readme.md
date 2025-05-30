# es-toolkit-clean

Remove object properties that are undefined, functions, empty arrays, or empty strings.
Sometimes an API response is filled with tons of properties that are empty strings and you just want them gone.
Think of this as a mild form of `_.compact` for objects. Returns a new object or `undefined`.

Built on [es-toolkit](https://github.com/toss/es-toolkit) for superior performance compared to lodash-based alternatives.

## Features

- 📦 **Lightweight** - Only ~17KB bundled (ESM: 16.3KB, CJS: 17.0KB)
- 📱 **Universal** - Works in Node.js, browsers, and edge environments
- 🔧 **Dual format** - Supports both ESM and CommonJS
- 📋 **TypeScript** - Full TypeScript support with type definitions
- ⚡ **Fast** - Built on es-toolkit for superior performance

## Install

```bash
$ npm i --save es-toolkit-clean
```

## Usage

### Basic Cleaning

```javascript
import clean from 'es-toolkit-clean'

const before = {
  one: ' ',
  two: [ '', '', '', [ '' ] ],
  three: ' four ',
  descriptions: [ 'SAMPLE SET', '', '', { foo: '', bar: null } ],
  badNews: [ null, '', '', 'SAMPLE' ],
  five: [ 'f ', ' ', ' do' ],
  six: { thing: 'one', zap: null, un: undefined },
  func: foo => foo,
  width: '',
  height: 0,
  finish: false,
  start: true,
  'nathan.drake@example.com': 'Issue #1',
}
const after = clean(before)
// {
//   three: 'four',
//   descriptions: [ 'SAMPLE SET', { bar: null } ],
//   badNews: [ null, 'SAMPLE' ],
//   five: [ 'f', 'do' ],
//   six: { thing: 'one', zap: null },
//   height: 0,
//   finish: false,
//   start: true,
//   'nathan.drake@example.com': 'Issue #1',
// }
```

### Custom Cleaning

You can customize the processing with the new, cleaner API:

```javascript
import { createCleaner, defaultProcessors } from 'es-toolkit-clean'

// Using the default configuration
const clean = createCleaner(defaultProcessors)

// Custom configuration - remove null values
const strictCleaner = createCleaner({
  ...defaultProcessors,
  isNull: () => undefined,  // Remove nulls instead of keeping them
})

const result = strictCleaner({ foo: null, bar: 'test' })
// Result: { bar: 'test' }
```

### Advanced Configuration

```javascript
import { createCleaner, defaultProcessors } from 'es-toolkit-clean'

// Create a custom cleaner that's more aggressive
const aggressiveCleaner = createCleaner({
  ...defaultProcessors,
  isNull: () => undefined,      // Remove nulls
  isFunction: () => undefined,  // Remove functions
  isBoolean: (val) => val === true ? val : undefined,  // Only keep true booleans
})
```

### Processing Individual Values

```javascript
import { processValue, createProcessor } from 'es-toolkit-clean'

// Process a single value with default settings
const cleaned = processValue(' hello world ', processValue)
// Result: 'hello world'

// Create a custom processor
const customProcessor = createProcessor({
  isString: (str) => str.toUpperCase().trim() || undefined
})

const result = customProcessor('  hello  ', customProcessor)
// Result: 'HELLO'
```

## API Reference

### Main Functions

- **`clean(obj)`** - Default cleaner function
- **`createCleaner(config)`** - Create a custom cleaner with specific configuration
- **`createProcessor(config)`** - Create a custom value processor
- **`processValue(value, processor)`** - Process a single value
- **`defaultProcessors`** - Default configuration object

### Default Configuration

The `defaultProcessors` object contains the default behavior for each data type:

```javascript
import { defaultProcessors } from 'es-toolkit-clean'

// Default configuration:
// {
//   isArray: cleanArray,
//   isBoolean: identity,
//   isDate: identity,
//   isFunction: noop,        // Removes functions
//   isNull: identity,        // Keeps nulls
//   isNumber: identity,
//   isPlainObject: cleanObject,
//   isString: cleanString,   // Trims and removes empty strings
//   isUndefined: noop,       // Removes undefined values
// }
```

### Customization

Object property values are cleaned based on their type. Each type handler receives the value and should return:

- **The cleaned value** - to keep it (possibly modified)
- **`undefined`** - to remove the property entirely

#### Examples:

```javascript
// Remove all null values
{ isNull: () => undefined }

// Keep function properties  
{ isFunction: (fn) => fn }

// Custom string processing
{ isString: (str) => str.trim().toLowerCase() || undefined }

// Custom number processing  
{ isNumber: (num) => num > 0 ? num : undefined }
```

## Benefits

- 🧹 **Clean, intuitive API**
- 🎯 **Flexible configuration** - Easy to customize behavior
- 🚀 **TypeScript friendly** - Better type safety and IntelliSense
- ⚡ **Performant** - Built on es-toolkit for superior performance
- 🔧 **Modern** - Uses es-toolkit instead of lodash for better tree-shaking and speed
