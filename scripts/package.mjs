#!/usr/bin/env bun
/**
 * Package SvelTUI for npm distribution
 * Creates a clean package with compiled files ready for distribution
 */

import { $ } from 'bun'
import { join } from 'path'
import { existsSync } from 'fs'

const PACKAGE_DIR = 'package'

async function createPackage() {
  console.log('📦 Creating SvelTUI npm package...\n')

  // Clean and create package directory
  await $`rm -rf ${PACKAGE_DIR}`
  await $`mkdir -p ${PACKAGE_DIR}`

  // Copy compiled dist files
  console.log('  ↳ Copying compiled files...')
  if (!existsSync('dist')) {
    console.error('❌ dist/ folder not found. Run "bun run build" first.')
    process.exit(1)
  }
  await $`cp -r dist/src ${join(PACKAGE_DIR, '/')}`

  // Create package.json for npm
  console.log('  ↳ Creating package.json...')
  const packageJson = {
    name: 'sveltui',
    version: '0.1.0',
    description: 'Build Terminal User Interfaces with Svelte - A reactive TUI framework',
    main: 'index.mjs',
    module: 'index.mjs',
    type: 'module',
    exports: {
      '.': './index.mjs',
      './mount': './mount.svelte.js'
    },
    files: [
      '**/*.mjs',
      '**/*.js',
      '*.d.ts',
      'README.md',
      'LICENSE'
    ],
    keywords: [
      'svelte',
      'svelte5',
      'terminal',
      'tui',
      'cli',
      'terminal-ui',
      'ink',
      'blessed',
      'reactive',
      'components'
    ],
    author: 'RLabs Inc.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/RLabs-Inc/sveltui.git'
    },
    bugs: {
      url: 'https://github.com/RLabs-Inc/sveltui/issues'
    },
    homepage: 'https://github.com/RLabs-Inc/sveltui#readme',
    dependencies: {
      '@happy-dom/global-registrator': '^18.0.1',
      'svelte': '^5.38.7',
      'yoga-layout': '^3.2.1'
    },
    peerDependencies: {
      'svelte': '^5.0.0'
    },
    engines: {
      node: '>=18.0.0',
      bun: '>=1.0.0'
    }
  }

  await Bun.write(
    join(PACKAGE_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Copy README
  console.log('  ↳ Copying documentation...')
  await $`cp README.md ${join(PACKAGE_DIR, 'README.md')}`

  // Copy LICENSE if it exists
  if (existsSync('LICENSE')) {
    await $`cp LICENSE ${join(PACKAGE_DIR, 'LICENSE')}`
  }

  // Create .npmignore
  console.log('  ↳ Creating .npmignore...')
  const npmignore = `# Development files
node_modules
*.log
.DS_Store
.env

# Source files (we ship compiled)
*.ts
!*.d.ts

# Build artifacts
dist/
*.tsbuildinfo

# Test files
**/*.test.*
**/*.spec.*
__tests__/
test/

# Documentation source
docs/
examples/
`

  await Bun.write(join(PACKAGE_DIR, '.npmignore'), npmignore)

  console.log('\n✅ Package created successfully!')
  console.log(`📁 Output: ${PACKAGE_DIR}/`)
  console.log('\nNext steps:')
  console.log('  cd package')
  console.log('  npm publish --dry-run  # Test the package')
  console.log('  npm publish            # Publish to npm')
}

// Run the packager
await createPackage()
