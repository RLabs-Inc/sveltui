import { render } from '../src/renderer'

// Use the simple demo
const App = 'examples/simple-working-demo.svelte.mjs'

console.log('Starting Simple SvelTUI Test...')

// Render with simpler config
const cleanup = render(App, {
  title: 'SvelTUI Test',
  fullscreen: true,
  props: {}
})

// Handle exit
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

console.log('Test running. Press Ctrl+C to exit.')