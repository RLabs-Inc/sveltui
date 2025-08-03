#!/usr/bin/env node

/**
 * Test launcher for initial color rendering fix
 * This should show correct colors from the very first render
 */

import { renderComponent } from '../src/renderer/svelte-renderer'
import path from 'path'

async function main() {
  console.log('Testing initial color rendering...')
  
  const componentPath = path.resolve(__dirname, 'test-initial-colors.svelte.mjs')
  
  try {
    const { destroy, screen } = await renderComponent(componentPath, {
      debug: true,
      title: 'Initial Color Test',
    })

    // Set up key handler for color changes
    screen.key(['c'], () => {
      console.log('Color change key pressed (functionality not implemented in this test)')
    })

    // Set up exit handler
    screen.key(['q', 'C-c'], async () => {
      console.log('Exiting...')
      destroy()
      process.exit(0)
    })

    console.log('\nInstructions:')
    console.log('- Check if text shows "Text color: green" in GREEN color from first render')
    console.log('- Check if text shows "Border color: yellow" from first render')
    console.log('- Check if box border is YELLOW from first render')
    console.log('- Press q to quit')
    
    // The screen is already focused by default
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(console.error)