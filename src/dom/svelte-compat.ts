/**
 * Svelte 5 DOM Compatibility Layer
 * 
 * This module adds the missing DOM APIs that Svelte 5 expects
 * to our terminal DOM implementation.
 */

import { TerminalElement, TerminalText, TerminalNode } from './document'

/**
 * Enhance terminal DOM nodes with Svelte-required properties
 */
export function enhanceForSvelte(node: TerminalNode): void {
  // Add __attributes property that Svelte expects
  if (node.nodeType === 1) { // Element node
    Object.defineProperty(node, '__attributes', {
      value: {},
      writable: true,
      configurable: true
    })
  }
  
  // Ensure proper sibling chain
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i]
      
      // Set up sibling relationships
      child.previousSibling = i > 0 ? node.childNodes[i - 1] : null
      child.nextSibling = i < node.childNodes.length - 1 ? node.childNodes[i + 1] : null
      
      // Recursively enhance children
      enhanceForSvelte(child)
    }
  }
}

/**
 * Add Svelte-specific DOM methods
 */
export function addSvelteMethods(ElementPrototype: any): void {
  // Add contains method if missing
  if (!ElementPrototype.contains) {
    ElementPrototype.contains = function(node: any): boolean {
      if (node === this) return true
      let parent = node?.parentNode
      while (parent) {
        if (parent === this) return true
        parent = parent.parentNode
      }
      return false
    }
  }
  
  // Add matches method for selector matching
  if (!ElementPrototype.matches) {
    ElementPrototype.matches = function(selector: string): boolean {
      // Simple implementation for basic selectors
      if (selector.startsWith('.')) {
        const className = selector.slice(1)
        return this.classList?.contains(className) || false
      }
      if (selector.startsWith('#')) {
        const id = selector.slice(1)
        return this.id === id
      }
      // Tag name
      return this.tagName?.toLowerCase() === selector.toLowerCase()
    }
  }
}