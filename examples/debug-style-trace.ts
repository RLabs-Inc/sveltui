#!/usr/bin/env bun --conditions browser

/**
 * Debug style tracing for SvelTUI
 * 
 * This file helps trace how styles flow through the rendering pipeline
 */

import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'
import BasicCounter from './basic-counter.svelte'

// Patch setAttribute to log style calls
const originalSetAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function(name: string, value: any) {
  if (name === 'style') {
    console.log('[TRACE] setAttribute called with style:', {
      name,
      value,
      typeofValue: typeof value,
      stringValue: String(value),
      isObject: value && typeof value === 'object'
    })
    if (value && typeof value === 'object') {
      console.log('[TRACE] Style object contents:', JSON.stringify(value, null, 2))
    }
  }
  return originalSetAttribute.call(this, name, value)
}

// Also patch the Svelte internal set_style if we can find it
const svelteInternal = (globalThis as any).$
if (svelteInternal && svelteInternal.set_style) {
  const originalSetStyle = svelteInternal.set_style
  svelteInternal.set_style = function(element: Element, styles: any) {
    console.log('[TRACE] $.set_style called:', {
      element: element.tagName,
      styles,
      typeofStyles: typeof styles
    })
    return originalSetStyle.call(this, element, styles)
  }
}

// Create the terminal screen
const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

// Create root element
const root = createTerminalRoot(screen)

// Set up global keyboard handler
screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

// Mount the component
console.log('[TRACE] Mounting component...')
const app = mount(BasicCounter, {
  target: root.domNode
})

// Focus the screen
screen.focusNext()

// Initial render
screen.render()

console.log('[TRACE] Component mounted, check style rendering')