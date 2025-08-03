#!/usr/bin/env bun
/**
 * Debug launcher for basic-test.svelte to trace rendering issues
 */
import { render } from '../src/api/index'

// Enable debug mode
const cleanup = render('./examples/basic-test.svelte.mjs', {
  debug: true,
  props: {}
})

// Keep the process alive
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})