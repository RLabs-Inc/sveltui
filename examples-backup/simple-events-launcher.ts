#!/usr/bin/env bun

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import SimpleEventsTest from './simple-events-test.svelte.mjs'

// Setup browser globals first
setupBrowserGlobals()

// Create and start the app
const renderer = createRenderer({
  screen: {
    fullscreen: true,
    mouse: true,
    title: 'SvelTUI - Simple Events Test',
    options: {
      smartCSR: true,
      keys: true
    }
  }
})

// Mount the component
renderer.mount(SimpleEventsTest, {}).catch(console.error)

// Handle cleanup
process.on('SIGINT', () => {
  renderer.unmount()
  process.exit(0)
})

process.on('SIGTERM', () => {
  renderer.unmount()
  process.exit(0)
})