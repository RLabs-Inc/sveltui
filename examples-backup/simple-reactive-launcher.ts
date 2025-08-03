#!/usr/bin/env bun --conditions browser

/**
 * Simple Reactive Test Launcher
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals-terminal'
import { createRenderer } from '../src/renderer'
import SimpleReactiveTest from './simple-reactive-test.svelte.mjs'

// Set up browser globals for Svelte 5 client-side
setupBrowserGlobals()

// Create the renderer with reactive elements enabled
const renderer = createRenderer({
  title: 'Simple Reactive Test',
  debug: true,
  reactive: true
})

// Mount the component
await renderer.mount(SimpleReactiveTest, {})

// Handle graceful shutdown
process.on('SIGINT', () => {
  renderer.unmount()
  process.exit(0)
})