#!/usr/bin/env bun

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import DebugEventsTest from './debug-events-test.svelte.mjs'

// Setup browser globals first
setupBrowserGlobals()

// Create and start the app
const renderer = createRenderer({
  screen: {
    fullscreen: true,
    mouse: true,
    title: 'SvelTUI - Debug Events Test',
    options: {
      smartCSR: true,
      keys: true
    }
  },
  debug: true  // Enable debug mode
})

// Mount the component
renderer.mount(DebugEventsTest, {}).then(() => {
  console.log('Component mounted successfully')
  
  // Keep the process alive
  setInterval(() => {
    // Keep alive
  }, 1000)
}).catch(console.error)

// Handle cleanup
process.on('SIGINT', () => {
  renderer.unmount()
  process.exit(0)
})

process.on('SIGTERM', () => {
  renderer.unmount()
  process.exit(0)
})