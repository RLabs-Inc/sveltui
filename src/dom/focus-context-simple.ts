/**
 * Simple Focus Context for SvelTUI
 * 
 * A non-reactive version of focus context that can be used outside components.
 */

import type { TerminalElementNode } from './nodes'

export interface SimpleFocusContext {
  focusedElement: TerminalElementNode | null
  focusHistory: TerminalElementNode[]
  registeredElements: Set<TerminalElementNode>
  focusTrapContainer: TerminalElementNode | null
  
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
  getFocusableElements: () => TerminalElementNode[]
}

export class SimpleFocusContextImpl implements SimpleFocusContext {
  focusedElement: TerminalElementNode | null = null
  focusHistory: TerminalElementNode[] = []
  registeredElements = new Set<TerminalElementNode>()
  focusTrapContainer: TerminalElementNode | null = null
  
  private screen: any = null
  private keyHandler: any = null
  
  constructor() {
    // Will be initialized when first element is registered
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
    const elements = this.getFocusableElements()
    if (elements.length === 0) return
    
    const currentIndex = elements.indexOf(this.focusedElement!)
    let nextIndex = currentIndex + 1
    
    // Wrap around to beginning
    if (nextIndex >= elements.length) {
      nextIndex = 0
    }
    
    this.focus(elements[nextIndex])
  }
  
  focusPrevious() {
    const elements = this.getFocusableElements()
    if (elements.length === 0) return
    
    const currentIndex = elements.indexOf(this.focusedElement!)
    let prevIndex = currentIndex - 1
    
    // Wrap around to end
    if (prevIndex < 0) {
      prevIndex = elements.length - 1
    }
    
    this.focus(elements[prevIndex])
  }
  
  registerElement(element: TerminalElementNode) {
    this.registeredElements.add(element)
    
    // Initialize screen and keyboard handler on first registration
    if (!this.screen && element._terminalElement?.screen) {
      this.screen = element._terminalElement.screen
      this.setupKeyboardHandler()
    }
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
    const elements = this.getFocusableElements()
    if (elements.length > 0) {
      this.focus(elements[0])
    }
  }
  
  trapFocus(container: TerminalElementNode) {
    this.focusTrapContainer = container
    
    // Focus first element within trap
    const elements = this.getFocusableElements()
    if (elements.length > 0) {
      this.focus(elements[0])
    }
  }
  
  releaseFocusTrap() {
    this.focusTrapContainer = null
  }
  
  getFocusableElements(): TerminalElementNode[] {
    const elements: TerminalElementNode[] = []
    const container = this.focusTrapContainer
    
    for (const element of this.registeredElements) {
      // Check if element is focusable
      const focusable = element.getAttribute('focusable') !== false
      const disabled = element.getAttribute('disabled') === true
      const hidden = element.getAttribute('hidden') === true
      
      if (!focusable || disabled || hidden) continue
      
      // If we have a focus trap, only include elements within it
      if (container && !this.isDescendantOf(element, container)) {
        continue
      }
      
      elements.push(element)
    }
    
    // Sort by tab index and position
    return this.sortByTabOrder(elements)
  }
  
  private isDescendantOf(element: TerminalElementNode, ancestor: TerminalElementNode): boolean {
    let current = element.parentNode
    while (current) {
      if (current === ancestor) return true
      current = current.parentNode
    }
    return false
  }
  
  private sortByTabOrder(elements: TerminalElementNode[]): TerminalElementNode[] {
    return elements.sort((a, b) => {
      const aTabIndex = parseInt(a.getAttribute('tabIndex') || '0', 10)
      const bTabIndex = parseInt(b.getAttribute('tabIndex') || '0', 10)
      
      // Elements with positive tabIndex come first
      if (aTabIndex > 0 && bTabIndex > 0) return aTabIndex - bTabIndex
      if (aTabIndex > 0) return -1
      if (bTabIndex > 0) return 1
      
      // Elements with tabIndex 0 maintain document order
      // This is simplified - in a real implementation we'd check actual DOM position
      return 0
    })
  }
  
  private setupKeyboardHandler() {
    if (!this.screen || this.keyHandler) return
    
    this.keyHandler = (ch: string, key: any) => {
      if (key.name === 'tab') {
        if (key.shift) {
          this.focusPrevious()
        } else {
          this.focusNext()
        }
      }
    }
    
    this.screen.on('keypress', this.keyHandler)
  }
  
  destroy() {
    if (this.screen && this.keyHandler) {
      this.screen.off('keypress', this.keyHandler)
    }
    this.registeredElements.clear()
    this.focusedElement = null
    this.focusHistory = []
    this.focusTrapContainer = null
  }
}

// Global instance
let globalFocusContext: SimpleFocusContext | null = null

export function getGlobalFocusContext(): SimpleFocusContext {
  if (!globalFocusContext) {
    globalFocusContext = new SimpleFocusContextImpl()
  }
  return globalFocusContext
}

export function destroyGlobalFocusContext() {
  if (globalFocusContext && 'destroy' in globalFocusContext) {
    (globalFocusContext as SimpleFocusContextImpl).destroy()
  }
  globalFocusContext = null
}