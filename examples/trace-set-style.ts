#!/usr/bin/env bun --conditions browser

/**
 * Trace Svelte's set_style implementation
 */

// Ensure browser globals are set up first
import '../src/utils/browser-globals'

// Import Svelte internals
import * as $ from 'svelte/internal/client'

// Check if set_style exists and wrap it
if ('set_style' in $) {
  console.log('[TRACE] Found $.set_style, wrapping it...')
  const originalSetStyle = $.set_style
  ;($ as any).set_style = function(element: any, styles: any, important?: any) {
    console.log('[TRACE] $.set_style called:', {
      element: element?.tagName,
      styles,
      important,
      typeOfStyles: typeof styles,
      styleKeys: styles && typeof styles === 'object' ? Object.keys(styles) : null
    })
    
    // Store the styles on the element for the bridge to find
    if (element && styles && typeof styles === 'object') {
      element.__sveltui_styles = styles
    }
    
    return originalSetStyle.call(this, element, styles, important)
  }
}

import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'
import BasicCounter from './basic-counter.svelte'

const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

const root = createTerminalRoot(screen)

screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

console.log('[TRACE] Mounting component...')
const app = mount(BasicCounter, {
  target: root.domNode
})

screen.focusNext()
screen.render()

setTimeout(() => {
  console.log('[TRACE] Checking for elements with __sveltui_styles...')
  const allElements = root.domNode.getElementsByTagName('*')
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i] as any
    if (el.__sveltui_styles) {
      console.log('[TRACE] Found element with styles:', {
        tagName: el.tagName,
        styles: el.__sveltui_styles
      })
    }
  }
}, 100)