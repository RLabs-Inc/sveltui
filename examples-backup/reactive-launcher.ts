#!/usr/bin/env bun --conditions browser

/**
 * Reactive Demo Launcher
 * 
 * This demonstrates the Fine-Grained Reactivity Bridge in action.
 * Run with: bun --conditions browser examples/reactive-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals-terminal'
import { createRenderer } from '../src/renderer'
import ReactiveDemo from './reactive-demo.svelte.mjs'

// Set up browser globals for Svelte 5 client-side
setupBrowserGlobals()

// Create the renderer with reactive elements enabled
const renderer = createRenderer({
  title: 'SvelTUI Reactive Demo',
  debug: process.env.DEBUG === 'true',
  reactive: true // Enable reactive elements
})

// Mount the reactive demo component
await renderer.mount(ReactiveDemo, {})

// Handle graceful shutdown
process.on('SIGINT', () => {
  renderer.unmount()
  process.exit(0)
})

process.on('SIGTERM', () => {
  renderer.unmount()
  process.exit(0)
})