/**
 * Focus Context System for SvelTUI
 * 
 * Provides screen-wide focus management with reactive tracking using
 * Svelte 5's context API and reactivity system.
 */

import { getContext, setContext } from 'svelte'
import type { TerminalElementNode } from './nodes'

// Context key for focus system
const FOCUS_CONTEXT_KEY = Symbol('sveltui:focus')

export interface FocusableElement {
  element: TerminalElementNode
  tabIndex: number
  focusable: boolean
}

export interface FocusContext {
  // Reactive state
  focusedElement: TerminalElementNode | null
  focusHistory: TerminalElementNode[]
  
  // Derived state
  focusableElements: FocusableElement[]
  canFocusNext: boolean
  canFocusPrevious: boolean
  currentFocusIndex: number
  
  // Methods
  focus: (element: TerminalElementNode) => void
  blur: () => void
  focusNext: () => void
  focusPrevious: () => void
  registerElement: (element: TerminalElementNode) => void
  unregisterElement: (element: TerminalElementNode) => void
  restoreFocus: () => void
  pushFocusHistory: (element: TerminalElementNode) => void
  trapFocus: (container: TerminalElementNode) => void
  releaseFocusTrap: () => void
}

class FocusContextImpl implements FocusContext {
  // State management using $state
  focusedElement = $state<TerminalElementNode | null>(null)
  focusHistory = $state<TerminalElementNode[]>([])
  
  // Internal state
  private registeredElements = $state<Set<TerminalElementNode>>(new Set())
  private focusTrapContainer = $state<TerminalElementNode | null>(null)
  
  // Derived values using $derived
  focusableElements = $derived(() => {
    const elements: FocusableElement[] = []
    
    // Get the container to search within
    const container = this.focusTrapContainer || null
    
    // Convert Set to Array and filter based on container
    const elementsToCheck = Array.from(this.registeredElements)
    
    for (const element of elementsToCheck) {
      // Check if element is focusable
      const focusable = element.getAttribute('focusable') !== false
      const disabled = element.getAttribute('disabled') === true
      const hidden = element.getAttribute('hidden') === true
      
      if (!focusable || disabled || hidden) continue
      
      // If we have a focus trap, only include elements within it
      if (container && !this.isDescendantOf(element, container)) {
        continue
      }
      
      // Get tab index (default to 0 for focusable elements)
      const tabIndex = element.getAttribute('tabIndex') ?? 0
      
      elements.push({
        element,
        tabIndex: typeof tabIndex === 'number' ? tabIndex : parseInt(tabIndex, 10) || 0,
        focusable: true
      })
    }
    
    // Sort by tab index (positive values first, then 0, negative values excluded from tab order)
    return elements
      .filter(el => el.tabIndex >= 0)
      .sort((a, b) => {
        // Elements with tabIndex > 0 come first, sorted by value
        if (a.tabIndex > 0 && b.tabIndex > 0) return a.tabIndex - b.tabIndex
        if (a.tabIndex > 0) return -1
        if (b.tabIndex > 0) return 1
        
        // Elements with tabIndex 0 maintain document order
        return 0
      })
  })
  
  currentFocusIndex = $derived(() => {
    if (!this.focusedElement) return -1
    return this.focusableElements.findIndex(f => f.element === this.focusedElement)
  })
  
  canFocusNext = $derived(() => {
    return this.focusableElements.length > 0 && 
           this.currentFocusIndex < this.focusableElements.length - 1
  })
  
  canFocusPrevious = $derived(() => {
    return this.focusableElements.length > 0 && this.currentFocusIndex > 0
  })
  
  constructor() {
    // Set up keyboard handling in a side effect
    $effect(() => {
      const screen = this.getScreen()
      if (!screen) return
      
      // Handle tab navigation
      const handleTab = (ch: string, key: any) => {
        if (key.name === 'tab') {
          if (key.shift) {
            this.focusPrevious()
          } else {
            this.focusNext()
          }
        }
      }
      
      screen.on('keypress', handleTab)
      
      return () => {
        screen.off('keypress', handleTab)
      }
    })
  }
  
  focus(element: TerminalElementNode) {
    // Don't focus if element is not focusable
    if (!this.registeredElements.has(element)) return
    if (element.getAttribute('focusable') === false) return
    if (element.getAttribute('disabled') === true) return
    if (element.getAttribute('hidden') === true) return
    
    // Blur current element
    if (this.focusedElement && this.focusedElement !== element) {
      this.blur()
    }
    
    // Update focus state
    this.focusedElement = element
    
    // Apply focus to the terminal element
    const terminalElement = element._terminalElement
    if (terminalElement && 'focus' in terminalElement) {
      ;(terminalElement as any).focus()
    }
    
    // Trigger focus event
    const focusEvent = new Event('focus')
    element.dispatchEvent?.(focusEvent)
  }
  
  blur() {
    if (!this.focusedElement) return
    
    const element = this.focusedElement
    this.focusedElement = null
    
    // Remove focus from terminal element
    const terminalElement = element._terminalElement
    if (terminalElement && 'blur' in terminalElement) {
      ;(terminalElement as any).blur()
    }
    
    // Trigger blur event
    const blurEvent = new Event('blur')
    element.dispatchEvent?.(blurEvent)
  }
  
  focusNext() {
    const elements = this.focusableElements
    if (elements.length === 0) return
    
    let nextIndex = this.currentFocusIndex + 1
    
    // Wrap around to beginning
    if (nextIndex >= elements.length) {
      nextIndex = 0
    }
    
    this.focus(elements[nextIndex].element)
  }
  
  focusPrevious() {
    const elements = this.focusableElements
    if (elements.length === 0) return
    
    let prevIndex = this.currentFocusIndex - 1
    
    // Wrap around to end
    if (prevIndex < 0) {
      prevIndex = elements.length - 1
    }
    
    this.focus(elements[prevIndex].element)
  }
  
  registerElement(element: TerminalElementNode) {
    this.registeredElements.add(element)
  }
  
  unregisterElement(element: TerminalElementNode) {
    this.registeredElements.delete(element)
    
    // If this was the focused element, blur it
    if (this.focusedElement === element) {
      this.blur()
    }
    
    // Remove from focus history
    this.focusHistory = this.focusHistory.filter(el => el !== element)
  }
  
  pushFocusHistory(element: TerminalElementNode) {
    // Limit history size
    if (this.focusHistory.length >= 10) {
      this.focusHistory = this.focusHistory.slice(-9)
    }
    this.focusHistory.push(element)
  }
  
  restoreFocus() {
    // Find the last valid element in history
    while (this.focusHistory.length > 0) {
      const element = this.focusHistory.pop()!
      if (this.registeredElements.has(element) && 
          element.getAttribute('focusable') !== false &&
          element.getAttribute('disabled') !== true &&
          element.getAttribute('hidden') !== true) {
        this.focus(element)
        return
      }
    }
    
    // If no valid history, focus first available element
    if (this.focusableElements.length > 0) {
      this.focus(this.focusableElements[0].element)
    }
  }
  
  trapFocus(container: TerminalElementNode) {
    this.focusTrapContainer = container
    
    // Focus first element within trap
    const firstElement = this.focusableElements[0]
    if (firstElement) {
      this.focus(firstElement.element)
    }
  }
  
  releaseFocusTrap() {
    this.focusTrapContainer = null
  }
  
  private isDescendantOf(element: TerminalElementNode, ancestor: TerminalElementNode): boolean {
    let current = element.parentNode
    while (current) {
      if (current === ancestor) return true
      current = current.parentNode
    }
    return false
  }
  
  private getScreen(): any {
    // Get screen from global or first registered element
    if (this.registeredElements.size > 0) {
      const element = Array.from(this.registeredElements)[0]
      const terminalElement = element._terminalElement
      if (terminalElement && 'screen' in terminalElement) {
        return (terminalElement as any).screen
      }
    }
    return null
  }
}

/**
 * Create and set the focus context
 */
export function createFocusContext(): FocusContext {
  const context = new FocusContextImpl()
  setContext(FOCUS_CONTEXT_KEY, context)
  return context
}

/**
 * Get the current focus context
 */
export function getFocusContext(): FocusContext {
  const context = getContext<FocusContext>(FOCUS_CONTEXT_KEY)
  if (!context) {
    throw new Error('Focus context not found. Make sure to call createFocusContext() at the root of your app.')
  }
  return context
}

/**
 * Check if focus context exists
 */
export function hasFocusContext(): boolean {
  try {
    getContext(FOCUS_CONTEXT_KEY)
    return true
  } catch {
    return false
  }
}