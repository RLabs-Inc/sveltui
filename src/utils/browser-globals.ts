/**
 * Browser Globals Utility for Svelte 5 Client-Side in Node.js
 * 
 * This utility sets up mock browser globals that Svelte 5's client-side code expects,
 * enabling Svelte components to run in Node.js environments like terminal applications.
 * 
 * Usage:
 * ```ts
 * import { setupBrowserGlobals } from './utils/browser-globals'
 * 
 * // Set up globals before importing Svelte
 * setupBrowserGlobals()
 * 
 * // Now you can use Svelte client-side APIs
 * import { mount } from 'svelte'
 * ```
 */

import { document } from '../dom/document'

export interface BrowserGlobalsOptions {
  /** Custom document to use instead of the default terminal document */
  document?: any
  /** Custom window properties to merge */
  windowProps?: Record<string, any>
  /** Whether to override existing globals (default: false) */
  forceOverride?: boolean
}

/**
 * Sets up mock browser globals for Svelte 5 client-side compatibility in Node.js
 */
export function setupBrowserGlobals(options: BrowserGlobalsOptions = {}) {
  const {
    document: customDocument = document,
    windowProps = {},
    forceOverride = false
  } = options

  // Only setup if not already present (unless forcing override)
  if (!forceOverride && typeof globalThis.window !== 'undefined') {
    return
  }

  // Mock DOM Node properties that Svelte expects
  const mockNodeProperties = {
    firstChild: { get: function() { return null }, configurable: true },
    lastChild: { get: function() { return null }, configurable: true },
    nextSibling: { get: function() { return null }, configurable: true },
    previousSibling: { get: function() { return null }, configurable: true },
    parentNode: { get: function() { return null }, configurable: true },
    nodeType: { get: function() { return 1 }, configurable: true },
    nodeName: { get: function() { return 'DIV' }, configurable: true },
    nodeValue: { get: function() { return null }, set: function() {}, configurable: true },
    textContent: { get: function() { return '' }, set: function() {}, configurable: true },
    childNodes: { get: function() { return [] }, configurable: true }
  }

  // Mock Element class for DOM operations
  class MockElement {
    appendChild() {}
    removeChild() {}
    insertBefore() {}
    replaceChild() {}
    addEventListener() {}
    removeEventListener() {}
    setAttribute() {}
    getAttribute() { return null }
    removeAttribute() {}
    hasAttribute() { return false }
    contains() { return false }
    querySelector() { return null }
    querySelectorAll() { return [] }
    cloneNode() { return new MockElement() }
    remove() { 
      // DOM Level 4 remove method
      if (this.parentNode) {
        this.parentNode.removeChild(this)
      }
    }
    style = {}
    classList = {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => false
    }
  }
  
  // Add DOM properties to Element prototype
  Object.defineProperties(MockElement.prototype, mockNodeProperties)

  // Enhance document with missing methods that Svelte expects
  if (!customDocument.importNode) {
    customDocument.importNode = function(node: any, deep: boolean = false) {
      return node && typeof node.cloneNode === 'function' ? node.cloneNode(deep) : node
    }
  }
  
  if (!customDocument.createRange) {
    customDocument.createRange = function() {
      return {
        selectNodeContents: () => {},
        extractContents: () => customDocument.createDocumentFragment(),
        createContextualFragment: (html: string) => {
          // For HTML template parsing, create a proper document fragment
          const fragment = customDocument.createDocumentFragment()
          const trimmed = html.trim()
          
          if (trimmed.startsWith('<!>')) {
            // Svelte comment marker - return the comment directly
            return customDocument.createComment('')
          } else if (trimmed) {
            // For non-empty content, create appropriate node
            if (trimmed.startsWith('<')) {
              // Simple HTML parsing - create an element
              const tagMatch = trimmed.match(/<(\w+)/)
              const tagName = tagMatch ? tagMatch[1] : 'div'
              return customDocument.createElement(tagName)
            } else {
              // Plain text
              return customDocument.createTextNode(trimmed)
            }
          }
          
          // Return a comment node as fallback (never null)
          return customDocument.createComment('')
        }
      }
    }
  }

  // Add missing DOM methods that Svelte's template engine expects
  if (!customDocument.createTreeWalker) {
    customDocument.createTreeWalker = function(root: any) {
      return {
        nextNode: () => null,
        currentNode: root
      }
    }
  }

  // Create mock window object
  const mockWindow = {
    // Basic window properties that Svelte might need
    document: customDocument,
    location: {
      href: 'file://terminal',
      protocol: 'file:',
      host: 'terminal',
      hostname: 'terminal',
      port: '',
      pathname: '/terminal',
      search: '',
      hash: ''
    },
    navigator: {
      userAgent: 'SvelTUI/Terminal'
    },
    innerWidth: process.stdout.columns || 80,
    innerHeight: process.stdout.rows || 24,
    // Event handling stubs
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    // Request animation frame stub
    requestAnimationFrame: (callback: Function) => setTimeout(callback, 16),
    cancelAnimationFrame: (id: any) => clearTimeout(id),
    // Other common properties
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    // Merge custom window properties
    ...windowProps
  }
  
  // Set up global references
  globalThis.window = mockWindow as any
  globalThis.document = customDocument as any
  globalThis.navigator = mockWindow.navigator
  globalThis.location = mockWindow.location
  globalThis.Element = MockElement as any
  globalThis.HTMLElement = MockElement as any
  globalThis.Node = MockElement as any
  // Enhanced DocumentFragment with append method
  class MockDocumentFragment extends MockElement {
    append(...nodes: any[]) {
      for (const node of nodes) {
        if (typeof node === 'string') {
          this.appendChild(customDocument.createTextNode(node))
        } else if (node) {
          this.appendChild(node)
        }
      }
    }
    
    appendChild(child: any) {
      // DocumentFragment should accept children
      return child
    }
  }
  
  // Ensure append is on the prototype
  Object.defineProperty(MockDocumentFragment.prototype, 'append', {
    value: function(...nodes: any[]) {
      for (const node of nodes) {
        if (typeof node === 'string') {
          this.appendChild(customDocument.createTextNode(node))
        } else if (node) {
          this.appendChild(node)
        }
      }
    },
    writable: true,
    configurable: true
  })
  
  globalThis.DocumentFragment = MockDocumentFragment
  
  globalThis.Text = class MockText extends MockElement {}
  globalThis.Comment = class MockComment extends MockElement {}
  
  // Add Svelte 5 runes for .svelte.ts files
  if (!globalThis.$state) {
    globalThis.$state = function(initial: any) {
      return { current: initial }
    }
  }
  
  if (!globalThis.$derived) {
    globalThis.$derived = {
      by: function(fn: Function) {
        return fn()
      }
    }
  }
  
  if (!globalThis.$effect) {
    globalThis.$effect = function(fn: Function) {
      return fn()
    }
  }
}

/**
 * Checks if browser globals are already set up
 */
export function isBrowserGlobalsSetup(): boolean {
  return typeof globalThis.window !== 'undefined'
}

/**
 * Clears browser globals (useful for testing)
 */
export function clearBrowserGlobals() {
  delete (globalThis as any).window
  delete (globalThis as any).document
  delete (globalThis as any).navigator
  delete (globalThis as any).location
  delete (globalThis as any).Element
  delete (globalThis as any).HTMLElement
  delete (globalThis as any).Node
  delete (globalThis as any).DocumentFragment
  delete (globalThis as any).Text
  delete (globalThis as any).Comment
}

/**
 * Auto-setup: Sets up browser globals immediately when this module is imported
 * Only runs if globals are not already present
 */
setupBrowserGlobals()