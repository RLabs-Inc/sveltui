#!/usr/bin/env bun

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'

// Get component path from command line
const componentPath = process.argv[2]
if (!componentPath) {
  console.error('Usage: bun launcher.ts <component.svelte.mjs>')
  process.exit(1)
}

// Setup browser globals first
setupBrowserGlobals()

// Import the component
import(componentPath).then(async (module) => {
  const Component = module.default
  
  // Create and start the app
  const renderer = createRenderer({
    screen: {
      fullscreen: true,
      mouse: true,
      title: 'SvelTUI',
      options: {
        smartCSR: true,
        keys: true
      }
    },
    debug: true
  })

  // Mount the component
  await renderer.mount(Component, {})
  console.log('Component mounted')
  
  // Keep alive
  setInterval(() => {}, 1000)
}).catch(console.error)

// Handle cleanup
process.on('SIGINT', () => {
  process.exit(0)
})

process.on('SIGTERM', () => {
  process.exit(0)
})