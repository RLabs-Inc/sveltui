#!/usr/bin/env bun --conditions browser

/**
 * Simple test to understand Svelte's style handling
 */

// Ensure browser globals are set up first
import '../src/utils/browser-globals'

import { mount } from 'svelte'
import { createScreen } from '../src/renderer/screen'
import { createTerminalRoot } from '../src/renderer/index'

// Create a simple inline component to test
const TestComponent = {
  '$$render': () => {},
  '$$': {
    on_mount: [],
    on_destroy: [],
    before_update: [],
    after_update: [],
    context: new Map(),
  }
}

// Manually test what Svelte does
import * as $ from 'svelte/internal/client'

const screen = createScreen({
  smartCSR: true,
  fullUnicode: true,
  autoPadding: true,
  warning: false,
})

// Create root element properly
const rootElement = document.createElement('div')
rootElement.setAttribute('width', '100%')
rootElement.setAttribute('height', '100%')

// This creates the blessed screen binding
const reconciler = (globalThis as any).__sveltui_reconciler
if (reconciler) {
  reconciler.setScreen(screen)
}

// Create a test element
const testBox = document.createElement('box')
testBox.setAttribute('width', '30')
testBox.setAttribute('height', '5')
testBox.setAttribute('top', '2')
testBox.setAttribute('left', '2')

// Add to DOM first
rootElement.appendChild(testBox)

// Now test Svelte's set_style
console.log('[TEST] Before set_style:', {
  style: testBox.style,
  styleType: typeof testBox.style,
  attributes: testBox.attributes
})

// Call Svelte's set_style
$.set_style(testBox, { border: { fg: 'cyan' } })

console.log('[TEST] After set_style:', {
  style: testBox.style,
  styleBorder: (testBox.style as any).border,
  attributes: testBox.attributes
})

// Also test simple styles
const testText = document.createElement('text')
testText.setAttribute('content', 'Test Text')
rootElement.appendChild(testText)

$.set_style(testText, { fg: 'green', bold: true })

console.log('[TEST] Text after set_style:', {
  style: testText.style,
  styleFg: (testText.style as any).fg,
  styleBold: (testText.style as any).bold
})

screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0)
})

screen.render()

// Check the actual rendered output
setTimeout(() => {
  const terminalBox = (testBox as any)._terminalElement
  console.log('[TEST] Terminal element props:', {
    hasTerminal: !!terminalBox,
    props: terminalBox?.props,
    style: terminalBox?.props?.style
  })
}, 100)