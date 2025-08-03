/**
 * Launcher for Reactive Demo
 * 
 * Demonstrates the Fine-Grained Reactivity Bridge in action
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer/svelte-renderer'
import { mount } from 'svelte'
import ReactiveDemoComponent from './reactive-demo.svelte.mjs'

// Setup browser globals for Svelte client-side
setupBrowserGlobals()

// Create renderer
const renderer = createRenderer({
  debug: process.argv.includes('--debug')
})

// Mount the component with reactive elements enabled
const app = mount(ReactiveDemoComponent, {
  target: renderer.getTarget(),
  context: new Map([
    ['sveltui:reactive', true] // Enable reactive elements
  ])
})

// Handle cleanup on exit
process.on('SIGINT', () => {
  app.$destroy?.()
  renderer.destroy()
  process.exit(0)
})

// Show cursor on exit
process.on('exit', () => {
  process.stdout.write('\x1B[?25h')
})

console.log('Reactive Demo running! Press Ctrl+C to exit.')
console.log('Watch as values update automatically through fine-grained reactivity!')