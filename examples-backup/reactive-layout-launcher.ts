#!/usr/bin/env bun

/**
 * Reactive Layout Demo Launcher
 * 
 * Demonstrates the reactive layout system with:
 * - Auto-reflow on terminal resize
 * - Dynamic layout adjustments when content changes
 * - Flexbox-like layouts in terminal
 * - Nested layout contexts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import { layoutContext } from '../src/layout/layout-context.svelte.ts'
import { layoutManager } from '../src/layout/reactive-layout.svelte.ts'

// Setup browser globals first
setupBrowserGlobals()

// Import the compiled component
import ReactiveLayoutDemo from './reactive-layout-demo.svelte.mjs'

console.log('🎯 SvelTUI Reactive Layout Demo')
console.log('Features:')
console.log('  - Auto-reflow on terminal resize')
console.log('  - Dynamic content-driven layouts')
console.log('  - Responsive sidebar and grid')
console.log('  - Centered and absolute positioning')
console.log('')
console.log('🎮 Controls:')
console.log('  [s] Toggle sidebar')
console.log('  [g] Toggle grid columns (2/3)')
console.log('  [a] Add item')
console.log('  [d] Delete item')
console.log('  [1] Main panel (vertical stack)')
console.log('  [2] Grid panel')
console.log('  [3] Center panel')
console.log('  [q] or [Ctrl+C] Quit')
console.log('')

async function main() {
  try {
    // Create renderer
    const renderer = createRenderer({
      screen: {
        title: 'SvelTUI Reactive Layout Demo',
        fullscreen: true,
        mouse: true,
        options: {
          smartCSR: true,
          keys: true
        }
      },
      debug: process.env.DEBUG === '1',
      reactive: true
    })

    // Mount the component
    await renderer.mount(ReactiveLayoutDemo, {})

    console.log('✅ Reactive layout demo started!')
    console.log('   Try resizing your terminal to see auto-reflow in action!')

    // Keep alive
    setInterval(() => {}, 1000)

  } catch (error) {
    console.error('❌ Failed to start reactive layout demo:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down reactive layout demo...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM, shutting down...')
  process.exit(0)
})

main().catch(console.error)