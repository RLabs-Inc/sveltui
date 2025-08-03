/**
 * Browser Globals Utility for Svelte 5 Client-Side in Node.js
 *
 * This utility sets up browser globals using Happy DOM,
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

import { Window } from 'happy-dom'
import { applyNodePatches } from '../dom/node-patch'

let happyWindow: Window | null = null

export interface BrowserGlobalsOptions {
  /** Custom window properties to merge */
  windowProps?: Record<string, any>
  /** Whether to override existing globals (default: false) */
  forceOverride?: boolean
}

/**
 * Sets up browser globals using Happy DOM for Svelte 5 client-side compatibility in Node.js
 */
export function setupBrowserGlobals(options: BrowserGlobalsOptions = {}) {
  const {
    windowProps = {},
    forceOverride = false,
  } = options

  // Only setup if not already present (unless forcing override)
  if (!forceOverride && (happyWindow || typeof globalThis.window !== 'undefined')) {
    return
  }
  
  // Create a Happy DOM window
  happyWindow = new Window({
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
    url: 'file://terminal',
    console: console,
    settings: {
      disableJavaScriptFileLoading: true,
      disableJavaScriptEvaluation: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableComputedStyleRendering: true,
      enableFileSystemHttpRequests: false,
      navigation: {
        disableMainFrameNavigation: true,
        disableChildFrameNavigation: true,
        disableChildPageNavigation: true,
        disableFallbackToSetURL: true
      }
    }
  })
  
  // Expose Happy DOM globals to Node.js global scope
  const globalAny = globalThis as any
  
  // Core DOM objects
  globalAny.window = happyWindow
  globalAny.document = happyWindow.document
  globalAny.navigator = happyWindow.navigator
  globalAny.location = happyWindow.location
  
  // All the DOM interfaces - Happy DOM provides all of lib.dom.d.ts
  globalAny.Element = happyWindow.Element
  globalAny.HTMLElement = happyWindow.HTMLElement
  globalAny.HTMLDivElement = happyWindow.HTMLDivElement
  globalAny.HTMLTemplateElement = happyWindow.HTMLTemplateElement
  globalAny.Node = happyWindow.Node
  globalAny.NodeList = happyWindow.NodeList
  globalAny.Text = happyWindow.Text
  globalAny.Comment = happyWindow.Comment
  globalAny.Document = happyWindow.Document
  globalAny.DocumentFragment = happyWindow.DocumentFragment
  globalAny.DOMParser = happyWindow.DOMParser
  globalAny.XMLSerializer = happyWindow.XMLSerializer
  globalAny.Event = happyWindow.Event
  globalAny.EventTarget = happyWindow.EventTarget
  globalAny.CustomEvent = happyWindow.CustomEvent
  globalAny.KeyboardEvent = happyWindow.KeyboardEvent
  globalAny.MouseEvent = happyWindow.MouseEvent
  globalAny.FocusEvent = happyWindow.FocusEvent || class FocusEvent extends happyWindow.Event {
    constructor(type: string, init?: EventInit) {
      super(type, init)
    }
  }
  globalAny.InputEvent = happyWindow.InputEvent || class InputEvent extends happyWindow.Event {
    data: string | null
    inputType: string
    constructor(type: string, init?: any) {
      super(type, init)
      this.data = init?.data || null
      this.inputType = init?.inputType || ''
    }
  }
  
  // Other useful browser APIs
  globalAny.requestAnimationFrame = happyWindow.requestAnimationFrame.bind(happyWindow)
  globalAny.cancelAnimationFrame = happyWindow.cancelAnimationFrame.bind(happyWindow)
  
  // CSS and styling
  globalAny.CSSStyleDeclaration = happyWindow.CSSStyleDeclaration
  globalAny.CSSStyleSheet = happyWindow.CSSStyleSheet
  globalAny.getComputedStyle = happyWindow.getComputedStyle.bind(happyWindow)
  
  // Storage APIs
  globalAny.Storage = happyWindow.Storage
  globalAny.localStorage = happyWindow.localStorage
  globalAny.sessionStorage = happyWindow.sessionStorage
  
  // Other DOM types
  globalAny.Range = happyWindow.Range
  globalAny.Selection = happyWindow.Selection
  globalAny.TreeWalker = happyWindow.TreeWalker
  globalAny.NodeIterator = happyWindow.NodeIterator
  globalAny.HTMLCollection = happyWindow.HTMLCollection
  globalAny.DOMRect = happyWindow.DOMRect
  globalAny.DOMRectReadOnly = happyWindow.DOMRectReadOnly
  globalAny.DOMTokenList = happyWindow.DOMTokenList
  globalAny.NamedNodeMap = happyWindow.NamedNodeMap
  globalAny.Attr = happyWindow.Attr
  
  // Form elements
  globalAny.HTMLFormElement = happyWindow.HTMLFormElement
  globalAny.HTMLInputElement = happyWindow.HTMLInputElement
  globalAny.HTMLTextAreaElement = happyWindow.HTMLTextAreaElement
  globalAny.HTMLSelectElement = happyWindow.HTMLSelectElement
  globalAny.HTMLOptionElement = happyWindow.HTMLOptionElement
  globalAny.HTMLButtonElement = happyWindow.HTMLButtonElement
  
  // Other HTML elements
  globalAny.HTMLAnchorElement = happyWindow.HTMLAnchorElement
  globalAny.HTMLImageElement = happyWindow.HTMLImageElement
  globalAny.HTMLScriptElement = happyWindow.HTMLScriptElement
  globalAny.HTMLStyleElement = happyWindow.HTMLStyleElement
  globalAny.HTMLLinkElement = happyWindow.HTMLLinkElement
  globalAny.HTMLMetaElement = happyWindow.HTMLMetaElement
  
  // Web Components
  globalAny.customElements = happyWindow.customElements
  globalAny.CustomElementRegistry = happyWindow.CustomElementRegistry
  globalAny.ShadowRoot = happyWindow.ShadowRoot
  
  // URL
  globalAny.URL = happyWindow.URL
  globalAny.URLSearchParams = happyWindow.URLSearchParams
  
  // Web APIs
  globalAny.FormData = happyWindow.FormData
  globalAny.File = happyWindow.File
  globalAny.FileList = happyWindow.FileList
  globalAny.Blob = happyWindow.Blob
  
  // History
  globalAny.History = happyWindow.History
  globalAny.history = happyWindow.history
  
  // Observer APIs
  globalAny.MutationObserver = happyWindow.MutationObserver
  globalAny.MutationRecord = happyWindow.MutationRecord
  
  // Merge custom window properties
  Object.assign(globalAny.window, windowProps)
  
  // Apply node patches for Svelte 5 compatibility
  applyNodePatches(globalAny.Element, globalAny.Document)
  
  // IMPORTANT: Set up getters that Svelte expects
  // Svelte's internal DOM operations use these
  const nodePrototype = happyWindow.Node.prototype
  globalAny.first_child_getter = Object.getOwnPropertyDescriptor(nodePrototype, 'firstChild')?.get
  globalAny.next_sibling_getter = Object.getOwnPropertyDescriptor(nodePrototype, 'nextSibling')?.get
  globalAny.last_child_getter = Object.getOwnPropertyDescriptor(nodePrototype, 'lastChild')?.get
  globalAny.previous_sibling_getter = Object.getOwnPropertyDescriptor(nodePrototype, 'previousSibling')?.get
  globalAny.parent_node_getter = Object.getOwnPropertyDescriptor(nodePrototype, 'parentNode')?.get
  
  // Add Svelte 5 runes for .svelte.ts files
  if (!globalAny.$state) {
    globalAny.$state = function (initial: any) {
      return { current: initial }
    }
  }
  
  if (!globalAny.$derived) {
    globalAny.$derived = {
      by: function (fn: () => any) {
        return fn()
      },
    }
  }
  
  if (!globalAny.$effect) {
    globalAny.$effect = function (fn: () => void | (() => void)) {
      return fn()
    }
  }
}

/**
 * Checks if browser globals are already set up
 */
export function isBrowserGlobalsSetup(): boolean {
  return happyWindow !== null || typeof globalThis.window !== 'undefined'
}

/**
 * Clears browser globals (useful for testing)
 */
export function clearBrowserGlobals() {
  if (happyWindow) {
    happyWindow.happyDOM.cancelAsync()
    happyWindow = null
  }
  
  // Clear all the globals we set
  const globalAny = globalThis as any
  const propsToDelete = [
    'window', 'document', 'navigator', 'location', 
    'Element', 'HTMLElement', 'Node', 'Text', 'Comment',
    'Document', 'DocumentFragment', 'Event', 'EventTarget',
    'CustomEvent', 'requestAnimationFrame', 'cancelAnimationFrame',
    'CSSStyleDeclaration', 'Storage', 'localStorage', 'sessionStorage',
    'Range', 'Selection', 'TreeWalker', 'NodeIterator',
    'HTMLCollection', 'DOMRect', 'DOMTokenList', 'NamedNodeMap',
    'Attr', 'URL', 'URLSearchParams', 'FormData', 'File',
    'FileList', 'Blob', 'History', 'history', 'MutationObserver',
    'customElements', 'CustomElementRegistry', 'ShadowRoot'
  ]
  
  for (const prop of propsToDelete) {
    delete globalAny[prop]
  }
}

/**
 * Auto-setup: Sets up browser globals immediately when this module is imported
 * Only runs if globals are not already present
 */
setupBrowserGlobals()