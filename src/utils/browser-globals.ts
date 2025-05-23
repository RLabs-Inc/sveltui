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
import { enhanceForSvelte, addSvelteMethods } from '../dom/svelte-compat'

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


  // Mock Element class for DOM operations
  class MockElement {
    constructor() {
      this._innerHTML = ''
      this._firstChild = null
      this._lastChild = null
      this._nextSibling = null
      this._previousSibling = null
      this._parentNode = null
      this._childNodes = []
      this._nodeType = 1
      this._nodeName = 'DIV'
      this._nodeValue = null
      this._textContent = ''
    }
    
    appendChild(child) { 
      if (!child) return child
      
      this._childNodes.push(child)
      child._parentNode = this
      child._nextSibling = null
      
      if (this._lastChild) {
        child._previousSibling = this._lastChild
        this._lastChild._nextSibling = child
      } else {
        child._previousSibling = null
        this._firstChild = child
      }
      
      this._lastChild = child
      return child
    }
    
    removeChild(child) {
      if (!child) return child
      
      const index = this._childNodes.indexOf(child)
      if (index >= 0) {
        this._childNodes.splice(index, 1)
        
        if (child._previousSibling) {
          child._previousSibling._nextSibling = child._nextSibling
        } else {
          this._firstChild = child._nextSibling
        }
        
        if (child._nextSibling) {
          child._nextSibling._previousSibling = child._previousSibling
        } else {
          this._lastChild = child._previousSibling
        }
        
        child._parentNode = null
        child._nextSibling = null
        child._previousSibling = null
      }
      return child
    }
    
    insertBefore(newNode, refNode) {
      if (!refNode) return this.appendChild(newNode)
      if (!newNode) return newNode
      
      const index = this._childNodes.indexOf(refNode)
      if (index === -1) return newNode
      
      this._childNodes.splice(index, 0, newNode)
      
      newNode._parentNode = this
      newNode._nextSibling = refNode
      newNode._previousSibling = refNode._previousSibling
      
      if (refNode._previousSibling) {
        refNode._previousSibling._nextSibling = newNode
      } else {
        this._firstChild = newNode
      }
      
      refNode._previousSibling = newNode
      
      return newNode
    }
    
    replaceChild(newChild, oldChild) {
      if (!newChild || !oldChild) return oldChild
      
      const index = this._childNodes.indexOf(oldChild)
      if (index === -1) return oldChild
      
      this._childNodes[index] = newChild
      
      newChild._parentNode = this
      newChild._nextSibling = oldChild._nextSibling
      newChild._previousSibling = oldChild._previousSibling
      
      if (oldChild._previousSibling) {
        oldChild._previousSibling._nextSibling = newChild
      } else {
        this._firstChild = newChild
      }
      
      if (oldChild._nextSibling) {
        oldChild._nextSibling._previousSibling = newChild
      } else {
        this._lastChild = newChild
      }
      
      oldChild._parentNode = null
      oldChild._nextSibling = null
      oldChild._previousSibling = null
      
      return oldChild
    }
    
    addEventListener() {}
    removeEventListener() {}
    setAttribute() {}
    getAttribute() { return null }
    removeAttribute() {}
    hasAttribute() { return false }
    contains() { return false }
    querySelector() { return this._firstChild }
    querySelectorAll() { return this._childNodes }
    
    cloneNode(deep = false) { 
      const clone = new MockElement()
      clone._nodeName = this._nodeName
      clone._nodeType = this._nodeType
      clone._nodeValue = this._nodeValue
      clone._textContent = this._textContent
      
      if (deep && this._childNodes) {
        for (const child of this._childNodes) {
          if (child && typeof child.cloneNode === 'function') {
            clone.appendChild(child.cloneNode(true))
          }
        }
      }
      return clone
    }
    
    remove() { 
      if (this._parentNode) {
        this._parentNode.removeChild(this)
      }
    }
    
    // DOM Level 4 methods
    before(...nodes) {
      if (!this._parentNode) return
      
      for (const node of nodes) {
        const nodeToInsert = typeof node === 'string' 
          ? customDocument.createTextNode(node)
          : node
        this._parentNode.insertBefore(nodeToInsert, this)
      }
    }
    
    after(...nodes) {
      if (!this._parentNode) return
      
      let ref = this._nextSibling
      for (const node of nodes) {
        const nodeToInsert = typeof node === 'string'
          ? customDocument.createTextNode(node)
          : node
        this._parentNode.insertBefore(nodeToInsert, ref)
      }
    }
    
    get innerHTML() {
      return this._innerHTML || ''
    }
    
    set innerHTML(value) {
      this._innerHTML = value
      // Clear existing children
      this._childNodes = []
      this._firstChild = null
      this._lastChild = null
      
      // Create basic DOM structure from HTML
      if (value && value.trim()) {
        const trimmed = value.trim()
        if (trimmed.startsWith('<')) {
          // Create a basic element
          const tagMatch = trimmed.match(/<(\w+)/)
          if (tagMatch) {
            const element = customDocument.createElement(tagMatch[1])
            this.appendChild(element)
          }
        } else if (trimmed) {
          // Plain text
          const textNode = customDocument.createTextNode(trimmed)
          this.appendChild(textNode)
        }
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

  // Enhanced DocumentFragment with append method
  class MockDocumentFragment extends MockElement {
    constructor() {
      super()
      this._nodeType = 11
      this._nodeName = '#document-fragment'
    }
    
    append(...nodes) {
      for (const node of nodes) {
        if (typeof node === 'string') {
          this.appendChild(customDocument.createTextNode(node))
        } else if (node) {
          this.appendChild(node)
        }
      }
    }
  }

  // Template element implementation with content property
  class MockTemplateElement extends MockElement {
    constructor() {
      super()
      this._nodeName = 'TEMPLATE'
      this.content = new MockDocumentFragment()
    }
    
    appendChild(child) {
      return this.content.appendChild(child)
    }
    
    cloneNode(deep = false) {
      const clone = new MockTemplateElement()
      if (deep && this.content) {
        clone.content = this.content.cloneNode(true)
      }
      return clone
    }
    
    get innerHTML() {
      return this._innerHTML || ''
    }
    
    set innerHTML(value) {
      this._innerHTML = value
      // Clear existing content
      this.content = new MockDocumentFragment()
      
      if (!value) {
        return
      }

      // Debug log to see what HTML Svelte is passing
      if (globalThis.SVELTUI_DEBUG) {
        console.log('[MockTemplate] innerHTML set to:', value)
      }
      
      // Use the createContextualFragment approach which handles HTML parsing better
      const range = customDocument.createRange()
      const fragment = range.createContextualFragment(value)
      
      // Move all nodes from the fragment to the template content
      while (fragment.firstChild) {
        this.content.appendChild(fragment.firstChild)
      }
      
      // Debug log the resulting structure
      if (globalThis.SVELTUI_DEBUG) {
        console.log('[MockTemplate] content children:', this.content.childNodes.length)
        console.log('[MockTemplate] first child:', this.content.firstChild?.nodeName)
      }
    }
  }

  // Mock Text node class
  class MockText extends MockElement {
    constructor(text = '') {
      super()
      this._nodeType = 3
      this._nodeName = '#text'
      this._nodeValue = text
      this._textContent = text
      this._childNodes = [] // Text nodes need this initialized even though they can't have children
    }
    
    cloneNode(deep = false) {
      return new MockText(this._nodeValue)
    }
    
    // Text nodes can't have children
    appendChild(child) {
      throw new Error('Cannot append child to text node')
    }
    
    // DOM Level 4 methods
    before(...nodes) {
      if (!this._parentNode) return
      
      for (const node of nodes) {
        const nodeToInsert = typeof node === 'string' 
          ? new MockText(node)
          : node
        this._parentNode.insertBefore(nodeToInsert, this)
      }
    }
    
    after(...nodes) {
      if (!this._parentNode) return
      
      let ref = this._nextSibling
      for (const node of nodes) {
        const nodeToInsert = typeof node === 'string'
          ? new MockText(node)
          : node
        this._parentNode.insertBefore(nodeToInsert, ref)
      }
    }
  }

  // Mock Comment node class  
  class MockComment extends MockElement {
    constructor(text = '') {
      super()
      this._nodeType = 8
      this._nodeName = '#comment'
      this._nodeValue = text
    }
    
    cloneNode(deep = false) {
      return new MockComment(this._nodeValue)
    }
  }

  // Enhance document with missing methods that Svelte expects
  if (!customDocument.importNode) {
    customDocument.importNode = function(node, deep = false) {
      // Ensure we never return null
      if (!node) {
        return customDocument.createTextNode('')
      }
      if (typeof node.cloneNode === 'function') {
        return node.cloneNode(deep)
      }
      return node
    }
  }
  
  if (!customDocument.createRange) {
    customDocument.createRange = function() {
      return {
        selectNodeContents: () => {},
        extractContents: () => customDocument.createDocumentFragment(),
        createContextualFragment: (html) => {
          // For HTML template parsing, return a DocumentFragment containing the parsed content
          const fragment = customDocument.createDocumentFragment()
          const trimmed = html.trim()
          
          if (trimmed.startsWith('<!>')) {
            // Svelte comment marker - add a comment to the fragment
            const comment = customDocument.createComment('')
            fragment.appendChild(comment)
          } else if (trimmed) {
            // For non-empty content, create appropriate node and add to fragment
            if (trimmed.startsWith('<')) {
              // Simple HTML parsing - create an element
              const tagMatch = trimmed.match(/<(\w+)/)
              const tagName = tagMatch ? tagMatch[1] : 'div'
              const element = customDocument.createElement(tagName)
              fragment.appendChild(element)
            } else {
              // Plain text
              const textNode = customDocument.createTextNode(trimmed)
              fragment.appendChild(textNode)
            }
          } else {
            // Empty content - add an empty text node
            const textNode = customDocument.createTextNode('')
            fragment.appendChild(textNode)
          }
          
          return fragment
        }
      }
    }
  }

  // Add missing DOM methods that Svelte's template engine expects
  if (!customDocument.createTreeWalker) {
    customDocument.createTreeWalker = function(root) {
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
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
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
  globalThis.DocumentFragment = MockDocumentFragment
  globalThis.HTMLTemplateElement = MockTemplateElement
  globalThis.Text = MockText
  globalThis.Comment = MockComment
  
  // Set up property descriptors on Node.prototype for Svelte
  // Svelte expects these to be getter/setter descriptors, not just properties
  // CRITICAL: These getters must handle both mock objects (with _prefix) and terminal DOM objects (without prefix)
  Object.defineProperty(MockElement.prototype, 'firstChild', {
    get: function() { 
      // Check if this is a mock object (has _firstChild) or terminal DOM object
      if (this && '_firstChild' in this) {
        return this._firstChild || null
      }
      // For terminal DOM objects, access the property directly from the instance
      if (this && Object.prototype.hasOwnProperty.call(this, 'firstChild')) {
        return this.firstChild || null
      }
      return null
    },
    configurable: true
  })
  Object.defineProperty(MockElement.prototype, 'nextSibling', {
    get: function() { 
      if (this && '_nextSibling' in this) {
        return this._nextSibling || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'nextSibling')) {
        return this.nextSibling || null
      }
      return null
    },
    configurable: true
  })
  Object.defineProperty(MockElement.prototype, 'lastChild', {
    get: function() { 
      if (this && '_lastChild' in this) {
        return this._lastChild || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'lastChild')) {
        return this.lastChild || null
      }
      return null
    },
    configurable: true
  })
  Object.defineProperty(MockElement.prototype, 'previousSibling', {
    get: function() { 
      if (this && '_previousSibling' in this) {
        return this._previousSibling || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'previousSibling')) {
        return this.previousSibling || null
      }
      return null
    },
    configurable: true
  })
  Object.defineProperty(MockElement.prototype, 'parentNode', {
    get: function() { 
      if (this && '_parentNode' in this) {
        return this._parentNode || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'parentNode')) {
        return this.parentNode || null
      }
      return null
    },
    configurable: true
  })
  
  // Also set on DocumentFragment prototype
  Object.defineProperty(MockDocumentFragment.prototype, 'firstChild', {
    get: function() { 
      if (this && '_firstChild' in this) {
        return this._firstChild || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'firstChild')) {
        return this.firstChild || null
      }
      return null
    },
    configurable: true
  })
  Object.defineProperty(MockDocumentFragment.prototype, 'nextSibling', {
    get: function() { 
      if (this && '_nextSibling' in this) {
        return this._nextSibling || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'nextSibling')) {
        return this.nextSibling || null
      }
      return null
    },
    configurable: true
  })
  
  // And on Text prototype
  Object.defineProperty(MockText.prototype, 'firstChild', {
    get: function() { return null }, // Text nodes never have children
    configurable: true
  })
  Object.defineProperty(MockText.prototype, 'nextSibling', {
    get: function() { 
      if (this && '_nextSibling' in this) {
        return this._nextSibling || null
      }
      if (this && Object.prototype.hasOwnProperty.call(this, 'nextSibling')) {
        return this.nextSibling || null
      }
      return null
    },
    configurable: true
  })
  
  // IMPORTANT: Set up property descriptors on our terminal DOM prototypes
  // This is CRITICAL for Svelte's template system to work
  if (customDocument && customDocument.createElement) {
    // Get constructors from our terminal DOM
    const sampleElement = customDocument.createElement('div')
    const sampleText = customDocument.createTextNode('test')
    const sampleFragment = customDocument.createDocumentFragment()
    
    // Define property descriptors that Svelte expects
    // We need to define getters that access the actual field values
    const createNodeDescriptors = (fieldPrefix = '') => ({
      firstChild: {
        get: function() { 
          // Direct property access for terminal DOM nodes
          if ('firstChild' in this) {
            return this.firstChild
          }
          const value = this[fieldPrefix + 'firstChild']
          return value !== undefined ? value : null
        },
        configurable: true
      },
      nextSibling: {
        get: function() { 
          // Direct property access for terminal DOM nodes
          if ('nextSibling' in this) {
            return this.nextSibling
          }
          const value = this[fieldPrefix + 'nextSibling']
          return value !== undefined ? value : null
        },
        configurable: true
      },
      lastChild: {
        get: function() { 
          // Direct property access for terminal DOM nodes
          if ('lastChild' in this) {
            return this.lastChild
          }
          const value = this[fieldPrefix + 'lastChild']
          return value !== undefined ? value : null
        },
        configurable: true
      },
      previousSibling: {
        get: function() { 
          // Direct property access for terminal DOM nodes
          if ('previousSibling' in this) {
            return this.previousSibling
          }
          const value = this[fieldPrefix + 'previousSibling']
          return value !== undefined ? value : null
        },
        configurable: true
      },
      parentNode: {
        get: function() { 
          // Direct property access for terminal DOM nodes
          if ('parentNode' in this) {
            return this.parentNode
          }
          const value = this[fieldPrefix + 'parentNode']
          return value !== undefined ? value : null
        },
        configurable: true
      }
    })
    
    // Apply descriptors to TerminalElement prototype
    // Our terminal DOM uses fields without underscore prefix
    const nodeDescriptors = createNodeDescriptors('')
    
    if (sampleElement && sampleElement.constructor && sampleElement.constructor.prototype) {
      for (const [key, descriptor] of Object.entries(nodeDescriptors)) {
        // Only add if not already defined
        if (!Object.getOwnPropertyDescriptor(sampleElement.constructor.prototype, key)) {
          Object.defineProperty(sampleElement.constructor.prototype, key, descriptor)
        }
      }
    }
    
    // Apply descriptors to TerminalText prototype
    if (sampleText && sampleText.constructor && sampleText.constructor.prototype) {
      for (const [key, descriptor] of Object.entries(nodeDescriptors)) {
        // Only add if not already defined
        if (!Object.getOwnPropertyDescriptor(sampleText.constructor.prototype, key)) {
          Object.defineProperty(sampleText.constructor.prototype, key, descriptor)
        }
      }
    }
    
    // Apply descriptors to TerminalDocumentFragment prototype
    if (sampleFragment && sampleFragment.constructor && sampleFragment.constructor.prototype) {
      for (const [key, descriptor] of Object.entries(nodeDescriptors)) {
        // Only add if not already defined
        if (!Object.getOwnPropertyDescriptor(sampleFragment.constructor.prototype, key)) {
          Object.defineProperty(sampleFragment.constructor.prototype, key, descriptor)
        }
      }
    }
  }
  
  // CRITICAL FIX: Set up proper prototype chains for Svelte 5 compatibility
  // Svelte's set_attribute function walks up the prototype chain expecting:
  // Element -> Node -> EventTarget -> Object
  if (customDocument && customDocument.createElement) {
    // First ensure mock classes have proper chain
    // MockElement acts as both Node and Element, so it should inherit from EventTarget
    Object.setPrototypeOf(MockElement.prototype, EventTarget.prototype)
    Object.setPrototypeOf(MockText.prototype, MockElement.prototype)
    Object.setPrototypeOf(MockComment.prototype, MockElement.prototype)
    Object.setPrototypeOf(MockDocumentFragment.prototype, MockElement.prototype)
    Object.setPrototypeOf(MockTemplateElement.prototype, MockElement.prototype)
    
    // Get terminal DOM instances
    const sampleElement = customDocument.createElement('div')
    const sampleText = customDocument.createTextNode('test')
    const sampleFragment = customDocument.createDocumentFragment()
    const sampleTemplate = customDocument.createElement('template')
    
    // Fix terminal element prototypes to inherit from mock classes
    if (sampleElement && sampleElement.constructor && sampleElement.constructor.prototype) {
      // TerminalElement should inherit from MockElement
      const TerminalElementProto = sampleElement.constructor.prototype
      const originalProto = Object.getPrototypeOf(TerminalElementProto)
      
      // Only set if not already set to avoid circular references
      if (originalProto !== MockElement.prototype) {
        Object.setPrototypeOf(TerminalElementProto, MockElement.prototype)
      }
      
      // Add Svelte-specific methods
      addSvelteMethods(TerminalElementProto)
      
      // Add __attributes property to all elements
      Object.defineProperty(TerminalElementProto, '__attributes', {
        get: function() {
          if (!this._svelteAttributes) {
            this._svelteAttributes = {}
          }
          return this._svelteAttributes
        },
        set: function(value) {
          this._svelteAttributes = value
        },
        configurable: true
      })
    }
    
    if (sampleText && sampleText.constructor && sampleText.constructor.prototype) {
      // TerminalText should inherit from MockText  
      const TerminalTextProto = sampleText.constructor.prototype
      const originalProto = Object.getPrototypeOf(TerminalTextProto)
      
      if (originalProto !== MockText.prototype) {
        Object.setPrototypeOf(TerminalTextProto, MockText.prototype)
      }
    }
    
    if (sampleFragment && sampleFragment.constructor && sampleFragment.constructor.prototype) {
      // TerminalDocumentFragment should inherit from MockDocumentFragment
      const TerminalFragmentProto = sampleFragment.constructor.prototype  
      const originalProto = Object.getPrototypeOf(TerminalFragmentProto)
      
      if (originalProto !== MockDocumentFragment.prototype) {
        Object.setPrototypeOf(TerminalFragmentProto, MockDocumentFragment.prototype)
      }
    }
    
    if (sampleTemplate && sampleTemplate.constructor && sampleTemplate.constructor.prototype) {
      // TerminalTemplateElement should inherit from MockTemplateElement
      const TerminalTemplateProto = sampleTemplate.constructor.prototype
      const originalProto = Object.getPrototypeOf(TerminalTemplateProto)
      
      if (originalProto !== MockTemplateElement.prototype) {
        Object.setPrototypeOf(TerminalTemplateProto, MockTemplateElement.prototype)
      }
    }
  }
  
  // Add Svelte 5 runes for .svelte.ts files
  if (!globalThis.$state) {
    globalThis.$state = function(initial) {
      return { current: initial }
    }
  }
  
  if (!globalThis.$derived) {
    globalThis.$derived = {
      by: function(fn) {
        return fn()
      }
    }
  }
  
  if (!globalThis.$effect) {
    globalThis.$effect = function(fn) {
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