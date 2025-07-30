/**
 * Bridge between Happy DOM and Terminal DOM
 *
 * This module provides functions to convert Happy DOM elements
 * to our terminal representation and handle events
 */

import { createElement } from '../dom/factories'
import type { TerminalElement } from '../dom/elements'
import type { Widgets } from 'blessed'
import {
  syncTextContent,
  createTextAwareMutationObserver,
  clearTextContent,
} from './text-sync-fix'

// Map to track DOM element to terminal element relationships
const domToTerminalMap = new WeakMap<Element, TerminalElement>()

// Map to track terminal element to DOM element relationships (reverse mapping)
const terminalToDomMap = new WeakMap<TerminalElement, Element>()

// Map to track which elements have focus - using Set instead of WeakSet for .clear() method
const focusedElements = new Set<Element>()

// Track the currently focused terminal element
let currentlyFocusedTerminal: TerminalElement | null = null

// Global screen reference for keyboard handling
let globalScreen: Widgets.Screen | null = null

/**
 * Converts a Happy DOM node to terminal elements
 */
export function happyDomToTerminal(
  happyNode: Node,
  parent?: TerminalElement
): TerminalElement | null {
  if (happyNode.nodeType === Node.ELEMENT_NODE) {
    const element = happyNode as Element
    const tagName = element.tagName.toLowerCase()

    // console.log(`[Bridge] Converting element: ${tagName}`)

    // Skip HTML/HEAD/BODY wrapper elements
    if (tagName === 'html' || tagName === 'head' || tagName === 'body') {
      // Process children directly
      for (const child of element.childNodes) {
        happyDomToTerminal(child, parent)
      }
      return null
    }

    // Extract props from attributes
    const props: Record<string, any> = {}
    for (const attr of element.attributes) {
      // Convert attribute names (e.g., class -> className)
      const propName = attr.name === 'class' ? 'className' : attr.name
      let value: any = attr.value

      // Convert numeric attributes to numbers
      if (
        ['width', 'height', 'top', 'left', 'right', 'bottom'].includes(propName)
      ) {
        // Try to parse as number, keep as string if it fails or if it's a special value like 'center'
        const numValue = parseInt(value, 10)
        if (!isNaN(numValue) && numValue.toString() === value) {
          value = numValue
        }
      }

      props[propName] = value
    }

    // Handle special attributes
    if (element.hasAttribute('style')) {
      // Parse inline styles if needed
      const styleAttr = element.getAttribute('style')
      if (styleAttr) {
        props.style = parseInlineStyle(styleAttr)
      }
    }

    // Create terminal element
    const terminalElement = createElement(tagName, props)
    // console.log(`[Bridge] Created terminal element: ${tagName}, props:`, props)

    // Store the bidirectional mapping
    domToTerminalMap.set(element, terminalElement)
    terminalToDomMap.set(terminalElement, element)

    // Add to parent if provided
    if (parent) {
      // console.log(`[Bridge] Parent provided for ${tagName}, parent.blessed:`, !!parent.blessed)
      parent.appendChild(terminalElement)
      if (parent.blessed && !terminalElement.blessed) {
        terminalElement.create(parent.blessed)
        // console.log(`[Bridge] Created blessed element for ${tagName}`)
        // Make sure the element is visible
        if (terminalElement.blessed) {
          terminalElement.blessed.show()
          // console.log(`[Bridge] Showed blessed element for ${tagName}`)
        }
      } else {
        // console.log(`[Bridge] Skipped blessed creation - parent.blessed: ${!!parent.blessed}, terminalElement.blessed: ${!!terminalElement.blessed}`)
      }
    } else {
      // console.log(`[Bridge] No parent provided for ${tagName}`)
    }

    // Process children
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim()
        if (text && terminalElement) {
          // For text-containing elements, set content
          if (tagName === 'text' || tagName === 'button') {
            // console.log(`[Bridge] Setting text content for ${tagName}: "${text}"`)
            terminalElement.setProps({
              ...terminalElement.props,
              content: text,
            })
          }
        }
      } else {
        happyDomToTerminal(child, terminalElement)
      }
    }

    return terminalElement
  }

  return null
}

/**
 * Parse inline style string to object
 */
function parseInlineStyle(styleStr: string): Record<string, any> {
  const styles: Record<string, any> = {}
  const declarations = styleStr.split(';').filter(Boolean)

  for (const decl of declarations) {
    const [prop, value] = decl.split(':').map((s) => s.trim())
    if (prop && value) {
      // Convert CSS property names to blessed style names
      switch (prop) {
        case 'color':
          styles.fg = value
          break
        case 'background-color':
          styles.bg = value
          break
        case 'font-weight':
          if (value === 'bold') {
            styles.bold = true
          }
          break
        // Add more conversions as needed
      }
    }
  }

  return styles
}

/**
 * Observes changes to a Happy DOM element and updates terminal elements
 */
export function observeHappyDom(
  happyElement: Element,
  terminalElement: TerminalElement,
  screen: any
): MutationObserver {
  // Set up keyboard events for this element if it's focusable
  const tagName = happyElement.tagName.toLowerCase()
  const isFocusable =
    tagName === 'input' ||
    tagName === 'button' ||
    tagName === 'box' ||
    happyElement.hasAttribute('tabindex') ||
    happyElement.hasAttribute('focused') ||
    happyElement.hasAttribute('onkeydown') ||
    happyElement.hasAttribute('onkeyup')

  if (isFocusable) {
    setupKeyboardEvents(happyElement, terminalElement, screen)
  }

  // Use enhanced observer for text elements
  const observerCallback = (mutations: MutationRecord[]) => {
    let needsUpdate = false

    // console.log(`[Observer] Detected ${mutations.length} mutations`)

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // For text elements, try to sync content first
        if (
          terminalElement.type === 'text' ||
          terminalElement.type === 'ttext'
        ) {
          if (syncTextContent(happyElement, terminalElement, screen)) {
            continue // Content updated, no need to rebuild
          }
        }

        // Handle added/removed nodes
        needsUpdate = true

        // Clear and rebuild terminal children
        while (terminalElement.children.length > 0) {
          const child = terminalElement.children[0]
          terminalElement.removeChild(child)
          child.destroy()
        }

        // Rebuild from Happy DOM
        for (const child of happyElement.childNodes) {
          const newTerminalChild = happyDomToTerminal(child, terminalElement)
          // Set up keyboard events for new children if needed
          if (newTerminalChild && child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as Element
            const childTagName = childElement.tagName.toLowerCase()
            if (
              childTagName === 'input' ||
              childTagName === 'button' ||
              childTagName === 'box' ||
              childElement.hasAttribute('tabindex') ||
              childElement.hasAttribute('focused') ||
              childElement.hasAttribute('onkeydown')
            ) {
              setupKeyboardEvents(childElement, newTerminalChild, screen)
            }
          }
        }
      } else if (mutation.type === 'attributes') {
        // Handle attribute changes
        needsUpdate = true

        const attrName = mutation.attributeName
        if (attrName) {
          const value = happyElement.getAttribute(attrName)
          const propName = attrName === 'class' ? 'className' : attrName

          if (value !== null) {
            terminalElement.setProps({
              ...terminalElement.props,
              [propName]: value,
            })
          }

          // Special handling for focus-related attributes
          if (
            attrName === 'focused' &&
            value === 'true' &&
            terminalElement.blessed
          ) {
            // Auto-focus element when focused attribute is set
            setTimeout(() => {
              if (terminalElement.blessed?.focus) {
                terminalElement.blessed.focus()
              }
            }, 0)
          }
        }
      } else if (mutation.type === 'characterData') {
        // Handle text content changes
        // For text elements, use optimized sync
        if (
          terminalElement.type === 'text' ||
          terminalElement.type === 'ttext'
        ) {
          if (syncTextContent(happyElement, terminalElement, screen)) {
            continue // Content updated efficiently
          }
        }

        needsUpdate = true
        // console.log(`[Observer] Character data changed: "${mutation.target.textContent}"`)

        if (terminalElement.type === 'button') {
          const text = happyElement.textContent || ''
          // console.log(`[Observer] Updating button content to: "${text}"`)
          terminalElement.setProps({
            ...terminalElement.props,
            content: text,
          })
        }
      }
    }

    if (needsUpdate) {
      terminalElement.update()
      screen.render()
    }
  }

  const observer = createTextAwareMutationObserver(
    happyElement,
    terminalElement,
    screen,
    observerCallback
  )

  // Start observing
  observer.observe(happyElement, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  })

  // Check for delegated event handlers (Svelte 5 pattern)
  if ((happyElement as any).__keydown) {
    // console.log('[Bridge] Found delegated keydown handler on element')
    // Attach actual event listener for delegated handler
    happyElement.addEventListener('keydown', (e) => {
      const [handler, ...args] = (happyElement as any).__keydown
      if (typeof handler === 'function') {
        handler(e, ...args)
      }
    })
  }

  return observer
}

/**
 * Converts blessed key info to DOM key names
 */
function blessedKeyToDOMKey(key: any): { key: string; code: string } {
  // Handle special keys
  const keyMappings: Record<string, { key: string; code: string }> = {
    return: { key: 'Enter', code: 'Enter' },
    enter: { key: 'Enter', code: 'Enter' },
    tab: { key: 'Tab', code: 'Tab' },
    backspace: { key: 'Backspace', code: 'Backspace' },
    delete: { key: 'Delete', code: 'Delete' },
    escape: { key: 'Escape', code: 'Escape' },
    esc: { key: 'Escape', code: 'Escape' },
    space: { key: ' ', code: 'Space' },
    up: { key: 'ArrowUp', code: 'ArrowUp' },
    down: { key: 'ArrowDown', code: 'ArrowDown' },
    left: { key: 'ArrowLeft', code: 'ArrowLeft' },
    right: { key: 'ArrowRight', code: 'ArrowRight' },
    home: { key: 'Home', code: 'Home' },
    end: { key: 'End', code: 'End' },
    pageup: { key: 'PageUp', code: 'PageUp' },
    pagedown: { key: 'PageDown', code: 'PageDown' },
    f1: { key: 'F1', code: 'F1' },
    f2: { key: 'F2', code: 'F2' },
    f3: { key: 'F3', code: 'F3' },
    f4: { key: 'F4', code: 'F4' },
    f5: { key: 'F5', code: 'F5' },
    f6: { key: 'F6', code: 'F6' },
    f7: { key: 'F7', code: 'F7' },
    f8: { key: 'F8', code: 'F8' },
    f9: { key: 'F9', code: 'F9' },
    f10: { key: 'F10', code: 'F10' },
    f11: { key: 'F11', code: 'F11' },
    f12: { key: 'F12', code: 'F12' },
  }

  const keyName = key.name || key.full
  if (keyName && keyMappings[keyName.toLowerCase()]) {
    return keyMappings[keyName.toLowerCase()]
  }

  // For regular characters
  if (key.ch) {
    const ch = key.ch
    // Handle uppercase letters
    if (ch.match(/^[A-Z]$/)) {
      return { key: ch, code: `Key${ch}` }
    }
    // Handle lowercase letters
    if (ch.match(/^[a-z]$/)) {
      return { key: ch, code: `Key${ch.toUpperCase()}` }
    }
    // Handle numbers
    if (ch.match(/^[0-9]$/)) {
      return { key: ch, code: `Digit${ch}` }
    }
    // Other characters
    return { key: ch, code: '' }
  }

  // Default fallback
  return { key: keyName || '', code: '' }
}

/**
 * Creates a synthetic keyboard event from blessed key info
 */
function createKeyboardEvent(
  eventType: string,
  ch: string | null,
  key: any
): KeyboardEvent {
  const { key: domKey, code } = blessedKeyToDOMKey(key)

  // For regular characters, prefer the actual character from ch parameter
  // This ensures we get the correct case (uppercase/lowercase)
  let actualKey = domKey
  if (ch && ch.length === 1 && !domKey) {
    actualKey = ch
  } else if (ch && ch.length === 1 && domKey.length === 1) {
    // Use the actual character to preserve case
    actualKey = ch
  }

  // Use 'any' type to bypass readonly properties
  const init: any = {
    key: actualKey || domKey || ch || '',
    code: code,
    keyCode: 0, // Deprecated but some code might use it
    which: 0, // Deprecated but some code might use it
    ctrlKey: key.ctrl || false,
    shiftKey: key.shift || false,
    altKey: key.alt || false,
    metaKey: key.meta || false,
    bubbles: true,
    cancelable: true,
    composed: true,
  }

  // Calculate keyCode for compatibility
  if (domKey === 'Enter') init.keyCode = init.which = 13
  else if (domKey === 'Tab') init.keyCode = init.which = 9
  else if (domKey === 'Backspace') init.keyCode = init.which = 8
  else if (domKey === 'Delete') init.keyCode = init.which = 46
  else if (domKey === 'Escape') init.keyCode = init.which = 27
  else if (domKey === ' ') init.keyCode = init.which = 32
  else if (domKey === 'ArrowUp') init.keyCode = init.which = 38
  else if (domKey === 'ArrowDown') init.keyCode = init.which = 40
  else if (domKey === 'ArrowLeft') init.keyCode = init.which = 37
  else if (domKey === 'ArrowRight') init.keyCode = init.which = 39
  else if (ch && ch.length === 1) init.keyCode = init.which = ch.charCodeAt(0)

  return new KeyboardEvent(eventType, init)
}

/**
 * Sets up keyboard event handling for an element
 */
export function setupKeyboardEvents(
  happyElement: Element,
  terminalElement: TerminalElement,
  screen: any
): void {
  if (!terminalElement.blessed) return

  // Store screen reference
  if (!globalScreen && screen) {
    globalScreen = screen
  }

  // Handle focus events
  terminalElement.blessed.on('focus', () => {
    // console.log('[Bridge] Focus event on terminal element:', terminalElement.type)

    // Update focus tracking
    focusedElements.clear()
    focusedElements.add(happyElement)
    currentlyFocusedTerminal = terminalElement

    // Dispatch focus event
    const focusEvent = new FocusEvent('focus', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    happyElement.dispatchEvent(focusEvent)

    // Also dispatch focusin (bubbles)
    const focusInEvent = new FocusEvent('focusin', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    happyElement.dispatchEvent(focusInEvent)
  })

  terminalElement.blessed.on('blur', () => {
    focusedElements.delete(happyElement)
    if (currentlyFocusedTerminal === terminalElement) {
      currentlyFocusedTerminal = null
    }

    // Dispatch blur event
    const blurEvent = new FocusEvent('blur', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    happyElement.dispatchEvent(blurEvent)

    // Also dispatch focusout (bubbles)
    const focusOutEvent = new FocusEvent('focusout', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    happyElement.dispatchEvent(focusOutEvent)
  })

  // Make the element focusable
  if (terminalElement.blessed) {
    terminalElement.blessed.focusable = true
    terminalElement.blessed.input = true
    terminalElement.blessed.keys = true

    // Set up element-specific key handling if it supports it
    if (
      terminalElement.blessed.key &&
      typeof terminalElement.blessed.key === 'function'
    ) {
      // Handle all keys at element level for better control
      terminalElement.blessed.key(
        [
          'enter',
          'space',
          'tab',
          'escape',
          'backspace',
          'delete',
          'up',
          'down',
          'left',
          'right',
          'home',
          'end',
          'pageup',
          'pagedown',
          'f1',
          'f2',
          'f3',
          'f4',
          'f5',
          'f6',
          'f7',
          'f8',
          'f9',
          'f10',
          'f11',
          'f12',
        ],
        (ch: string, key: any) => {
          // Only process if this element is focused
          if (!terminalElement.blessed?.focused) return

          // Dispatch keyboard events
          const keydownEvent = createKeyboardEvent('keydown', ch, key)
          const keydownResult = happyElement.dispatchEvent(keydownEvent)

          if (keydownResult) {
            const keyupEvent = createKeyboardEvent('keyup', ch, key)
            happyElement.dispatchEvent(keyupEvent)
          }
        }
      )
    }
  }
}

/**
 * Gets the terminal element for a DOM element
 */
export function getTerminalElement(
  domElement: Element
): TerminalElement | undefined {
  return domToTerminalMap.get(domElement)
}

/**
 * Sets up document-level event delegation for Svelte 5
 */
function setupDocumentEventDelegation(): void {
  // console.log('[Bridge] Setting up document event delegation')

  // Svelte 5 uses event delegation at the document level
  // We need to handle delegated events that bubble up
  document.addEventListener(
    'keydown',
    (e) => {
      // console.log('[Bridge] Document keydown event captured')
      // Let it bubble naturally - Svelte will handle it
    },
    true
  ) // Use capture phase to see events early
}

/**
 * Sets up global keyboard forwarding to focused elements
 */
export function setupGlobalKeyboardHandler(screen: any): void {
  globalScreen = screen
  // console.log('[Bridge] Setting up global keyboard handler')

  // Set up document-level event delegation for Svelte 5
  setupDocumentEventDelegation()

  // Track recently handled keys to avoid double-processing
  const recentlyHandledKeys = new Map<string, number>()

  // Handle all key events at the screen level
  screen.on('keypress', (ch: string, key: any) => {
    // console.log('[Bridge] Global keypress event - ch:', ch, 'key:', key)

    // Skip special keys in keypress - they'll be handled by the 'key' event
    const keyName = key.name || key.full
    if (
      keyName &&
      [
        'backspace',
        'delete',
        'left',
        'right',
        'up',
        'down',
        'home',
        'end',
        'enter',
        'return',
      ].includes(keyName)
    ) {
      return
    }

    // Find the currently focused DOM element
    const focusedDom = Array.from(focusedElements)[0]
    if (!focusedDom) {
      // No DOM element has focus, check if any terminal element does
      if (
        currentlyFocusedTerminal &&
        currentlyFocusedTerminal.blessed?.focused
      ) {
        const domElement = terminalToDomMap.get(currentlyFocusedTerminal)
        if (domElement) {
          handleKeyPress(domElement, ch, key)
        }
      }
      return
    }

    handleKeyPress(focusedDom, ch, key)
  })

  // Handle special keys via the 'key' event
  screen.on('key', (name: string, key: any) => {
    // Check if we recently handled this key
    const now = Date.now()
    const keyIdentifier = `${name}-${key.sequence || ''}`
    const lastHandled = recentlyHandledKeys.get(keyIdentifier)

    if (lastHandled && now - lastHandled < 50) {
      return // Skip if handled within last 50ms
    }

    recentlyHandledKeys.set(keyIdentifier, now)

    // Clean up old entries
    if (recentlyHandledKeys.size > 100) {
      for (const [k, time] of recentlyHandledKeys) {
        if (now - time > 1000) {
          recentlyHandledKeys.delete(k)
        }
      }
    }

    const focusedDom = Array.from(focusedElements)[0]
    if (!focusedDom) {
      if (
        currentlyFocusedTerminal &&
        currentlyFocusedTerminal.blessed?.focused
      ) {
        const domElement = terminalToDomMap.get(currentlyFocusedTerminal)
        if (domElement) {
          handleKeyPress(domElement, null, { ...key, name })
        }
      }
      return
    }

    handleKeyPress(focusedDom, null, { ...key, name })
  })
}

/**
 * Handles a key press event and dispatches appropriate DOM events
 */
function handleKeyPress(element: Element, ch: string | null, key: any): void {
  // console.log('[Bridge] handleKeyPress called - ch:', ch, 'key:', key, 'element:', element.tagName)

  // Check if element has delegated handler
  if ((element as any).__keydown) {
    // console.log('[Bridge] Element has __keydown handler, calling directly')
    const [handler, ...args] = (element as any).__keydown
    if (typeof handler === 'function') {
      const keydownEvent = createKeyboardEvent('keydown', ch, key)
      // Set the target properly
      Object.defineProperty(keydownEvent, 'target', {
        value: element,
        writable: false,
        configurable: true,
      })
      Object.defineProperty(keydownEvent, 'currentTarget', {
        value: element,
        writable: false,
        configurable: true,
      })
      handler(keydownEvent, ...args)
      return
    }
  }

  // Dispatch keydown
  const keydownEvent = createKeyboardEvent('keydown', ch, key)
  // console.log('[Bridge] Dispatching keydown event:', keydownEvent.key, keydownEvent.code)
  const keydownResult = element.dispatchEvent(keydownEvent)

  // If keydown wasn't prevented, dispatch other events
  if (keydownResult) {
    // For printable characters, dispatch beforeinput and input events
    if (ch && !key.ctrl && !key.alt && !key.meta && ch.length === 1) {
      // Dispatch beforeinput
      const beforeInputEvent = new InputEvent('beforeinput', {
        data: ch,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
        composed: true,
      })
      const beforeInputResult = element.dispatchEvent(beforeInputEvent)

      // If beforeinput wasn't prevented, dispatch input
      if (beforeInputResult) {
        const inputEvent = new InputEvent('input', {
          data: ch,
          inputType: 'insertText',
          bubbles: true,
          cancelable: false, // input event is not cancelable
          composed: true,
        })
        element.dispatchEvent(inputEvent)
      }
    }

    // Dispatch keyup
    const keyupEvent = createKeyboardEvent('keyup', ch, key)
    element.dispatchEvent(keyupEvent)
  }
}

/**
 * Manually focuses an element and updates all tracking
 */
export function focusElement(domElement: Element): void {
  const terminalElement = getTerminalElement(domElement)
  if (!terminalElement?.blessed) return

  // Clear previous focus
  focusedElements.clear()

  // Focus the blessed element
  if (
    terminalElement.blessed.focus &&
    typeof terminalElement.blessed.focus === 'function'
  ) {
    terminalElement.blessed.focus()
  }

  // Update tracking
  focusedElements.add(domElement)
  currentlyFocusedTerminal = terminalElement

  // Dispatch focus events
  const focusEvent = new FocusEvent('focus', {
    bubbles: true,
    cancelable: true,
    composed: true,
  })
  domElement.dispatchEvent(focusEvent)
}

/**
 * Gets the currently focused DOM element
 */
export function getFocusedElement(): Element | null {
  return Array.from(focusedElements)[0] || null
}

/**
 * Checks if an element has focus
 */
export function hasFocus(domElement: Element): boolean {
  return focusedElements.has(domElement)
}
