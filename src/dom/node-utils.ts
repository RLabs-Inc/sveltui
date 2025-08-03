/**
 * Node utilities for handling different types of DOM nodes
 */

import type { TerminalNode } from './nodes'

/**
 * Safely sets a property on a node, handling readonly properties
 */
export function safeSetProperty(node: any, property: string, value: any): void {
  try {
    node[property] = value
  } catch (e) {
    // If property is readonly, check if it's configurable
    const descriptor = Object.getOwnPropertyDescriptor(node, property)
    
    if (descriptor && descriptor.configurable) {
      // Make it writable
      Object.defineProperty(node, property, {
        value,
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable
      })
    } else if (!descriptor) {
      // Property doesn't exist, create it
      Object.defineProperty(node, property, {
        value,
        writable: true,
        configurable: true,
        enumerable: true
      })
    } else {
      // Can't modify, this is a real error
      throw e
    }
  }
}

/**
 * Updates node relationships safely
 */
export function updateNodeRelationships(
  parent: TerminalNode,
  child: TerminalNode,
  previousSibling: TerminalNode | null = null,
  nextSibling: TerminalNode | null = null
): void {
  // Update child's parent
  safeSetProperty(child, 'parentNode', parent)
  
  // Update siblings
  safeSetProperty(child, 'previousSibling', previousSibling)
  safeSetProperty(child, 'nextSibling', nextSibling)
  
  // Update previous sibling's next pointer
  if (previousSibling) {
    safeSetProperty(previousSibling, 'nextSibling', child)
  }
  
  // Update next sibling's previous pointer
  if (nextSibling) {
    safeSetProperty(nextSibling, 'previousSibling', child)
  }
}

/**
 * Checks if a node is from our terminal DOM implementation
 */
export function isTerminalNode(node: any): boolean {
  return node && typeof node._instanceId === 'number'
}

/**
 * Ensures a node has the expected properties
 */
export function ensureNodeProperties(node: any): void {
  const requiredProperties = [
    'parentNode',
    'nextSibling', 
    'previousSibling',
    'firstChild',
    'lastChild',
    'childNodes'
  ]
  
  for (const prop of requiredProperties) {
    if (!(prop in node)) {
      Object.defineProperty(node, prop, {
        value: prop === 'childNodes' ? [] : null,
        writable: true,
        configurable: true,
        enumerable: true
      })
    }
  }
}