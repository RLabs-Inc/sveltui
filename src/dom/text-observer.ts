/**
 * Text Observer
 * 
 * Monitors text node changes and updates parent text elements
 */

import type { TerminalTextNode, TerminalElementNode } from './nodes'
import { getReconciler } from '../reconciler'

/**
 * Sets up observation for text node changes
 */
export function observeTextNode(textNode: TerminalTextNode): void {
  // Override the textContent setter to detect changes
  const originalDescriptor = Object.getOwnPropertyDescriptor(textNode, 'nodeValue') || 
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textNode), 'nodeValue')
  
  if (originalDescriptor) {
    Object.defineProperty(textNode, 'nodeValue', {
      get: originalDescriptor.get,
      set(value: string | null) {
        // Call original setter
        if (originalDescriptor.set) {
          originalDescriptor.set.call(this, value)
        } else {
          this._nodeValue = value
        }
        
        // Notify parent text element if it exists
        if (this.parentNode && this.parentNode.nodeType === 1) {
          const parentElement = this.parentNode as TerminalElementNode
          if (parentElement._terminalElement && parentElement._terminalElement.type === 'text') {
            // Trigger update on the text element
            parentElement._terminalElement.update()
          }
        }
        
        // Force reconciler flush
        const reconciler = getReconciler()
        reconciler.forceFlush()
      },
      enumerable: true,
      configurable: true
    })
  }
}

/**
 * Sets up text observation for a DOM tree
 */
export function setupTextObservation(node: TerminalElementNode): void {
  // Process all child text nodes
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      observeTextNode(child as TerminalTextNode)
    } else if (child.nodeType === 1) {
      setupTextObservation(child as TerminalElementNode)
    }
  }
}