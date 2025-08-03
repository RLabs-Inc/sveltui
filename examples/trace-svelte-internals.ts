#!/usr/bin/env bun --conditions browser

/**
 * Trace Svelte internals to understand style handling
 */

// Import Svelte internals to see what's available
import * as svelteInternal from 'svelte/internal/client'

console.log('[TRACE] Svelte internal exports:')
console.log('Available functions:', Object.keys(svelteInternal).filter(k => k.includes('style')))

// Check if set_style exists
if ('set_style' in svelteInternal) {
  console.log('[TRACE] Found set_style function')
  console.log('set_style type:', typeof svelteInternal.set_style)
  
  // Let's see what set_style does by wrapping it
  const originalSetStyle = svelteInternal.set_style
  ;(svelteInternal as any).set_style = function(element: any, styles: any) {
    console.log('[TRACE] set_style called with:', {
      element: element?.tagName || element,
      styles,
      styleType: typeof styles,
      isObject: styles && typeof styles === 'object'
    })
    
    // Call original
    return originalSetStyle.call(this, element, styles)
  }
}

// Also check setAttribute
if ('set_attribute' in svelteInternal) {
  console.log('[TRACE] Found set_attribute function')
  const originalSetAttribute = svelteInternal.set_attribute
  ;(svelteInternal as any).set_attribute = function(element: any, name: string, value: any) {
    if (name === 'style' || name === 'border') {
      console.log('[TRACE] set_attribute called for style/border:', {
        element: element?.tagName || element,
        name,
        value,
        valueType: typeof value
      })
    }
    return originalSetAttribute.call(this, element, name, value)
  }
}

// Test basic counter to see how styles are set
import BasicCounter from './basic-counter.svelte'
import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'

const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

const root = createTerminalRoot(screen)

// Mount the component
console.log('[TRACE] Mounting component...')
const app = mount(BasicCounter, {
  target: root.domNode
})

screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

screen.focusNext()
screen.render()

console.log('[TRACE] Component mounted')