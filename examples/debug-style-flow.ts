#!/usr/bin/env bun --conditions browser

/**
 * Debug style flow through the rendering pipeline
 */

// Ensure browser globals are set up first
import '../src/utils/browser-globals'

// Add debugging to our TerminalElement style proxy
const originalCreateElement = document.createElement.bind(document)
document.createElement = function(tagName: string) {
  const element = originalCreateElement(tagName)
  
  // Intercept style property access
  const styleProxy = element.style
  if (styleProxy && typeof styleProxy === 'object') {
    // Log when styles are accessed
    const handler = {
      set(target: any, prop: string, value: any) {
        console.log('[TRACE] Style property set:', {
          tagName: element.tagName,
          prop,
          value,
          hasTerminalElement: !!(element as any)._terminalElement
        })
        target[prop] = value
        
        // If this element has a terminal element, update it
        const terminalElement = (element as any)._terminalElement
        if (terminalElement && terminalElement.setProps) {
          console.log('[TRACE] Updating terminal element style')
          // Trigger the conversion
          if (typeof (element as any).convertStylesToBlessed === 'function') {
            const blessedStyle = (element as any).convertStylesToBlessed()
            terminalElement.setProps({
              ...terminalElement.props,
              style: blessedStyle
            })
            terminalElement.update()
          }
        }
        
        return true
      }
    }
    
    // Replace style with a proxy
    Object.defineProperty(element, 'style', {
      get() {
        return new Proxy(styleProxy, handler)
      },
      configurable: true
    })
  }
  
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

// Check styles after a delay
setTimeout(() => {
  console.log('[TRACE] Checking final styles...')
  const boxes = root.domNode.getElementsByTagName('box')
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i] as any
    console.log('[TRACE] Box element:', {
      tagName: box.tagName,
      style: box.style,
      hasTerminalElement: !!box._terminalElement,
      terminalProps: box._terminalElement?.props
    })
  }
}, 500)