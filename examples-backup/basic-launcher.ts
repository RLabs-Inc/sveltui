#!/usr/bin/env bun --conditions browser

/**
 * Basic Test Launcher
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals-terminal'
import { createRenderer } from '../src/renderer'
import BasicTest from './basic-test.svelte.mjs'

// Set up browser globals for Svelte 5 client-side
setupBrowserGlobals({ debug: true })

// Create the renderer WITHOUT reactive elements
const renderer = createRenderer({
  title: 'Basic Test',
  debug: true,
  reactive: false // Disable reactive elements for now
})

// Mount the component
await renderer.mount(BasicTest, {})

// Handle graceful shutdown
process.on('SIGINT', () => {
  renderer.unmount()
  process.exit(0)
})