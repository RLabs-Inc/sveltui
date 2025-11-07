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
      '@happy-dom/global-registrator': '^15.11.7',
      'svelte': '^5.14.4'
    },
    peerDependencies: {
      'svelte': '^5.0.0'
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

Terminal UI framework powered by Svelte's reactivity system.

## Installation

\`\`\`bash
npm install sveltui
\`\`\`

## Usage

\`\`\`javascript
import { mount } from 'sveltui'
import { mount as mountComponent } from 'svelte'
import App from './App.svelte'

mount(() => {
  const app = mountComponent(App, {
    target: document.body
  })
})
\`\`\`

In your Svelte components:

\`\`\`svelte
<script>
  import Box from 'sveltui/src/components/Box.svelte'
  import Text from 'sveltui/src/components/Text.svelte'
  import Input from 'sveltui/src/components/Input.svelte'
</script>

<Box x={2} y={1} width={50} height={10} border="rounded">
  <Text x={2} y={1} text="Hello, SvelTUI!" />
</Box>
\`\`\`

## Build Configuration

Your build tool needs to compile Svelte files. The SvelTUI components will be compiled together with your application code.
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