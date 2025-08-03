/**
 * Browser Globals for Terminal DOM
 * 
 * This utility sets up browser globals using our Terminal DOM implementation,
 * enabling Svelte 5 components to render to the terminal.
 */

import {
  document as terminalDocument,
  TerminalDocument,
  TerminalElement,
  TerminalText,
  TerminalComment,
  TerminalDocumentFragment,
  TerminalTemplateElement,
  createElement,
  createTextNode,
  createComment,
  createDocumentFragment
} from '../dom'

let isSetup = false

export interface BrowserGlobalsOptions {
  /** Whether to force override existing globals */
  forceOverride?: boolean
  /** Debug mode */
  debug?: boolean
}

/**
 * Sets up browser globals using Terminal DOM for Svelte 5 compatibility
 */
export function setupBrowserGlobals(options: BrowserGlobalsOptions = {}) {
  const { forceOverride = false, debug = false } = options

  // Only setup once unless forcing
  if (!forceOverride && isSetup) {
    return
  }

  // Create a mock window object with terminal-specific properties
  const globalWindow = {
    // Terminal-specific properties
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
    
    // Mock browser properties
    location: {
      href: 'terminal://app',
      protocol: 'terminal:',
      host: 'app',
      hostname: 'app',
      pathname: '/',
      search: '',
      hash: ''
    },
    
    // Navigation
    navigator: {
      userAgent: 'SvelTUI Terminal/1.0',
      platform: process.platform,
      language: 'en-US'
    },
    
    // Console
    console: console,
    
    // Timers (use Node's)
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    setImmediate: global.setImmediate,
    clearImmediate: global.clearImmediate,
    
    // RAF stub for terminal
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(Date.now()), 16) as any
    },
    cancelAnimationFrame: (id: number) => {
      clearTimeout(id)
    },
    
    // Storage stubs
    localStorage: createStorageStub(),
    sessionStorage: createStorageStub(),
    
    // Event handling
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    
    // Other browser APIs that Svelte might expect
    getComputedStyle: () => ({
      getPropertyValue: () => ''
    }),
    
    // Custom elements stub
    customElements: {
      define: () => {},
      get: () => undefined,
      whenDefined: () => Promise.resolve()
    }
  }

  // Set up globals
  const g = global as any
  
  // Window and document
  g.window = globalWindow
  g.document = terminalDocument
  
  // DOM constructors - use our Terminal implementations
  g.Document = TerminalDocument
  g.DocumentFragment = TerminalDocumentFragment
  g.Element = TerminalElement
  g.HTMLElement = TerminalElement
  g.HTMLDivElement = TerminalElement
  g.HTMLTemplateElement = TerminalTemplateElement
  g.Node = TerminalElement
  g.Text = TerminalText
  g.Comment = TerminalComment
  
  // Node constants
  g.Node.ELEMENT_NODE = 1
  g.Node.TEXT_NODE = 3
  g.Node.COMMENT_NODE = 8
  g.Node.DOCUMENT_NODE = 9
  g.Node.DOCUMENT_FRAGMENT_NODE = 11
  
  // Event constructors
  g.Event = class Event {
    type: string
    bubbles: boolean
    cancelable: boolean
    defaultPrevented = false
    
    constructor(type: string, init?: EventInit) {
      this.type = type
      this.bubbles = init?.bubbles || false
      this.cancelable = init?.cancelable || false
    }
    
    preventDefault() {
      this.defaultPrevented = true
    }
    
    stopPropagation() {}
    stopImmediatePropagation() {}
  }
  
  g.CustomEvent = class CustomEvent extends g.Event {
    detail: any
    
    constructor(type: string, init?: CustomEventInit) {
      super(type, init)
      this.detail = init?.detail
    }
  }
  
  g.KeyboardEvent = class KeyboardEvent extends g.Event {
    key: string
    code: string
    
    constructor(type: string, init?: any) {
      super(type, init)
      this.key = init?.key || ''
      this.code = init?.code || ''
    }
  }
  
  g.MouseEvent = class MouseEvent extends g.Event {
    clientX: number
    clientY: number
    
    constructor(type: string, init?: any) {
      super(type, init)
      this.clientX = init?.clientX || 0
      this.clientY = init?.clientY || 0
    }
  }
  
  // Other globals
  g.requestAnimationFrame = globalWindow.requestAnimationFrame
  g.cancelAnimationFrame = globalWindow.cancelAnimationFrame
  g.getComputedStyle = globalWindow.getComputedStyle
  g.customElements = globalWindow.customElements
  
  // Location and navigator
  g.location = globalWindow.location
  g.navigator = globalWindow.navigator
  
  // Storage
  g.localStorage = globalWindow.localStorage
  g.sessionStorage = globalWindow.sessionStorage
  
  // URL APIs
  g.URL = URL
  g.URLSearchParams = URLSearchParams
  
  // DOM parsing stubs
  g.DOMParser = class DOMParser {
    parseFromString(str: string, type: string) {
      const doc = new TerminalDocument()
      // Simple HTML to terminal DOM conversion
      if (str.includes('<')) {
        const div = doc.createElement('div')
        div.innerHTML = str
        return doc
      }
      return doc
    }
  }
  
  // Ranges and selections (stubs)
  g.Range = class Range {
    collapsed = true
    commonAncestorContainer = null
    startContainer = null
    endContainer = null
    startOffset = 0
    endOffset = 0
    
    setStart() {}
    setEnd() {}
    collapse() {}
    selectNode() {}
    selectNodeContents() {}
    cloneContents() { return new TerminalDocumentFragment(terminalDocument) }
    deleteContents() {}
    extractContents() { return new TerminalDocumentFragment(terminalDocument) }
    insertNode() {}
    surroundContents() {}
    compareBoundaryPoints() { return 0 }
    cloneRange() { return new Range() }
    detach() {}
  }
  
  g.Selection = class Selection {
    rangeCount = 0
    getRangeAt() { return new g.Range() }
    addRange() {}
    removeRange() {}
    removeAllRanges() {}
    collapse() {}
    extend() {}
    selectAllChildren() {}
    deleteFromDocument() {}
    toString() { return '' }
  }
  
  // TreeWalker stub
  g.TreeWalker = class TreeWalker {
    root: any
    currentNode: any
    
    constructor(root: any) {
      this.root = root
      this.currentNode = root
    }
    
    nextNode() { return null }
    previousNode() { return null }
    firstChild() { return null }
    lastChild() { return null }
    nextSibling() { return null }
    previousSibling() { return null }
    parentNode() { return null }
  }
  
  // Collections
  g.NodeList = Array
  g.HTMLCollection = Array
  g.NamedNodeMap = Map
  
  // Mutation Observer stub
  g.MutationObserver = class MutationObserver {
    constructor(callback: MutationCallback) {}
    observe() {}
    disconnect() {}
    takeRecords() { return [] }
  }
  
  // DOMRect stub
  g.DOMRect = class DOMRect {
    x = 0
    y = 0
    width = 0
    height = 0
    top = 0
    right = 0
    bottom = 0
    left = 0
    
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.top = y
      this.left = x
      this.right = x + width
      this.bottom = y + height
    }
  }
  
  // CSS stubs
  g.CSSStyleDeclaration = class CSSStyleDeclaration {
    cssText = ''
    length = 0
    
    getPropertyValue() { return '' }
    removeProperty() { return '' }
    setProperty() {}
    item() { return '' }
  }
  
  // Form stubs
  g.FormData = class FormData {
    append() {}
    delete() {}
    get() { return null }
    has() { return false }
    set() {}
    entries() { return [][Symbol.iterator]() }
  }
  
  // File stubs
  g.File = class File {
    name: string
    size = 0
    type = ''
    
    constructor(bits: any[], name: string) {
      this.name = name
    }
  }
  
  g.Blob = class Blob {
    size = 0
    type = ''
    
    constructor(parts?: any[], options?: any) {}
    slice() { return new Blob() }
  }
  
  // History stub
  g.History = class History {
    length = 1
    state = null
    
    back() {}
    forward() {}
    go() {}
    pushState() {}
    replaceState() {}
  }
  
  g.history = new g.History()
  
  // Important: Set up Node prototype getters that Svelte expects
  const nodeProto = TerminalElement.prototype
  g.first_child_getter = Object.getOwnPropertyDescriptor(nodeProto, 'firstChild')?.get
  g.next_sibling_getter = Object.getOwnPropertyDescriptor(nodeProto, 'nextSibling')?.get
  g.last_child_getter = Object.getOwnPropertyDescriptor(nodeProto, 'lastChild')?.get
  g.previous_sibling_getter = Object.getOwnPropertyDescriptor(nodeProto, 'previousSibling')?.get
  g.parent_node_getter = Object.getOwnPropertyDescriptor(nodeProto, 'parentNode')?.get
  
  isSetup = true
  
  if (debug) {
    console.log('[Browser Globals] Terminal DOM globals set up')
  }
}

/**
 * Creates a simple storage stub
 */
function createStorageStub() {
  const storage = new Map<string, string>()
  
  return {
    length: 0,
    clear() {
      storage.clear()
      this.length = 0
    },
    getItem(key: string) {
      return storage.get(key) || null
    },
    setItem(key: string, value: string) {
      storage.set(key, String(value))
      this.length = storage.size
    },
    removeItem(key: string) {
      storage.delete(key)
      this.length = storage.size
    },
    key(index: number) {
      return Array.from(storage.keys())[index] || null
    }
  }
}

/**
 * Checks if browser globals are set up
 */
export function isBrowserGlobalsSetup(): boolean {
  return isSetup
}

/**
 * Clears browser globals
 */
export function clearBrowserGlobals() {
  const g = global as any
  
  // List of all globals we set
  const globals = [
    'window', 'document', 'Document', 'DocumentFragment',
    'Element', 'HTMLElement', 'HTMLDivElement', 'HTMLTemplateElement',
    'Node', 'Text', 'Comment', 'Event', 'CustomEvent',
    'KeyboardEvent', 'MouseEvent', 'requestAnimationFrame',
    'cancelAnimationFrame', 'getComputedStyle', 'customElements',
    'location', 'navigator', 'localStorage', 'sessionStorage',
    'URL', 'URLSearchParams', 'DOMParser', 'Range', 'Selection',
    'TreeWalker', 'NodeList', 'HTMLCollection', 'NamedNodeMap',
    'MutationObserver', 'DOMRect', 'CSSStyleDeclaration',
    'FormData', 'File', 'Blob', 'History', 'history',
    'first_child_getter', 'next_sibling_getter', 'last_child_getter',
    'previous_sibling_getter', 'parent_node_getter'
  ]
  
  for (const key of globals) {
    delete g[key]
  }
  
  isSetup = false
}