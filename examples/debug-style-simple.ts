#!/usr/bin/env bun --conditions browser

/**
 * Simple style debugging for SvelTUI
 * 
 * Tests style rendering in isolation
 */

import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'

// First, let's trace where Svelte's set_style function is coming from
console.log('[TRACE] Checking Svelte internal $:', {
  hasGlobal$: '$' in globalThis,
  $type: typeof (globalThis as any).$,
  hasSetStyle: (globalThis as any).$ && 'set_style' in (globalThis as any).$
})

// Create the terminal screen
const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

// Create root element
const root = createTerminalRoot(screen)

// Create a simple test component inline
const TestComponent = {
  $$render: (result: any, props: any) => {
    // This mimics what the compiled Svelte would do
    const box = document.createElement('box')
    box.setAttribute('width', '30')
    box.setAttribute('height', '5')
    box.setAttribute('border', JSON.stringify({ type: 'line' }))
    
    // Try to set style directly
    console.log('[TRACE] Setting style attribute directly')
    box.setAttribute('style', JSON.stringify({ border: { fg: 'red' } }))
    
    const text = document.createElement('text')
    text.setAttribute('content', 'Test Style')
    text.setAttribute('style', JSON.stringify({ fg: 'green', bold: true }))
    
    box.appendChild(text)
    
    return box
  }
}

// Mount a simple box with style
const testElement = document.createElement('box')
testElement.setAttribute('width', '100%')
testElement.setAttribute('height', '100%')
testElement.setAttribute('border', JSON.stringify({ type: 'line' }))

// Test different ways of setting style
console.log('[TRACE] Testing style attribute methods:')

// Method 1: Direct setAttribute with object
console.log('[TRACE] Method 1: setAttribute with stringified object')
testElement.setAttribute('style', JSON.stringify({ border: { fg: 'cyan' } }))

// Method 2: Using inline style string
console.log('[TRACE] Method 2: setAttribute with CSS string')
const testElement2 = document.createElement('text')
testElement2.setAttribute('style', 'color: yellow; font-weight: bold;')
testElement2.textContent = 'Yellow Bold Text'

// Method 3: Check if element has style property
console.log('[TRACE] Method 3: Checking element.style property:', {
  hasStyle: 'style' in testElement,
  styleType: typeof (testElement as any).style
})

// Add elements to root
root.domNode.appendChild(testElement)
testElement.appendChild(testElement2)

// Set up global keyboard handler
screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

// Focus the screen
screen.focusNext()

// Initial render
screen.render()

console.log('[TRACE] Test complete, check visual output')