#!/usr/bin/env bun --conditions browser

/**
 * Test style fix for SvelTUI - Proper launcher
 */

import { createRenderer } from '../src/renderer/svelte-renderer'
import BasicCounter from './basic-counter.svelte.mjs'

// Create and run the renderer
const { mount, unmount, cleanup } = createRenderer({
  screen: {
    title: 'Style Test',
    fullscreen: true,
    mouse: true,
  },
  debug: false,
})

// Mount the component
console.log('Mounting component...')
const component = mount(BasicCounter, {
  props: {}
})

console.log('Component mounted successfully!')

// Keep the app running
process.stdin.resume()