import { build } from 'esbuild'
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs'
import { globSync } from 'glob'
import { execSync } from 'child_process'

// Get all TypeScript files from src directory
const entryPoints = globSync('src/**/*.ts', { ignore: ['src/**/*.test.ts', 'src/**/*.spec.ts'] })

// Shared build configuration
const sharedConfig = {
  entryPoints,
  bundle: false, // Don't bundle, preserve module structure (like preserveModules: true)
  sourcemap: true,
  minify: true,
  target: 'es2015',
  platform: 'neutral',
  // Note: external is not used with bundle: false, ESBuild automatically handles this
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx'
  },
  tsconfig: './tsconfig.build.json'
}

// Copy files function
function copyFiles() {
  // Ensure dist directory exists
  mkdirSync('dist', { recursive: true })
  
  // Copy LICENSE
  copyFileSync('LICENSE', 'dist/LICENSE')
  
  // Copy README
  copyFileSync('readme.md', 'dist/readme.md')
  
  // Transform and copy package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
  const {
    main,
    module,
    types,
    exports,
    files,
    scripts,
    devDependencies,
    'size-limit': sizeLimit,
    ...pkg
  } = packageJson

  const transformedPackageJson = {
    ...pkg,
    main: main.replace('dist/', ''),
    module: module.replace('dist/', ''),
    types: types.replace('dist/', ''),
    exports: {
      types: exports.types.replace('dist/', ''),
      require: exports.require.replace('dist/', ''),
      import: exports.import.replace('dist/', ''),
      default: exports.default.replace('dist/', ''),
    },
  }

  writeFileSync('dist/package.json', JSON.stringify(transformedPackageJson, null, 2))
}

// Build ESM version
async function buildESM() {
  console.log('Building ESM...')
  const result = await build({
    ...sharedConfig,
    format: 'esm',
    outdir: 'dist/esm',
    outExtension: { '.js': '.js' },
    metafile: true
  })
  
  // Write metafile to disk
  writeFileSync('meta-esm.json', JSON.stringify(result.metafile, null, 2))
  
  // Generate TypeScript declarations for ESM
  console.log('Generating TypeScript declarations for ESM...')
  execSync('tsc --project tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist/esm', { stdio: 'inherit' })
}

// Build CJS version
async function buildCJS() {
  console.log('Building CJS...')
  const result = await build({
    ...sharedConfig,
    format: 'cjs',
    outdir: 'dist/cjs',
    outExtension: { '.js': '.js' },
    metafile: true
  })
  
  // Write metafile to disk
  writeFileSync('meta-cjs.json', JSON.stringify(result.metafile, null, 2))
  
  // Generate TypeScript declarations for CJS
  console.log('Generating TypeScript declarations for CJS...')
  execSync('tsc --project tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist/cjs', { stdio: 'inherit' })
}

// Calculate and display bundle sizes
function analyzeBundles() {
  console.log('\n📦 Bundle Analysis:')
  
  try {
    const esmFiles = globSync('dist/esm/**/*.js')
    const cjsFiles = globSync('dist/cjs/**/*.js')
    
    let esmSize = 0
    let cjsSize = 0
    
    esmFiles.forEach(file => {
      const stats = readFileSync(file)
      esmSize += stats.length
    })
    
    cjsFiles.forEach(file => {
      const stats = readFileSync(file)
      cjsSize += stats.length
    })
    
    console.log(`ESM total size: ${(esmSize / 1024).toFixed(2)} KB (${esmFiles.length} files)`)
    console.log(`CJS total size: ${(cjsSize / 1024).toFixed(2)} KB (${cjsFiles.length} files)`)
    console.log(`Total bundle size: ${((esmSize + cjsSize) / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.log('Could not analyze bundle sizes:', error.message)
  }
}

// Main build function
async function buildAll() {
  console.log('🚀 Starting esbuild...')
  
  try {
    // Build both formats in parallel
    await Promise.all([
      buildESM(),
      buildCJS()
    ])
    
    // Copy additional files
    console.log('Copying files...')
    copyFiles()
    
    // Analyze bundles
    analyzeBundles()
    
    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

// Add glob dependency check
try {
  await import('glob')
} catch (error) {
  console.error('❌ Missing glob dependency. Please install it with: pnpm add -D glob')
  process.exit(1)
}

// Run the build
buildAll()
