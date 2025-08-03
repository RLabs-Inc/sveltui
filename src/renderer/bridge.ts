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
import { 
  bridgeElementEvents, 
  bridgeScreenEvents, 
  createCustomEvent,
  EventDelegator 
} from '../dom/event-bridge'
// Temporarily disable reactive events for debugging
// import { 
//   globalEventBus, 
//   getElementEventEmitter,
//   ReactiveEventEmitter 
// } from '../dom/reactive-events.svelte.ts'
// import { mouseState } from '../input/simple-mouse-state'

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

    // console.log(`[Bridge] Converting element: ${tagName}, attrs:`, Array.from(element.attributes).map(a => `${a.name}="${a.value}"`).join(' '))

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

      // Try to parse JSON attributes
      if (['border', 'style'].includes(propName)) {
        try {
          // Handle [object Object] case
          if (value === '[object Object]' && propName === 'border') {
            // Default border style with complete blessed.js specification
            value = { 
              type: 'line',
              ch: ' ',
              left: true,
              top: true,
              right: true,
              bottom: true
            }
          } else if (value === '[object Object]' && propName === 'style') {
            // Skip - will be handled by inline style parsing
            continue
          } else if (value.startsWith('{')) {
            value = JSON.parse(value)
          }
        } catch (e) {
          // Keep as string if JSON parsing fails
        }
      }

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
    // For style, check if element has __style (Svelte's internal cache)
    if ((element as any).__style) {
      // Svelte has set styles via $.set_style()
      // __style contains the raw style object passed to $.set_style()
      props.style = (element as any).__style
      // console.log(`[Bridge] Found __style:`, props.style)
    } else if (element instanceof HTMLElement) {
      // Check for inline styles on the element
      const styleObj: Record<string, any> = {}
      let hasStyles = false
      
      // Parse color styles
      if (element.style.color) {
        styleObj.fg = element.style.color
        hasStyles = true
      }
      if (element.style.backgroundColor) {
        styleObj.bg = element.style.backgroundColor
        hasStyles = true
      }
      
      // Check for font weight
      if (element.style.fontWeight === 'bold') {
        styleObj.bold = true
        hasStyles = true
      }
      
      // Check for borders and other blessed-specific styles
      if (element.style.border && typeof element.style.border === 'object') {
        styleObj.border = element.style.border
        hasStyles = true
      }
      
      // Only override if we found actual styles
      if (hasStyles) {
        props.style = styleObj
      }
    } else if (element.hasAttribute('style') && typeof props.style === 'string' && !props.style.startsWith('{')) {
      // Fallback: parse style attribute if it's a CSS string
      props.style = parseInlineStyle(props.style)
    }

    // Create terminal element
    const terminalElement = createElement(tagName, props)
    // console.log(`[Bridge] Created terminal element: ${tagName}, blessed:`, !!terminalElement.blessed, 'props:', props)

    // Store the bidirectional mapping
    domToTerminalMap.set(element, terminalElement)
    terminalToDomMap.set(terminalElement, element)

    // Schedule a check for initial reactive styles after template_effect runs
    // This ensures initial reactive values are applied on first render
    setTimeout(() => {
      if ((element as any).__style) {
        // Check if the reactive style is different from current props
        const reactiveStyle = (element as any).__style
        const currentStyle = terminalElement.props.style || {}
        const needsUpdate = JSON.stringify(reactiveStyle) !== JSON.stringify(currentStyle)
        
        if (needsUpdate) {
          // Apply the reactive style that was set by template_effect
          const currentProps = { ...terminalElement.props }
          
          // Debug log for border styles
          if (reactiveStyle.border) {
            console.log(`[Bridge] Applying initial border style:`, reactiveStyle.border)
          }
          
          terminalElement.setProps({
            ...currentProps,
            style: reactiveStyle
          })
          terminalElement.update()
          
          // Force screen render to show the updated style
          if (terminalElement.blessed?.screen) {
            terminalElement.blessed.screen.render()
          }
        }
      }
    }, 0)

    // Hook into the element's style property to intercept Svelte's set_style calls
    if (element instanceof HTMLElement) {
      // Store original style property descriptor
      const originalStyleDescriptor = Object.getOwnPropertyDescriptor(element, 'style')
      const originalStyle = element.style
      
      // Override the style property to intercept changes
      Object.defineProperty(element, 'style', {
        get() {
          return originalStyle
        },
        set(value) {
          // Update the original style
          if (originalStyleDescriptor?.set) {
            originalStyleDescriptor.set.call(this, value)
          } else if (originalStyle) {
            Object.assign(originalStyle, value)
          }
          
          // If this style change comes from Svelte's set_style, trigger terminal update  
          if ((element as any).__style) {
            // Critical fix: When style contains border, preserve existing border structure
            const currentProps = { ...terminalElement.props }
            const newStyle = (element as any).__style
            
            if (newStyle.border && currentProps.border) {
              // Merge border style with existing border structure
              const existingBorder = typeof currentProps.border === 'object' ? currentProps.border : { 
                type: 'line',
                ch: ' ',
                left: true,
                top: true,
                right: true,
                bottom: true
              }
              const mergedBorder = { ...existingBorder, ...newStyle.border }
              
              // Remove border from style and set as separate border prop
              const { border, ...styleWithoutBorder } = newStyle
              
              terminalElement.setProps({
                ...currentProps,
                style: styleWithoutBorder,
                border: mergedBorder
              })
            } else {
              terminalElement.setProps({
                ...currentProps,
                style: newStyle
              })
            }
            
            terminalElement.update()
            if (terminalElement.blessed?.screen) {
              terminalElement.blessed.screen.render()
            }
          }
        },
        configurable: true,
        enumerable: true
      })
      
      // Also override the cssText property specifically
      if (originalStyle && originalStyle.cssText !== undefined) {
        const originalCssTextDescriptor = Object.getOwnPropertyDescriptor(originalStyle, 'cssText')
        Object.defineProperty(originalStyle, 'cssText', {
          get() {
            return originalCssTextDescriptor?.get?.call(this) || ''
          },
          set(value) {
            // Call original setter
            if (originalCssTextDescriptor?.set) {
              originalCssTextDescriptor.set.call(this, value)
            }
            
            // Check if Svelte set the __style property
            if ((element as any).__style) {
              terminalElement.setProps({
                ...terminalElement.props,
                style: (element as any).__style
              })
              terminalElement.update()
              if (terminalElement.blessed?.screen) {
                terminalElement.blessed.screen.render()
              }
            }
          },
          configurable: true,
          enumerable: true
        })
      }
    }

    // Set up reactive event system for this element
    // Temporarily disabled for debugging
    // const parentEmitter = parent ? getElementEventEmitter(parent) : globalEventBus
    // const elementEmitter = bridgeElementEvents(terminalElement, parentEmitter)

    // Add to parent if provided
    if (parent) {
      // console.log(`[Bridge] Parent provided for ${tagName}, parent.blessed:`, !!parent.blessed)
      parent.appendChild(terminalElement)
      if (parent.blessed && !terminalElement.blessed) {
        terminalElement.create(parent.blessed)
        // Bridge events after blessed element is created
        // Temporarily disabled for debugging
        // bridgeElementEvents(terminalElement, parentEmitter)
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

    // Set up keyboard events if this element is focusable
    const isFocusable =
      tagName === 'input' ||
      tagName === 'button' ||
      tagName === 'box' ||
      element.hasAttribute('tabindex') ||
      element.hasAttribute('focused') ||
      element.hasAttribute('onkeydown') ||
      element.hasAttribute('onkeyup')

    // console.log(`[Bridge] Element ${tagName} focusable:`, isFocusable, 'has focused attr:', element.hasAttribute('focused'))

    if (isFocusable && terminalElement.blessed && globalScreen) {
      // console.log(`[Bridge] Setting up keyboard events for ${tagName} during initial bridge`)
      setupKeyboardEvents(element, terminalElement, globalScreen)
      
      // If element has focused="true", focus it
      if (element.getAttribute('focused') === 'true' || element.hasAttribute('focused')) {
        // Focus after a small delay to ensure screen is ready
        setTimeout(() => {
          if (terminalElement.blessed) {
            // console.log('[Bridge] Auto-focusing element with focused attribute:', terminalElement.type, 'width:', terminalElement.blessed.width, 'height:', terminalElement.blessed.height)
            terminalElement.blessed.focus()
            // console.log('[Bridge] Element focused:', terminalElement.blessed.focused)
            
            // Blessed might not focus elements with 0 width/height, let's give it minimum size
            if (terminalElement.blessed.width === 0 || terminalElement.blessed.height === 0) {
              // console.log('[Bridge] Element has 0 size, setting minimum size')
              terminalElement.blessed.width = 1
              terminalElement.blessed.height = 1
              terminalElement.blessed.focus()
              // console.log('[Bridge] Element focused after resize:', terminalElement.blessed.focused)
            }
          }
        }, 50)
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
  // console.log(`[Bridge] Setting up observer for ${happyElement.tagName}`)
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

  // console.log(`[Bridge] Element ${tagName} focusable:`, isFocusable, 'has focused attr:', happyElement.hasAttribute('focused'))

  if (isFocusable) {
    // console.log(`[Bridge] Setting up keyboard events for ${tagName}`)
    setupKeyboardEvents(happyElement, terminalElement, screen)
    
    // If element has focused="true", focus it
    if (happyElement.getAttribute('focused') === 'true' || happyElement.hasAttribute('focused')) {
      // Focus after a small delay to ensure screen is ready
      setTimeout(() => {
        if (terminalElement.blessed) {
          // console.log('[Bridge] Auto-focusing element with focused attribute:', terminalElement.type)
          terminalElement.blessed.focus()
        }
      }, 50)
    }
  }

  // Note: Style changes are now handled via DOM element style property hooks

  // Use enhanced observer for text elements
  const observerCallback = (mutations: MutationRecord[]) => {
    let needsUpdate = false

    // console.log(`[Observer] Detected ${mutations.length} mutations for ${happyElement.tagName} (${happyElement.constructor.name})`)

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
            // Special handling for style attribute
            if (attrName === 'style') {
              let styleObj: Record<string, any> = {}
              
              // First check if element has __style (Svelte's internal cache)
              if ((happyElement as any).__style) {
                // Svelte has set styles via $.set_style()
                // __style contains the raw style object passed to $.set_style()
                styleObj = (happyElement as any).__style
              } else if (happyElement instanceof HTMLElement) {
                // Convert inline styles to blessed style object (fallback)
                // Parse color styles
                if (happyElement.style.color) {
                  styleObj.fg = happyElement.style.color
                }
                if (happyElement.style.backgroundColor) {
                  styleObj.bg = happyElement.style.backgroundColor
                }
                
                // Check for font weight
                if (happyElement.style.fontWeight === 'bold') {
                  styleObj.bold = true
                }
              }
              
              // Update props with style object
              terminalElement.setProps({
                ...terminalElement.props,
                style: styleObj
              })
            } else {
              // Handle other attributes including border
              let processedValue: any = value
              
              // Try to parse JSON attributes like border
              if (['border'].includes(propName)) {
                try {
                  // Handle [object Object] case
                  if (processedValue === '[object Object]' && propName === 'border') {
                    // Default border style with complete blessed.js specification
                    processedValue = { 
                      type: 'line',
                      ch: ' ',
                      left: true,
                      top: true,
                      right: true,
                      bottom: true
                    }
                  } else if (processedValue.startsWith('{')) {
                    processedValue = JSON.parse(processedValue)
                  }
                } catch (e) {
                  // Keep as string if JSON parsing fails
                }
              }
              
              terminalElement.setProps({
                ...terminalElement.props,
                [propName]: processedValue,
              })
            }
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
    // console.log('[Bridge] Added to focusedElements, size:', focusedElements.size)

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
  // console.log('[Bridge] Setting up global keyboard handler, screen:', !!screen)

  // Set up document-level event delegation for Svelte 5
  setupDocumentEventDelegation()
  
  // Bridge screen events to global event bus
  // Temporarily disabled for debugging
  // bridgeScreenEvents(screen, globalEventBus)
  
  // Initialize mouse state with the root element when available
  // The root element will be set when the first terminal element is created
  // This is handled in happyDomToTerminal function

  // Track recently handled keys to avoid double-processing
  const recentlyHandledKeys = new Map<string, number>()

  // Handle all key events at the screen level
  // console.log('[Bridge] Registering keypress handler')
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
  // console.log('[Bridge] Registering key handler')
  screen.on('key', (name: string, key: any) => {
    // console.log('[Bridge] Screen key event:', name, 'focused elements:', focusedElements.size, 'current terminal:', !!currentlyFocusedTerminal)
    // console.log('[Bridge] Key details:', { name, ch: key.ch, full: key.full, sequence: key.sequence })
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
    // console.log('[Bridge] Element has __keydown handler')
    const [handler, ...args] = (element as any).__keydown
    // console.log('[Bridge] Handler type:', typeof handler, 'args length:', args.length)
    if (typeof handler === 'function') {
      // Get the key name (e.g., "up", "down", "q", etc.)
      const keyName = key.name || (ch && ch.length === 1 ? ch : null)
      // console.log('[Bridge] Key name:', keyName, 'ch:', ch, 'key.name:', key.name, 'key.full:', key.full)
      if (keyName) {
        // console.log('[Bridge] Calling __keydown handler with key:', keyName)
        try {
          // Call with just the key name, not the full event
          handler(keyName, ...args)
          // console.log('[Bridge] Handler called successfully')
          
          // For keyboard responsiveness: force one immediate render after handler
          // This eliminates the 16ms delay from DOM sync polling
          if (globalScreen) {
            globalScreen.render()
          }
        } catch (error) {
          console.error('[Bridge] Error calling handler:', error)
        }
        return
      }
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
