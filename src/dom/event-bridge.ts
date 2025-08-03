/**
 * Event Bridge for SvelTUI
 * 
 * This module provides utilities to bridge blessed's EventEmitter pattern
 * with the reactive event system. It handles event normalization and delegation.
 */

import type { Widgets } from 'blessed'
import type { TerminalElement } from './elements'
import { ReactiveEventEmitter, createElementEventEmitter, getElementEventEmitter } from './reactive-events.svelte.ts'
import type { ReactiveEventData } from './reactive-events.svelte.ts'

/**
 * Blessed event to reactive event mapping
 */
const BLESSED_EVENT_MAP: Record<string, string> = {
  // Mouse events
  'mouse': 'mouse',
  'mousedown': 'mousedown',
  'mouseup': 'mouseup',
  'mouseover': 'mouseover',
  'mouseout': 'mouseout',
  'mousemove': 'mousemove',
  'click': 'click',
  'wheeldown': 'wheel',
  'wheelup': 'wheel',
  
  // Keyboard events
  'keypress': 'keypress',
  'key': 'keydown',
  
  // Focus events
  'focus': 'focus',
  'blur': 'blur',
  
  // Element events
  'attach': 'attach',
  'detach': 'detach',
  'show': 'show',
  'hide': 'hide',
  'resize': 'resize',
  'move': 'move',
  'destroy': 'destroy',
  
  // List events
  'select': 'select',
  'select item': 'selectitem',
  'cancel': 'cancel',
  'action': 'action',
  
  // Input events
  'submit': 'submit',
  'cancel': 'cancel',
  'error': 'error',
}

/**
 * Normalize blessed event data to reactive event data
 */
function normalizeBlessedEvent(
  blessedEventType: string,
  blessedData: any,
  element: TerminalElement
): ReactiveEventData {
  const eventType = BLESSED_EVENT_MAP[blessedEventType] || blessedEventType
  
  // Normalize event data based on type
  let normalizedData: any = blessedData
  
  switch (blessedEventType) {
    case 'mouse':
    case 'mousedown':
    case 'mouseup':
    case 'mouseover':
    case 'mouseout':
    case 'mousemove':
      // Mouse event data
      normalizedData = {
        x: blessedData.x,
        y: blessedData.y,
        button: blessedData.button,
        shift: blessedData.shift,
        ctrl: blessedData.ctrl,
        meta: blessedData.meta
      }
      break
      
    case 'wheeldown':
    case 'wheelup':
      // Wheel event data
      normalizedData = {
        direction: blessedEventType === 'wheeldown' ? 'down' : 'up',
        x: blessedData.x,
        y: blessedData.y,
        shift: blessedData.shift,
        ctrl: blessedData.ctrl,
        meta: blessedData.meta
      }
      break
      
    case 'keypress':
    case 'key':
      // Keyboard event data
      if (typeof blessedData === 'object' && blessedData !== null) {
        normalizedData = {
          key: blessedData.name || blessedData.full || blessedData.ch,
          ch: blessedData.ch,
          shift: blessedData.shift,
          ctrl: blessedData.ctrl,
          meta: blessedData.meta,
          sequence: blessedData.sequence
        }
      }
      break
      
    case 'resize':
      // Resize event data
      normalizedData = {
        width: element.blessed?.width,
        height: element.blessed?.height
      }
      break
      
    case 'move':
      // Move event data
      normalizedData = {
        left: element.blessed?.left,
        top: element.blessed?.top
      }
      break
      
    case 'select':
    case 'select item':
      // List selection event data
      normalizedData = {
        index: blessedData,
        item: element.blessed && 'items' in element.blessed ? 
          (element.blessed as any).items[blessedData] : null
      }
      break
  }
  
  return {
    type: eventType,
    timestamp: Date.now(),
    data: normalizedData,
    target: element
  }
}

/**
 * Bridge blessed events to reactive events for an element
 */
export function bridgeElementEvents(
  element: TerminalElement,
  parentEmitter?: ReactiveEventEmitter
): ReactiveEventEmitter {
  // Get or create reactive emitter
  let emitter = getElementEventEmitter(element)
  if (!emitter) {
    emitter = createElementEventEmitter(element, parentEmitter)
  }
  
  // Only bridge if element has blessed component
  if (!element.blessed) {
    return emitter
  }
  
  const blessed = element.blessed
  
  // Bridge common blessed events
  const eventsTobridge = Object.keys(BLESSED_EVENT_MAP)
  
  for (const blessedEvent of eventsTobridge) {
    // Check if blessed element supports this event
    if (typeof blessed.on === 'function') {
      blessed.on(blessedEvent as any, (...args: any[]) => {
        // Normalize event data
        const eventData = normalizeBlessedEvent(blessedEvent, args[0], element)
        
        // Emit on reactive emitter
        emitter.emit(eventData.type, eventData.data)
      })
    }
  }
  
  return emitter
}

/**
 * Create a custom event
 */
export function createCustomEvent(
  type: string,
  data?: any,
  target?: TerminalElement
): ReactiveEventData {
  return {
    type,
    timestamp: Date.now(),
    data,
    target
  }
}

/**
 * Event delegation manager for performance
 */
export class EventDelegator {
  private rootEmitter: ReactiveEventEmitter
  private delegatedTypes = new Set<string>()
  private elementSelectors = new Map<string, (element: TerminalElement) => boolean>()
  
  constructor(rootEmitter: ReactiveEventEmitter) {
    this.rootEmitter = rootEmitter
  }
  
  /**
   * Delegate an event type with optional element selector
   */
  delegate(
    eventType: string,
    selector?: (element: TerminalElement) => boolean,
    handler?: (event: ReactiveEventData) => void
  ): () => void {
    // Track delegated type
    this.delegatedTypes.add(eventType)
    
    // Store selector if provided
    if (selector) {
      const key = `${eventType}:${handler ? handler.toString() : 'default'}`
      this.elementSelectors.set(key, selector)
    }
    
    // Subscribe to root emitter
    return this.rootEmitter.on(eventType, (event) => {
      // Check if event target matches selector
      if (selector && event.target) {
        if (!selector(event.target)) {
          return
        }
      }
      
      // Call handler if provided
      if (handler) {
        handler(event)
      }
    })
  }
  
  /**
   * Check if an event type is delegated
   */
  isDelegated(eventType: string): boolean {
    return this.delegatedTypes.has(eventType)
  }
  
  /**
   * Clear all delegations
   */
  clear(): void {
    this.delegatedTypes.clear()
    this.elementSelectors.clear()
  }
}

/**
 * Helper to bridge blessed screen events to reactive system
 */
export function bridgeScreenEvents(
  screen: Widgets.Screen,
  globalEmitter: ReactiveEventEmitter
): void {
  // Global keyboard events
  screen.on('keypress', (ch: string, key: any) => {
    globalEmitter.emit('keypress', {
      ch,
      key: key.name || key.full || ch,
      shift: key.shift,
      ctrl: key.ctrl,
      meta: key.meta
    })
  })
  
  // Global mouse events
  screen.on('mouse', (data: any) => {
    globalEmitter.emit('mouse', {
      x: data.x,
      y: data.y,
      button: data.button,
      action: data.action
    })
  })
  
  // Screen resize
  screen.on('resize', () => {
    globalEmitter.emit('resize', {
      width: screen.width,
      height: screen.height
    })
  })
  
  // Exit event
  screen.key(['q', 'C-c'], () => {
    globalEmitter.emit('exit', {})
    process.exit(0)
  })
}

/**
 * Helper to create event handlers that update blessed elements
 * These are side effects that should be used in $effect
 */
export function createBlessedUpdater(
  element: TerminalElement,
  updateFn: (blessed: Widgets.BlessedElement, data: any) => void
): (event: ReactiveEventData | null) => void {
  return (event) => {
    if (!event || !element.blessed) return
    updateFn(element.blessed, event.data)
  }
}

/**
 * Common blessed updaters for use with event watchers
 */
export const blessedUpdaters = {
  // Update content
  content: (blessed: Widgets.BlessedElement, content: string) => {
    if ('setContent' in blessed && typeof blessed.setContent === 'function') {
      (blessed as any).setContent(content)
      blessed.screen?.render()
    }
  },
  
  // Update label
  label: (blessed: Widgets.BlessedElement, label: string) => {
    if ('setLabel' in blessed && typeof blessed.setLabel === 'function') {
      (blessed as any).setLabel(label)
      blessed.screen?.render()
    }
  },
  
  // Update style
  style: (blessed: Widgets.BlessedElement, style: any) => {
    if (blessed.style) {
      Object.assign(blessed.style, style)
      blessed.screen?.render()
    }
  },
  
  // Focus element
  focus: (blessed: Widgets.BlessedElement) => {
    if ('focus' in blessed && typeof blessed.focus === 'function') {
      (blessed as any).focus()
    }
  },
  
  // Show/hide element
  visibility: (blessed: Widgets.BlessedElement, visible: boolean) => {
    if (visible) {
      blessed.show()
    } else {
      blessed.hide()
    }
    blessed.screen?.render()
  }
}