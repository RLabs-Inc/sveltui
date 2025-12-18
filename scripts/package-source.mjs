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

  // Copy LICENSE file
  console.log('  ↳ Copying LICENSE...')
  await $`cp LICENSE ${join(PACKAGE_DIR, 'LICENSE')}`

  // Copy CLI tool
  console.log('  ↳ Copying sv-tui CLI...')
  await $`cp sv-tui ${join(PACKAGE_DIR, 'sv-tui')}`
  await $`chmod +x ${join(PACKAGE_DIR, 'sv-tui')}`

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
    name: '@rlabs-inc/sveltui',
    version: '0.1.5',
    description:
      'Build beautiful terminal applications with Svelte 5 - reactive, zero-flicker, flexbox layouts',
    type: 'module',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './src/*': './src/*',
    },
    bin: {
      'sv-tui': './sv-tui',
    },
    files: ['src', 'sv-tui', 'LICENSE'],
    keywords: [
      'svelte',
      'svelte5',
      'terminal',
      'tui',
      'cli',
      'ui',
      'terminal-ui',
      'console',
      'flexbox',
      'reactive',
      'bun',
    ],
    author: 'RLabs Inc.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/RLabs-Inc/sveltui.git',
    },
    homepage: 'https://github.com/RLabs-Inc/sveltui#readme',
    bugs: {
      url: 'https://github.com/RLabs-Inc/sveltui/issues',
    },
    dependencies: {
      '@happy-dom/global-registrator': '^18.0.1',
      svelte: '^5.38.7',
      'yoga-layout': '^3.2.1',
    },
    peerDependencies: {
      svelte: '^5.0.0',
      'yoga-layout': '^3.0.0',
    },
    engines: {
      node: '>=18.0.0',
    },
  }

  await Bun.write(
    join(PACKAGE_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create README using Bun.write
  console.log('  ↳ Creating README.md...')
  const readme = `# SvelTUI

**Build beautiful terminal applications with Svelte 5**

A terminal UI framework that brings Svelte's elegant reactive programming model to the command line. Instant reactivity, zero flickering, flexbox layouts.

\`\`\`svelte
<script>
  import { Box, Text, keyboard } from 'sveltui'

  let count = $state(0)
  keyboard.onKey('Space', () => count++)
</script>

<Box border="rounded" borderColor={0x06} padding={1}>
  <Text text="Press Space!" color={0x0a} />
  <Text text={\`Count: \${count}\`} color={0x0b} />
</Box>
\`\`\`

## Features

- **Svelte 5 Runes** - \`$state\`, \`$effect\`, \`$derived\` just work
- **Flexbox Layout** - Powered by Yoga layout engine
- **Reactive Rendering** - Only updates what changed, when it changes
- **Zero Flickering** - Differential rendering for rock-solid UI
- **Keyboard API** - Reactive state + imperative callbacks
- **Focus Management** - Tab navigation built-in
- **Theming** - Built-in themes (dracula, nord, monokai, solarized)
- **True Color** - Full 24-bit color support
- **TypeScript** - First-class support

## Quick Start

\`\`\`bash
# Create a new project (recommended)
bunx @rlabs-inc/sveltui create my-app
cd my-app
bun install
bun run dev
\`\`\`

## Components

### Box

\`\`\`svelte
<Box border="rounded" borderColor={0x06} width={40} height={10} padding={1}>
  <Text text="Content" />
</Box>
\`\`\`

### Text

\`\`\`svelte
<Text text="Hello World" color={0x00ff00} bold />
\`\`\`

## Keyboard API

\`\`\`svelte
<script>
  import { keyboard } from 'sveltui'
  import { onDestroy } from 'svelte'

  // Imperative: callbacks for actions
  const unsub = keyboard.onKey('Enter', () => submit())
  onDestroy(unsub)
</script>

<!-- Reactive: state in templates -->
<Text text={\`Last key: \${keyboard.lastKey}\`} />
\`\`\`

## Colors

\`\`\`svelte
<Text color={0xff0000} text="Hex number" />
<Text color="#00ff00" text="Hex string" />
<Text color="blue" text="CSS name" />
\`\`\`

## Themes & Variants

Use semantic \`variant\` props for automatic theme colors:

\`\`\`svelte
<!-- Variants: primary, secondary, success, warning, danger, info -->
<Box variant="primary" border="rounded">
  <Text text="Primary styled" />
</Box>

<Text text="Success!" variant="success" />
<Text text="Warning" variant="warning" />
<Text text="Muted text" muted />
\`\`\`

Change themes globally:

\`\`\`svelte
<script>
  import { getTheme } from 'sveltui'
  const theme = getTheme()
  theme().setTheme('dracula')  // or: nord, monokai, solarized
</script>
\`\`\`

## Requirements

- **Bun** >= 1.0.0
- Terminal with true color support

## Documentation

Full documentation available at [GitHub](https://github.com/RLabs-Inc/sveltui).

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
