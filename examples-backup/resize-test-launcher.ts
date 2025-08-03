#!/usr/bin/env bun

/**
 * Terminal Resize Test Launcher
 * 
 * Demonstrates reactive layout system responding to terminal resize events
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import { layoutContext } from '../src/layout/layout-context.svelte.ts'

// Setup browser globals first
setupBrowserGlobals()

// Import the compiled component
import ResizeTest from './resize-test.svelte.mjs'

console.log('🔄 Terminal Resize Test')
console.log('Resize your terminal window to see reactive layout updates!')
console.log('Press [q] or [Ctrl+C] to quit')
console.log('')

async function main() {
  try {
    // Create renderer
    const renderer = createRenderer({
      screen: {
        title: 'SvelTUI Resize Test',
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
    await renderer.mount(ResizeTest, {})

    console.log('✅ Resize test started!')
    console.log('   Try resizing your terminal to see reactive layout changes!')

    // Keep alive
    setInterval(() => {}, 1000)

  } catch (error) {
    console.error('❌ Failed to start resize test:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down resize test...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM, shutting down...')
  process.exit(0)
})

main().catch(console.error)