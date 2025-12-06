#!/usr/bin/env bun
/**
 * SvelTUI Create App
 * Scaffolds a new SvelTUI project with the counter demo template
 */

import { $ } from 'bun'
import { join } from 'path'

const args = process.argv.slice(2)
const projectName = args[0]

if (!projectName) {
  console.log(`
╔═══════════════════════════════════════╗
║         SvelTUI Create App            ║
╚═══════════════════════════════════════╝

Usage:
  bun create-app.mjs <project-name>

Example:
  bun create-app.mjs my-tui-app
`)
  process.exit(1)
}

console.log(`
╔═══════════════════════════════════════╗
║  Creating SvelTUI App: ${projectName.padEnd(16)} ║
╚═══════════════════════════════════════╝
`)

try {
  // Create project directory
  console.log('\n📁 Creating project structure...')
  await $`mkdir -p ${projectName}`

  // Create package.json
  console.log('📦 Creating package.json...')
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    type: 'module',
    private: true,
    description: `Terminal UI application built with SvelTUI`,
    scripts: {
      build: 'bun --cwd .. run build',
      dev: 'bun run build && bun --conditions browser dist/main.mjs',
      start: 'bun --conditions browser dist/main.mjs'
    },
    dependencies: {
      sveltui: 'file:..',
      svelte: '^5.38.7',
      '@happy-dom/global-registrator': '^18.0.1'
    }
  }

  await Bun.write(
    join(projectName, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create main.ts
  console.log('📝 Creating main.ts...')
  const mainTs = `#!/usr/bin/env bun
import { mount } from '../src/index.ts'
import { mount as mountComponent } from 'svelte'
import App from './App.svelte'

// Mount the SvelTUI app
mount(
  () => {
    mountComponent(App, {
      target: document.body,
    })
  },
  { fullscreen: false }
)
`

  await Bun.write(join(projectName, 'main.ts'), mainTs)

  // Create App.svelte (counter demo template)
  console.log('✨ Creating App.svelte...')
  const appSvelte = `<script lang="ts">
  import { Box, Text } from '../src/index.ts'
  import { keyboard } from '../src/input/keyboard.svelte.ts'
  import { onMount } from 'svelte'

  let count = $state(0)

  onMount(() => {
    // Listen for + and - keys
    const unsubscribe = keyboard.on((event) => {
      if (event.key === '+' || event.key === '=') {
        count++
        return true
      }
      if (event.key === '-' || event.key === '_') {
        count--
        return true
      }
    })

    return unsubscribe
  })
</script>

<Box
  width="100%"
  height="100%"
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  gap={2}
>
  <Box
    padding={1}
    borderStyle="round"
    borderColor="cyan"
  >
    <Text color="cyan" bold>${projectName}</Text>
  </Box>

  <Box
    padding={2}
    borderStyle="double"
    borderColor="green"
    minWidth={30}
    justifyContent="center"
  >
    <Text color="green" fontSize={2}>Count: {count}</Text>
  </Box>

  <Box flexDirection="column" alignItems="center" gap={1}>
    <Text color="yellow">Press + to increment</Text>
    <Text color="yellow">Press - to decrement</Text>
    <Text color="gray" italic>Ctrl+C to exit</Text>
  </Box>
</Box>
`

  await Bun.write(join(projectName, 'App.svelte'), appSvelte)

  // Create README
  console.log('📚 Creating README.md...')
  const readme = `# ${projectName}

A terminal UI application built with [SvelTUI](https://github.com/RLabs-Inc/sveltui).

## Getting Started

### Install Dependencies

\`\`\`bash
bun install
\`\`\`

### Run the App

\`\`\`bash
bun run dev
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── App.svelte        # Main application component
├── main.ts           # Application entry point
├── package.json      # Project configuration
└── README.md         # This file
\`\`\`

## Controls

- **+** or **=** - Increment counter
- **-** - Decrement counter
- **Ctrl+C** - Exit application
- **Ctrl+P** - Toggle debug panel

## Development

Edit \`App.svelte\` to customize your terminal UI. SvelTUI uses standard Svelte 5 syntax with runes for reactivity.

### Available Components

- \`Box\` - Container with flexbox layout, borders, and styling
- \`Text\` - Styled text rendering
- \`Input\` - Text input field (work in progress)

### Example

\`\`\`svelte
<script>
  let message = $state("Hello, Terminal!")
</script>

<Box padding={2} borderStyle="round" borderColor="cyan">
  <Text color="cyan" bold>{message}</Text>
</Box>
\`\`\`

## Documentation

- [SvelTUI Repository](https://github.com/RLabs-Inc/sveltui)
- [Getting Started Guide](https://github.com/RLabs-Inc/sveltui/blob/main/docs/GETTING_STARTED.md)
- [API Reference](https://github.com/RLabs-Inc/sveltui/blob/main/docs/API.md)

## License

MIT
`

  await Bun.write(join(projectName, 'README.md'), readme)

  console.log('\n✅ Project created successfully!\n')
  console.log('Next steps:')
  console.log(`  ${'\x1b[36m'}cd ${projectName}${'\x1b[0m'}`)
  console.log(`  ${'\x1b[36m'}bun install${'\x1b[0m'}`)
  console.log(`  ${'\x1b[36m'}bun run dev${'\x1b[0m'}`)
  console.log('')

} catch (error) {
  console.error('\n❌ Error creating project:', error.message)
  process.exit(1)
}
