#!/usr/bin/env bun
/**
 * Package SvelTUI as source files for distribution
 * 
 * This script packages the framework as source files that will be
 * compiled together with the user's application.
 */

import { $ } from 'bun'
import { join } from 'path'

const PACKAGE_DIR = 'sveltui-package'

async function createPackage() {
  console.log('📦 Creating SvelTUI source package...\n')

  // Clean and create package directory using Bun shell
  await $`rm -rf ${PACKAGE_DIR}`
  await $`mkdir -p ${PACKAGE_DIR}`

  // Copy entire src directory as-is using Bun shell
  console.log('  ↳ Copying source files...')
  await $`cp -r src ${join(PACKAGE_DIR, 'src')}`

  // Remove test files from package (not needed for distribution)
  console.log('  ↳ Removing test files...')
  await $`rm -rf ${join(PACKAGE_DIR, 'src/test')}`
  await $`rm -f ${join(PACKAGE_DIR, 'src/main.ts')}`
  
  // Compile just the index.ts to index.js for compatibility
  console.log('  ↳ Compiling index.ts...')
  const indexTs = await Bun.file('src/index.ts').text()
  
  // Use Bun's transpiler to convert TS to JS
  const transpiler = new Bun.Transpiler({
    loader: 'ts',
    target: 'browser',
  })
  
  const indexJs = transpiler.transformSync(indexTs)
  await Bun.write(join(PACKAGE_DIR, 'src/index.js'), indexJs)

  // Create package.json using Bun.write
  console.log('  ↳ Creating package.json...')
  const packageJson = {
    name: 'sveltui',
    version: '0.1.0',
    description: 'Terminal UI framework powered by Svelte',
    type: 'module',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './src/*': './src/*'
    },
    files: ['src'],
    keywords: ['svelte', 'terminal', 'tui', 'cli', 'ui'],
    author: '',
    license: 'MIT',
    dependencies: {
      '@happy-dom/global-registrator': '^18.0.1',
      'svelte': '^5.38.7',
      'yoga-layout': '^3.2.1'
    },
    peerDependencies: {
      'svelte': '^5.0.0',
      'yoga-layout': '^3.0.0'
    },
    engines: {
      node: '>=18.0.0'
    }
  }

  await Bun.write(
    join(PACKAGE_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create README using Bun.write
  console.log('  ↳ Creating README.md...')
  const readme = `# SvelTUI

Terminal UI framework powered by Svelte 5's reactivity system and Yoga layout engine.

## Features

- 🎨 **Svelte 5 Runes** - Modern reactivity with \`$state\`, \`$effect\`, \`$derived\`
- 📐 **Flexbox Layout** - Full CSS flexbox support via Yoga layout engine
- ⌨️ **Keyboard & Mouse** - Complete input handling with focus management
- 🎯 **Reactive Rendering** - Only re-renders what changed, when it changes
- 🎭 **Theming** - Built-in themes (default, dracula, nord, monokai, solarized)
- 🖼️ **10 Border Styles** - single, double, rounded, heavy, dashed, and more

## Installation

\`\`\`bash
bun add sveltui
\`\`\`

## Quick Start

Create \`main.ts\`:

\`\`\`typescript
import { mount } from 'sveltui'
import { mount as mountComponent } from 'svelte'
import App from './App.svelte'

mount(() => {
  mountComponent(App, { target: document.body })
}, { fullscreen: true })
\`\`\`

Create \`App.svelte\`:

\`\`\`svelte
<script>
  import { Box, Text, Input } from 'sveltui'

  let name = $state('')
</script>

<Box border="rounded" borderColor={0x06} padding={1}>
  <Text text="Welcome to SvelTUI!" color={0x0a} bold />

  <Input bind:value={name} placeholder="Enter your name..." />

  {#if name}
    <Text text={\`Hello, \${name}!\`} color={0x0b} />
  {/if}
</Box>
\`\`\`

## Components

- **Box** - Flexbox container with borders, padding, and background colors
- **Text** - Styled text with colors, bold, italic, underline, etc.
- **Input** - Text input with cursor, placeholder, and focus handling

## Running Your App

\`\`\`bash
# Build (compiles Svelte + SvelTUI together)
bun run build

# Run
bun --conditions browser dist/src/main.mjs
\`\`\`

## Build Configuration

SvelTUI ships as source files that must be compiled together with your application.
Use the \`sv-tui\` CLI to create a new project with the correct build setup:

\`\`\`bash
bunx sv-tui create my-app
cd my-app
bun install
bun run build
bun run start
\`\`\`

## License

MIT
`

  await Bun.write(join(PACKAGE_DIR, 'README.md'), readme)

  console.log('\n✅ Package created successfully!')
  console.log(`📁 Output: ${PACKAGE_DIR}/`)
  console.log('\nTo test locally:')
  console.log('  cd sveltui-package && bun link')
  console.log('  cd <your-app> && bun link sveltui')
}

// Run the packager
await createPackage()