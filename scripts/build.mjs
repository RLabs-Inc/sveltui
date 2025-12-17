#!/usr/bin/env bun
/**
 * SvelTUI Build System
 *
 * Professional, generic build system for both framework and applications
 * Keeps all auto-build.mjs functionality but 10x+ faster
 */

import * as svelte from 'svelte/compiler'
import { Glob } from 'bun'
import { mkdir, rm } from 'fs/promises'
import { existsSync } from 'fs'
import { join, resolve, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Use current working directory as project root, not the script location
const PROJECT_ROOT = process.cwd()

// Professional color system
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',

  // Regular colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',

  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
}

// Professional logger
class Logger {
  constructor(verbose = false) {
    this.verbose = verbose
    this.startTime = performance.now()
  }

  header(message) {
    console.log(
      `\n${colors.brightCyan}${colors.bright}━━━ ${message} ━━━${colors.reset}`
    )
  }

  info(message) {
    console.log(`${colors.cyan}ℹ${colors.reset} ${message}`)
  }

  success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`)
  }

  warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
  }

  error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`)
  }

  debug(message) {
    if (this.verbose) {
      console.log(`${colors.gray}→ ${message}${colors.reset}`)
    }
  }

  progress(current, total, message) {
    const percent = Math.round((current / total) * 100)
    const bar = '█'.repeat(Math.floor(percent / 5)).padEnd(20, '░')
    process.stdout.write(
      `\r${colors.cyan}[${bar}]${colors.reset} ${percent}% ${message}`
    )
    if (current === total) console.log()
  }

  timing() {
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(2)
    return `${colors.bright}${elapsed}s${colors.reset}`
  }
}

class Builder {
  constructor(options = {}) {
    this.options = {
      outdir: options.outdir || 'dist',
      verbose: options.verbose || false,
      excludeDirs: options.excludeDirs || [
        'node_modules',
        '.git',
        'dist',
        'docs',
        'bkp',
        'packages',
        'benchmarks',
        'promotion',
      ],
      dev: options.dev !== false,
      ...options,
    }

    this.logger = new Logger(this.options.verbose)
    this.stats = {
      files: 0,
      size: 0,
      errors: [],
    }
  }

  async build() {
    this.logger.header('SvelTUI Build System')

    // Phase 1: Clean
    await this.clean()

    // Phase 2: Discovery
    const files = await this.discover()

    // Phase 3: Parallel compilation
    await this.compile(files)

    // Phase 4: Fix imports
    await this.fixImports()

    // Phase 5: Report
    this.report()
  }

  async clean() {
    this.logger.info('Cleaning output directory...')

    if (existsSync(this.options.outdir)) {
      await rm(this.options.outdir, { recursive: true, force: true })
    }
    await mkdir(this.options.outdir, { recursive: true })

    this.logger.success('Output directory ready')
  }

  async discover() {
    this.logger.info('Discovering source files...')

    const patterns = [
      '**/*.svelte',
      '**/*.svelte.ts',
      '**/*.ts',
      '**/*.js',
      '**/*.mjs',
    ]

    const allFiles = new Map()

    // Scan all directories in parallel
    const scanTasks = []

    // Scan from project root
    for (const pattern of patterns) {
      scanTasks.push(this.scanPattern(pattern, PROJECT_ROOT, allFiles))
    }

    await Promise.all(scanTasks)

    // Categorize files
    const categorized = {
      svelte: [],
      svelteTS: [],
      typescript: [],
      javascript: [],
    }

    for (const [path, type] of allFiles) {
      if (path.endsWith('.svelte')) {
        categorized.svelte.push(path)
      } else if (path.endsWith('.svelte.ts')) {
        categorized.svelteTS.push(path)
      } else if (path.endsWith('.ts')) {
        categorized.typescript.push(path)
      } else if (path.endsWith('.js') || path.endsWith('.mjs')) {
        categorized.javascript.push(path)
      }
    }

    const total = allFiles.size
    this.logger.success(`Found ${total} files:`)
    this.logger.debug(
      `  ${colors.magenta}${categorized.svelte.length}${colors.reset} Svelte components`
    )
    this.logger.debug(
      `  ${colors.blue}${categorized.svelteTS.length}${colors.reset} Svelte TS modules`
    )
    this.logger.debug(
      `  ${colors.cyan}${categorized.typescript.length}${colors.reset} TypeScript files`
    )
    this.logger.debug(
      `  ${colors.yellow}${categorized.javascript.length}${colors.reset} JavaScript files`
    )

    return categorized
  }

  async scanPattern(pattern, root, fileMap) {
    const glob = new Glob(pattern)

    for await (const file of glob.scan({
      cwd: root,
      absolute: false,
      onlyFiles: true,
    })) {
      // Skip excluded directories
      if (this.options.excludeDirs.some((dir) => file.includes(`${dir}/`))) {
        continue
      }

      const fullPath = join(root, file)
      fileMap.set(fullPath, pattern)
    }
  }

  async compile(files) {
    this.logger.info('Compiling files...')

    const total =
      files.svelte.length +
      files.svelteTS.length +
      files.typescript.length +
      files.javascript.length

    let processed = 0

    // Process different file types in parallel batches
    const BATCH_SIZE = 20

    // Helper to process batch
    const processBatch = async (batch, processor) => {
      const promises = batch.map(async (file) => {
        try {
          await processor(file)
          processed++
          this.logger.progress(processed, total, `Compiling...`)
        } catch (error) {
          this.stats.errors.push({
            file,
            error: error.message,
            stack: error.stack,
            type: error.constructor.name,
            code: error.code,
          })
        }
      })
      await Promise.all(promises)
    }

    // Process Svelte components
    for (let i = 0; i < files.svelte.length; i += BATCH_SIZE) {
      const batch = files.svelte.slice(i, i + BATCH_SIZE)
      await processBatch(batch, (file) => this.compileSvelte(file))
    }

    // Process Svelte TS modules
    for (let i = 0; i < files.svelteTS.length; i += BATCH_SIZE) {
      const batch = files.svelteTS.slice(i, i + BATCH_SIZE)
      await processBatch(batch, (file) => this.compileSvelteTS(file))
    }

    // Process TypeScript files
    for (let i = 0; i < files.typescript.length; i += BATCH_SIZE) {
      const batch = files.typescript.slice(i, i + BATCH_SIZE)
      await processBatch(batch, (file) => this.compileTypeScript(file))
    }

    // Copy JavaScript files
    for (let i = 0; i < files.javascript.length; i += BATCH_SIZE) {
      const batch = files.javascript.slice(i, i + BATCH_SIZE)
      await processBatch(batch, (file) => this.copyJavaScript(file))
    }

    this.logger.success(`Compiled ${processed} files`)
  }

  async compileSvelte(filepath) {
    // Read using Bun's fast API
    const source = await Bun.file(filepath).text()

    // Compile with Svelte compiler
    const compiled = svelte.compile(source, {
      filename: filepath,
      dev: this.options.dev,
      generate: 'client',
      css: 'injected',
      runes: true,
      compatibility: {
        componentApi: 5,
      },
    })

    // Calculate output path
    const relativePath = relative(PROJECT_ROOT, filepath)
    const outputPath = join(this.options.outdir, relativePath + '.mjs')

    // Ensure directory exists
    await mkdir(dirname(outputPath), { recursive: true })

    // Write using Bun's fast API
    const bytes = await Bun.write(outputPath, compiled.js.code)

    this.stats.files++
    this.stats.size += bytes

    // Write CSS if separate
    if (compiled.css && compiled.css.code && this.options.css === 'external') {
      const cssPath = outputPath.replace(/\.mjs$/, '.css')
      await Bun.write(cssPath, compiled.css.code)
    }
  }

  async compileSvelteTS(filepath) {
    // Read using Bun's fast API
    const source = await Bun.file(filepath).text()

    // Use Bun's transpiler to strip TypeScript
    const transpiler = new Bun.Transpiler({
      loader: 'ts',
      target: 'browser',
      tsconfig: {
        compilerOptions: {
          target: 'esnext',
          module: 'esnext',
          preserveValueImports: true,
        },
      },
    })

    const jsCode = transpiler.transformSync(source)

    // Compile with Svelte's module compiler
    const compiled = svelte.compileModule(jsCode, {
      filename: filepath,
      dev: this.options.dev,
      generate: 'client',
    })

    // Calculate output path
    const relativePath = relative(PROJECT_ROOT, filepath)
    const outputPath = join(
      this.options.outdir,
      relativePath.replace('.svelte.ts', '.svelte.js')
    )

    // Ensure directory exists
    await mkdir(dirname(outputPath), { recursive: true })

    // Write using Bun's fast API
    const bytes = await Bun.write(outputPath, compiled.js.code)

    this.stats.files++
    this.stats.size += bytes
  }

  async compileTypeScript(filepath) {
    // For TypeScript files, use Bun.build for optimal performance
    const result = await Bun.build({
      entrypoints: [filepath],
      outdir: this.options.outdir,
      target: 'bun',
      format: 'esm',
      splitting: false,
      sourcemap: this.options.sourcemap ? 'external' : 'none',
      minify: false,
      naming: {
        entry: '[dir]/[name].mjs',
      },
      external: ['*'],
      root: PROJECT_ROOT,
    })

    if (result.success) {
      this.stats.files++
      // Get size from output
      if (result.outputs.length > 0) {
        const output = result.outputs[0]
        this.stats.size += output.size || 0
      }
    } else {
      throw new Error(result.logs.join('\n'))
    }
  }

  async copyJavaScript(filepath) {
    // For JS files, just copy them
    const source = await Bun.file(filepath).arrayBuffer()

    const relativePath = relative(PROJECT_ROOT, filepath)
    const outputPath = join(this.options.outdir, relativePath)

    await mkdir(dirname(outputPath), { recursive: true })
    const bytes = await Bun.write(outputPath, source)

    this.stats.files++
    this.stats.size += bytes
  }

  async fixImports() {
    this.logger.info('Fixing import paths...')

    // Find all output files
    const glob = new Glob('**/*.{mjs,js}')
    const files = []

    for await (const file of glob.scan({
      cwd: this.options.outdir,
      absolute: false,
    })) {
      files.push(join(this.options.outdir, file))
    }

    // Process files in parallel
    const BATCH_SIZE = 50
    let processed = 0

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (file) => {
          const content = await Bun.file(file).text()

          // Fix various import patterns
          const fixed = content
            // .svelte imports → .svelte.mjs
            .replace(/from\s+['"]([^'"]+)\.svelte['"]/g, "from '$1.svelte.mjs'")
            // .svelte.ts imports → .svelte.js
            .replace(
              /from\s+['"]([^'"]+)\.svelte\.ts['"]/g,
              "from '$1.svelte.js'"
            )
            // .ts imports → .mjs
            .replace(/from\s+['"](\.[^'"]+)\.ts['"]/g, "from '$1.mjs'")
            // Check for .js → .mjs if file exists
            .replace(/from\s+['"](\.[^'"]+)\.js['"]/g, (match, importPath) => {
              const resolvedPath = resolve(dirname(file), importPath + '.mjs')
              if (existsSync(resolvedPath)) {
                return `from '${importPath}.mjs'`
              }
              return match
            })

          if (fixed !== content) {
            await Bun.write(file, fixed)
          }

          processed++
        })
      )
    }

    this.logger.success(`Fixed imports in ${processed} files`)
  }

  report() {
    this.logger.header('Build Complete')

    // Show success stats first
    if (this.stats.errors.length === 0) {
      console.log(
        `\n  ${colors.green}${colors.bright}✨ Perfect build!${colors.reset}`
      )
    }

    const stats = [
      `${colors.bright}Time:${colors.reset} ${this.logger.timing()}`,
      `${colors.bright}Files:${colors.reset} ${colors.green}${this.stats.files}${colors.reset} compiled`,
      `${colors.bright}Size:${colors.reset} ${this.formatBytes(
        this.stats.size
      )}`,
      `${colors.bright}Output:${colors.reset} ${colors.cyan}${this.options.outdir}${colors.reset}`,
    ]

    stats.forEach((stat) => console.log(`  ${stat}`))

    // Beautiful error reporting
    if (this.stats.errors.length > 0) {
      console.log()
      console.log(
        `${colors.red}${colors.bright}━━━ Build Errors (${this.stats.errors.length}) ━━━${colors.reset}`
      )

      this.stats.errors.forEach(({ file, error, stack, type }, index) => {
        const shortPath = relative(PROJECT_ROOT, file)

        // Error header with file path
        console.log()
        console.log(
          `${colors.red}${colors.bright}✗ Error ${index + 1}/${
            this.stats.errors.length
          }${colors.reset}`
        )
        console.log(
          `  ${colors.cyan}File:${colors.reset} ${colors.bright}${shortPath}${colors.reset}`
        )
        console.log(
          `  ${colors.yellow}Type:${colors.reset} ${type || 'CompileError'}`
        )

        // Error message
        console.log(`  ${colors.red}Message:${colors.reset}`)

        // Parse and format error message
        const lines = error.split('\n')
        lines.forEach((line) => {
          if (line.includes('error:')) {
            // Highlight error lines
            console.log(`    ${colors.brightRed}${line}${colors.reset}`)
          } else if (line.match(/^\s*\d+\s*\|/)) {
            // Code context lines
            console.log(`    ${colors.gray}${line}${colors.reset}`)
          } else if (line.includes('^')) {
            // Error pointer line
            console.log(`    ${colors.brightYellow}${line}${colors.reset}`)
          } else {
            // Regular lines
            console.log(`    ${line}`)
          }
        })

        // Stack trace (only in verbose mode)
        if (this.options.verbose && stack) {
          console.log(`  ${colors.dim}Stack trace:${colors.reset}`)
          const stackLines = stack.split('\n').slice(1, 4) // Show first 3 stack frames
          stackLines.forEach((line) => {
            const cleaned = line.replace(/^\s*at\s*/, '')
            console.log(`    ${colors.gray}→ ${cleaned}${colors.reset}`)
          })
        }

        // Separator between errors
        if (index < this.stats.errors.length - 1) {
          console.log(`  ${colors.dim}${'─'.repeat(60)}${colors.reset}`)
        }
      })

      // Helpful suggestions
      console.log()
      console.log(
        `${colors.yellow}${colors.bright}💡 Suggestions:${colors.reset}`
      )
      console.log(
        `  ${colors.gray}• Check TypeScript types and imports${colors.reset}`
      )
      console.log(
        `  ${colors.gray}• Ensure all dependencies are installed${colors.reset}`
      )
      console.log(
        `  ${colors.gray}• Run with ${colors.cyan}--verbose${colors.reset} for detailed stack traces${colors.reset}`
      )

      // Summary
      console.log()
      console.log(
        `${colors.red}Build failed with ${this.stats.errors.length} error${
          this.stats.errors.length > 1 ? 's' : ''
        }${colors.reset}`
      )
    }

    console.log()
  }

  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

// Watch mode
class Watcher extends Builder {
  async watch() {
    // Initial build
    await this.build()

    this.logger.header('Watch Mode Active')
    this.logger.info('Watching for changes...')

    const { watch } = await import('fs')
    const debounce = new Map()

    // Watch project root
    watch(PROJECT_ROOT, { recursive: true }, async (event, filename) => {
      if (!filename) return

      // Skip excluded directories and non-source files
      if (this.options.excludeDirs.some((dir) => filename.includes(`/${dir}/`)))
        return
      if (!filename.match(/\.(svelte|ts|js|mjs)$/)) return
      if (filename.startsWith(this.options.outdir)) return

      // Debounce rapid changes
      if (debounce.has(filename)) {
        clearTimeout(debounce.get(filename))
      }

      debounce.set(
        filename,
        setTimeout(async () => {
          const fullPath = join(PROJECT_ROOT, filename)

          console.log(
            `\n${colors.yellow}↻${colors.reset} ${relative(
              PROJECT_ROOT,
              fullPath
            )}`
          )

          const start = performance.now()

          try {
            // Compile single file
            if (filename.endsWith('.svelte')) {
              await this.compileSvelte(fullPath)
            } else if (filename.endsWith('.svelte.ts')) {
              await this.compileSvelteTS(fullPath)
            } else if (filename.endsWith('.ts')) {
              await this.compileTypeScript(fullPath)
            } else {
              await this.copyJavaScript(fullPath)
            }

            // Fix imports in the output file
            const relativePath = relative(PROJECT_ROOT, fullPath)
            const outputPath = join(this.options.outdir, relativePath)
              .replace(/\.svelte$/, '.svelte.mjs')
              .replace(/\.svelte\.ts$/, '.svelte.js')
              .replace(/\.ts$/, '.mjs')

            if (existsSync(outputPath)) {
              await this.fixImports()
            }

            const elapsed = (performance.now() - start).toFixed(0)
            console.log(
              `${colors.green}✓${colors.reset} Rebuilt in ${colors.bright}${elapsed}ms${colors.reset}`
            )
          } catch (error) {
            console.log(
              `${colors.red}✗${colors.reset} Build failed: ${error.message}`
            )
          }

          debounce.delete(filename)
        }, 100)
      )
    })

    // Keep process alive
    setInterval(() => {}, 1000000)

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(`\n${colors.gray}Shutting down...${colors.reset}`)
      process.exit(0)
    })
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  const options = {
    watch: args.includes('--watch') || args.includes('-w'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    outdir:
      args.find((a) => a.startsWith('--outdir='))?.split('=')[1] || 'dist',
  }

  if (options.watch) {
    const watcher = new Watcher(options)
    await watcher.watch()
  } else {
    const builder = new Builder(options)
    await builder.build()
  }
}

export { Builder, Watcher }
