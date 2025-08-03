/**
 * Focus Management Utilities for SvelTUI
 * 
 * Provides utility functions for focus management including
 * auto-discovery, tab order calculation, and focus styling.
 */

import type { TerminalElementNode, TerminalNode } from './nodes'
import { NodeType } from './nodes'

export interface FocusableElementInfo {
  element: TerminalElementNode
  tabIndex: number
  bounds: {
    left: number
    top: number
    width: number
    height: number
  }
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: TerminalElementNode): boolean {
  // Check if explicitly marked as non-focusable
  if (element.getAttribute('focusable') === false) return false
  
  // Check if disabled or hidden
  if (element.getAttribute('disabled') === true) return false
  if (element.getAttribute('hidden') === true) return false
  
  // Check tag name for naturally focusable elements
  const tagName = element.tagName.toLowerCase()
  const naturallyFocusable = ['input', 'button', 'checkbox', 'list', 'textinput', 'textarea']
  
  if (naturallyFocusable.includes(tagName)) {
    return true
  }
  
  // Check if has tabIndex
  const tabIndex = element.getAttribute('tabIndex')
  if (tabIndex !== null && tabIndex !== undefined) {
    return true
  }
  
  // Check if has click handler (makes it focusable)
  if (element.getAttribute('onclick') || element.getAttribute('onKeyPress')) {
    return true
  }
  
  return false
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: TerminalNode): TerminalElementNode[] {
  const focusableElements: TerminalElementNode[] = []
  
  function traverse(node: TerminalNode) {
    if (node.nodeType === NodeType.ELEMENT) {
      const element = node as TerminalElementNode
      
      if (isFocusable(element)) {
        focusableElements.push(element)
      }
      
      // Don't traverse into elements that trap focus
      if (element.getAttribute('data-focus-trap') === true) {
        return
      }
    }
    
    // Traverse children
    for (const child of node.childNodes) {
      traverse(child)
    }
  }
  
  traverse(container)
  return focusableElements
}

/**
 * Calculate tab order based on element positions and tabIndex
 */
export function calculateTabOrder(elements: TerminalElementNode[]): TerminalElementNode[] {
  const elementsWithInfo: FocusableElementInfo[] = elements.map(element => {
    const terminalElement = element._terminalElement
    const bounds = terminalElement ? {
      left: (terminalElement as any).left || 0,
      top: (terminalElement as any).top || 0,
      width: (terminalElement as any).width || 0,
      height: (terminalElement as any).height || 0
    } : { left: 0, top: 0, width: 0, height: 0 }
    
    const tabIndex = element.getAttribute('tabIndex') ?? 0
    const tabIndexNum = typeof tabIndex === 'number' ? tabIndex : parseInt(tabIndex, 10) || 0
    
    return {
      element,
      tabIndex: tabIndexNum,
      bounds
    }
  })
  
  // Separate elements by tabIndex categories
  const positiveTabIndex = elementsWithInfo.filter(el => el.tabIndex > 0)
  const zeroTabIndex = elementsWithInfo.filter(el => el.tabIndex === 0)
  const negativeTabIndex = elementsWithInfo.filter(el => el.tabIndex < 0)
  
  // Sort positive tabIndex by value
  positiveTabIndex.sort((a, b) => a.tabIndex - b.tabIndex)
  
  // Sort zero tabIndex by document position (top to bottom, left to right)
  zeroTabIndex.sort((a, b) => {
    // Compare by top position first
    if (a.bounds.top !== b.bounds.top) {
      return a.bounds.top - b.bounds.top
    }
    // Then by left position
    return a.bounds.left - b.bounds.left
  })
  
  // Combine in tab order (positive first, then zero, negative excluded)
  const inTabOrder = [...positiveTabIndex, ...zeroTabIndex]
  
  return inTabOrder.map(info => info.element)
}

/**
 * Find the next focusable element in tab order
 */
export function getNextFocusable(
  current: TerminalElementNode,
  container: TerminalNode,
  wrap: boolean = true
): TerminalElementNode | null {
  const focusableElements = getFocusableElements(container)
  const orderedElements = calculateTabOrder(focusableElements)
  
  const currentIndex = orderedElements.indexOf(current)
  if (currentIndex === -1) {
    // Current element not in tab order, return first
    return orderedElements[0] || null
  }
  
  const nextIndex = currentIndex + 1
  if (nextIndex < orderedElements.length) {
    return orderedElements[nextIndex]
  }
  
  // Wrap to beginning if enabled
  return wrap ? orderedElements[0] || null : null
}

/**
 * Find the previous focusable element in tab order
 */
export function getPreviousFocusable(
  current: TerminalElementNode,
  container: TerminalNode,
  wrap: boolean = true
): TerminalElementNode | null {
  const focusableElements = getFocusableElements(container)
  const orderedElements = calculateTabOrder(focusableElements)
  
  const currentIndex = orderedElements.indexOf(current)
  if (currentIndex === -1) {
    // Current element not in tab order, return last
    return orderedElements[orderedElements.length - 1] || null
  }
  
  const prevIndex = currentIndex - 1
  if (prevIndex >= 0) {
    return orderedElements[prevIndex]
  }
  
  // Wrap to end if enabled
  return wrap ? orderedElements[orderedElements.length - 1] || null : null
}

/**
 * Apply focus ring styling to an element
 */
export function applyFocusRing(element: TerminalElementNode, focused: boolean) {
  const terminalElement = element._terminalElement
  if (!terminalElement) return
  
  if (focused) {
    // Store original style
    const originalStyle = (terminalElement as any).style || {}
    element.setAttribute('data-original-style', JSON.stringify(originalStyle))
    
    // Apply focus ring style
    ;(terminalElement as any).style = {
      ...originalStyle,
      border: {
        type: 'line',
        fg: 'cyan'
      }
    }
    
    // Force render
    if ('render' in terminalElement) {
      ;(terminalElement as any).render()
    }
  } else {
    // Restore original style
    const originalStyleStr = element.getAttribute('data-original-style')
    if (originalStyleStr) {
      try {
        const originalStyle = JSON.parse(originalStyleStr)
        ;(terminalElement as any).style = originalStyle
        element.removeAttribute('data-original-style')
        
        // Force render
        if ('render' in terminalElement) {
          ;(terminalElement as any).render()
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
}

/**
 * Create a focus indicator element
 */
export function createFocusIndicator(
  screen: any,
  position: { left: number; top: number; width: number; height: number }
) {
  const blessed = require('blessed')
  
  const indicator = blessed.box({
    screen,
    left: position.left - 1,
    top: position.top - 1,
    width: position.width + 2,
    height: position.height + 2,
    border: {
      type: 'line',
      fg: 'cyan'
    },
    style: {
      border: {
        fg: 'cyan'
      },
      transparent: true
    },
    tags: true,
    content: ''
  })
  
  // Place indicator behind the focused element
  indicator.setBack()
  
  return indicator
}

/**
 * Keyboard shortcut handlers for focus navigation
 */
export interface KeyboardShortcuts {
  next?: string[]      // e.g., ['tab', 'right']
  previous?: string[]  // e.g., ['shift-tab', 'left']
  first?: string[]     // e.g., ['home']
  last?: string[]      // e.g., ['end']
  escape?: string[]    // e.g., ['escape', 'q']
}

/**
 * Default keyboard shortcuts
 */
export const defaultKeyboardShortcuts: KeyboardShortcuts = {
  next: ['tab'],
  previous: ['shift-tab'],
  first: ['home'],
  last: ['end'],
  escape: ['escape']
}

/**
 * Set up keyboard handlers for focus navigation
 */
export function setupKeyboardNavigation(
  screen: any,
  callbacks: {
    onNext?: () => void
    onPrevious?: () => void
    onFirst?: () => void
    onLast?: () => void
    onEscape?: () => void
  },
  shortcuts: KeyboardShortcuts = defaultKeyboardShortcuts
) {
  const handleKey = (ch: string, key: any) => {
    const keyName = key.shift && key.name ? `shift-${key.name}` : key.name
    
    if (shortcuts.next?.includes(keyName) && callbacks.onNext) {
      callbacks.onNext()
    } else if (shortcuts.previous?.includes(keyName) && callbacks.onPrevious) {
      callbacks.onPrevious()
    } else if (shortcuts.first?.includes(keyName) && callbacks.onFirst) {
      callbacks.onFirst()
    } else if (shortcuts.last?.includes(keyName) && callbacks.onLast) {
      callbacks.onLast()
    } else if (shortcuts.escape?.includes(keyName) && callbacks.onEscape) {
      callbacks.onEscape()
    }
  }
  
  screen.on('keypress', handleKey)
  
  // Return cleanup function
  return () => {
    screen.off('keypress', handleKey)
  }
}

/**
 * Focus trap utilities
 */
export function createFocusTrap(container: TerminalElementNode) {
  container.setAttribute('data-focus-trap', true)
  
  // Get all focusable elements within the trap
  const focusableElements = getFocusableElements(container)
  if (focusableElements.length === 0) return null
  
  const orderedElements = calculateTabOrder(focusableElements)
  const firstElement = orderedElements[0]
  const lastElement = orderedElements[orderedElements.length - 1]
  
  return {
    firstElement,
    lastElement,
    elements: orderedElements,
    
    // Focus the first element in the trap
    activate() {
      if (firstElement) {
        const focusEvent = new Event('focus')
        firstElement.dispatchEvent?.(focusEvent)
      }
    },
    
    // Release the focus trap
    deactivate() {
      container.removeAttribute('data-focus-trap')
    }
  }
}