#!/usr/bin/env bun
/**
 * Build script for SvelTUI applications
 * 
 * This compiles both the application and SvelTUI framework together
 * to ensure DOM compatibility.
 */

import * as svelte from 'svelte/compiler'
import { $ } from 'bun'
import { Glob } from 'bun'
import { join, dirname, relative } from 'path'

const cwd = process.cwd()

async function build() {
  console.log('🔨 Building SvelTUI application...\n')
  
  // Clean dist
  await $`rm -rf dist`
  await $`mkdir -p dist`
  
  // Find all source files
  const files = []
  
  // App source files
  const appPatterns = ['src/**/*.svelte', 'src/**/*.ts', 'src/**/*.js', 'src/**/*.mjs']
  for (const pattern of appPatterns) {
    const glob = new Glob(pattern)
    for await (const file of glob.scan({ cwd })) {
      files.push(file)
    }
  }
  
  // SvelTUI source files - scan the actual directory
  const sveltUIPath = 'node_modules/sveltui/src'
  const sveltUIPatterns = ['**/*.svelte', '**/*.svelte.ts', '**/*.ts', '**/*.js']
  for (const pattern of sveltUIPatterns) {
    const glob = new Glob(pattern)
    for await (const file of glob.scan({ cwd: join(cwd, sveltUIPath) })) {
      // Skip test files
      if (file.includes('test/')) continue
      files.push(join(sveltUIPath, file))
    }
  }
  
  console.log(`  Found ${files.length} files to compile`)
  
  // Compile each file
  for (const file of files) {
    const source = await Bun.file(file).text()
    const outPath = join('dist', file)
    
    await $`mkdir -p ${dirname(outPath)}`
    
    if (file.endsWith('.svelte')) {
      // Compile Svelte component
      const compiled = svelte.compile(source, {
        filename: file,
        generate: 'client',
        css: 'injected',
        runes: true,
        compatibility: { componentApi: 5 }
      })
      await Bun.write(outPath + '.mjs', compiled.js.code)
    } else if (file.endsWith('.svelte.ts')) {
      // Compile Svelte TS module
      const transpiler = new Bun.Transpiler({ loader: 'ts' })
      const jsCode = transpiler.transformSync(source)
      const compiled = svelte.compileModule(jsCode, {
        filename: file,
        generate: 'client'
      })
      await Bun.write(outPath.replace('.svelte.ts', '.svelte.js'), compiled.js.code)
    } else if (file.endsWith('.ts')) {
      // Transpile TypeScript
      const transpiler = new Bun.Transpiler({ loader: 'ts' })
      const jsCode = transpiler.transformSync(source)
      await Bun.write(outPath.replace('.ts', '.mjs'), jsCode)
    } else {
      // Copy JS files as-is
      await Bun.write(outPath, source)
    }
  }
  
  // Fix imports in all compiled files
  console.log('  Fixing import paths...')
  const distFiles = []
  const distGlob = new Glob('**/*.{mjs,js}')
  for await (const file of distGlob.scan({ cwd: 'dist' })) {
    distFiles.push(join('dist', file))
  }
  
  for (const file of distFiles) {
    const content = await Bun.file(file).text()
    const fixed = content
      // Fix .svelte imports
      .replace(/from\s+['"]([^'"]+)\.svelte['"]/g, "from '$1.svelte.mjs'")
      // Fix .svelte.ts imports
      .replace(/from\s+['"]([^'"]+)\.svelte\.ts['"]/g, "from '$1.svelte.js'")
      // Fix .ts imports (relative only)
      .replace(/from\s+['"](\.\.?\/[^'"]+)\.ts['"]/g, "from '$1.mjs'")
      // Fix bare sveltui imports
      .replace(/from\s+["']sveltui["']/g, "from '../node_modules/sveltui/src/index.mjs'")
      .replace(/from\s+["']sveltui\/src\//g, "from '../node_modules/sveltui/src/")
    
    if (fixed !== content) {
      await Bun.write(file, fixed)
    }
  }
  
  console.log('\n✅ Build complete!')
  console.log('📁 Output: dist/')
  console.log('\nRun with: bun dist/src/main.mjs')
}

// Run build
await build()