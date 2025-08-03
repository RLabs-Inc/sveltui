#!/usr/bin/env bun --conditions browser

/**
 * Debug how Svelte sets styles
 */

// Ensure browser globals are set up first
import '../src/utils/browser-globals'

// Patch HTMLElement to track style changes
const originalStyleSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style')?.set
if (originalStyleSetter) {
  Object.defineProperty(HTMLElement.prototype, 'style', {
    get() {
      return this._styleProxy || this._style
    },
    set(value) {
      console.log('[TRACE] HTMLElement.style setter called:', {
        tagName: this.tagName,
        value,
        type: typeof value
      })
      if (originalStyleSetter) {
        originalStyleSetter.call(this, value)
      }
      this._style = value
    }
  })
}

// Also patch to see __style usage
const createElement = document.createElement.bind(document)
document.createElement = function(tagName: string) {
  const element = createElement(tagName)
  
  // Watch for __style property access
  Object.defineProperty(element, '__style', {
    get() {
      console.log('[TRACE] __style getter:', this._internalStyle)
      return this._internalStyle
    },
    set(value) {
      console.log('[TRACE] __style setter:', {
        tagName: this.tagName,
        value,
        type: typeof value
      })
      this._internalStyle = value
    }
  })
  
  return element
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

console.log('[TRACE] Component mounted')