/**
 * Reactive Bridge Utilities
 * 
 * This module provides utilities to bridge between Svelte's reactivity
 * system and blessed terminal elements. It handles property conversions,
 * batching, and efficient updates.
 * 
 * CRITICAL: Effects are ONLY used for side effects (updating blessed elements).
 * Never update state inside effects. Use $derived for computed values.
 */

import type { BaseElementProps } from './elements'
import type { TerminalElement } from './elements'
import type { ReactiveTerminalElement } from './reactive-element'

// Dynamic imports to avoid compilation issues
let batch: any
let tick: any
let flushSync: any

// Lazy load Svelte internals
async function loadSvelteInternals() {
  if (!batch || !tick || !flushSync) {
    try {
      const client = await import('svelte/internal/client')
      batch = client.batch
      tick = client.tick
      flushSync = client.flushSync
      return true
    } catch (e) {
      console.warn('Failed to load Svelte internals:', e)
      return false
    }
  }
  return true
}

/**
 * Property conversion map for blessed compatibility
 */
const PROP_CONVERSIONS = {
  // Position conversions
  top: (value: any) => normalizePosition(value),
  left: (value: any) => normalizePosition(value),
  right: (value: any) => normalizePosition(value),
  bottom: (value: any) => normalizePosition(value),
  width: (value: any) => normalizeSize(value),
  height: (value: any) => normalizeSize(value),
  
  // Style conversions
  fg: (value: any) => normalizeColor(value),
  bg: (value: any) => normalizeColor(value),
  borderFg: (value: any) => normalizeColor(value),
  
  // Content conversions
  content: (value: any) => String(value || ''),
  label: (value: any) => String(value || ''),
  
  // State conversions
  hidden: (value: any) => Boolean(value),
  focused: (value: any) => Boolean(value),
  
  // Border conversions
  border: (value: any) => normalizeBorder(value),
} as const

/**
 * Normalizes position values for blessed
 */
function normalizePosition(value: any): number | string {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  if (value == null) return 0
  return String(value)
}

/**
 * Normalizes size values for blessed
 */
function normalizeSize(value: any): number | string {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  if (value == null) return '100%'
  return String(value)
}

/**
 * Normalizes color values for blessed
 */
function normalizeColor(value: any): string {
  if (typeof value === 'string') return value
  if (value == null) return 'default'
  return String(value)
}

/**
 * Normalizes border values for blessed
 */
function normalizeBorder(value: any): any {
  if (typeof value === 'boolean') return value
  if (typeof value === 'object' && value !== null) return value
  if (value === 'line') return { type: 'line' }
  if (value === 'bg') return { type: 'bg' }
  return Boolean(value)
}

/**
 * Update queue for batching multiple property updates
 */
class UpdateQueue {
  private updates = new Map<TerminalElement, Set<string>>()
  private scheduled = false
  private renderScheduled = false
  
  /**
   * Adds an update to the queue
   */
  async add(element: TerminalElement, prop: string): Promise<void> {
    if (!this.updates.has(element)) {
      this.updates.set(element, new Set())
    }
    this.updates.get(element)!.add(prop)
    
    if (!this.scheduled) {
      this.scheduled = true
      // Ensure internals are loaded
      await loadSvelteInternals()
      // Use Svelte's tick to batch with framework updates
      if (tick) {
        tick().then(() => this.flush())
      } else {
        // Fallback to setImmediate if tick not available
        setImmediate(() => this.flush())
      }
    }
  }
  
  /**
   * Flushes all pending updates
   */
  private async flush(): Promise<void> {
    // Ensure internals are loaded
    await loadSvelteInternals()
    
    // Collect all screens that need rendering
    const screensToRender = new Set<any>()
    
    for (const [element] of this.updates) {
      if (element.blessed?.screen) {
        screensToRender.add(element.blessed.screen)
      }
    }
    
    // Clear updates
    this.updates.clear()
    this.scheduled = false
    
    // Schedule a single render for all affected screens
    if (screensToRender.size > 0 && !this.renderScheduled) {
      this.renderScheduled = true
      setImmediate(() => {
        this.renderScheduled = false
        for (const screen of screensToRender) {
          screen.render()
        }
      })
    }
  }
  
  /**
   * Forces an immediate flush
   */
  forceFlush(): void {
    if (this.scheduled) {
      this.scheduled = false
      this.flush()
    }
  }
}

/**
 * Global update queue instance
 */
const updateQueue = new UpdateQueue()

/**
 * Bridge configuration options
 */
export interface BridgeOptions {
  /**
   * Whether to batch updates (default: true)
   */
  batching?: boolean
  
  /**
   * Whether to validate prop types (default: true)
   */
  validation?: boolean
  
  /**
   * Custom property converters
   */
  converters?: Record<string, (value: any) => any>
}

/**
 * Creates a reactive bridge for an element
 */
export function createReactiveBridge(
  element: TerminalElement,
  options: BridgeOptions = {}
): {
  updateProp: (prop: string, value: any) => void
  updateProps: (props: Partial<BaseElementProps>) => void
  destroy: () => void
} {
  const {
    batching = true,
    validation = true,
    converters = {}
  } = options
  
  // Merge custom converters with defaults
  const propConverters = { ...PROP_CONVERSIONS, ...converters }
  
  /**
   * Updates a single property
   */
  function updateProp(prop: string, value: any): void {
    // Convert the value if converter exists
    const converter = propConverters[prop as keyof typeof propConverters]
    const convertedValue = converter ? converter(value) : value
    
    // Update the element
    if (element.setProps) {
      element.setProps({ [prop]: convertedValue } as any)
    }
    
    // Queue render if batching
    if (batching) {
      updateQueue.add(element, prop)
    } else if (element.blessed?.screen) {
      element.blessed.screen.render()
    }
  }
  
  /**
   * Updates multiple properties
   */
  function updateProps(props: Partial<BaseElementProps>): void {
    // Convert all properties
    const convertedProps: any = {}
    for (const [key, value] of Object.entries(props)) {
      const converter = propConverters[key as keyof typeof propConverters]
      convertedProps[key] = converter ? converter(value) : value
    }
    
    // Update the element
    if (element.setProps) {
      element.setProps(convertedProps)
    }
    
    // Queue render if batching
    if (batching) {
      for (const prop of Object.keys(props)) {
        updateQueue.add(element, prop)
      }
    } else if (element.blessed?.screen) {
      element.blessed.screen.render()
    }
  }
  
  /**
   * Cleanup function
   */
  function destroy(): void {
    // Nothing to clean up for basic bridge
  }
  
  return {
    updateProp,
    updateProps,
    destroy
  }
}

/**
 * Helper to check if an element is reactive
 */
export function isReactiveElement(element: any): element is ReactiveTerminalElement {
  return element && typeof element.getReactiveProps === 'function'
}

/**
 * Helper to get reactive props from an element
 */
export function getReactiveProps(element: TerminalElement): Partial<BaseElementProps> | null {
  if (isReactiveElement(element)) {
    return element.getReactiveProps()
  }
  return null
}

/**
 * Helper to create a prop watcher that syncs with a terminal element
 * This is useful for binding component props to element properties
 * CRITICAL: Effect only updates element, never state
 */
export function createPropWatcher<T extends Record<string, any>>(
  element: TerminalElement,
  props: () => T,
  mapping?: Record<keyof T, string>
): () => void {
  const bridge = createReactiveBridge(element)
  
  // Create effect that watches props and updates element
  let cleanup: (() => void) | null = null
  
  // Import effect dynamically to avoid circular deps
  import('svelte/internal/client').then(({ effect }) => {
    cleanup = effect(() => {
      const currentProps = props()
      const updates: any = {}
      
      for (const [key, value] of Object.entries(currentProps)) {
        const targetKey = mapping?.[key as keyof T] || key
        updates[targetKey] = value
      }
      
      bridge.updateProps(updates)
    })
  }).catch(e => {
    console.warn('Failed to create prop watcher:', e)
  })
  
  // Return cleanup function
  return () => {
    cleanup?.()
    bridge.destroy()
  }
}

/**
 * Utility to batch multiple element updates
 */
export async function batchElementUpdates(fn: () => void): Promise<void> {
  await loadSvelteInternals()
  if (batch) {
    batch(fn)
  } else {
    fn()
  }
}

/**
 * Forces an immediate render of all screens
 */
export function forceRender(): void {
  updateQueue.forceFlush()
}

/**
 * Synchronously flushes all pending updates
 */
export async function flushUpdates(): Promise<void> {
  await loadSvelteInternals()
  if (flushSync) {
    flushSync(() => {
      updateQueue.forceFlush()
    })
  } else {
    updateQueue.forceFlush()
  }
}

/**
 * Helper to create a derived value that updates an element property
 * CRITICAL: This creates an effect that only updates the element, not state
 */
export function bindDerivedToElement<T>(
  element: TerminalElement,
  propName: string,
  getDerivedValue: () => T
): () => void {
  if (!isReactiveElement(element)) {
    console.warn('bindDerivedToElement: Element is not reactive')
    return () => {}
  }
  
  // Use the element's bindReactiveProp method
  return (element as ReactiveTerminalElement).bindReactiveProp(
    propName as any,
    getDerivedValue
  )
}

/**
 * Creates a reactive text content binding
 * Useful for text elements that need to update based on reactive values
 */
export function createTextBinding(
  element: TerminalElement,
  getText: () => string
): () => void {
  return bindDerivedToElement(element, 'content', getText)
}

/**
 * Creates a reactive style binding
 * Useful for elements that need dynamic styling
 */
export function createStyleBinding(
  element: TerminalElement,
  getStyle: () => { fg?: string; bg?: string; border?: any }
): () => void {
  const bridge = createReactiveBridge(element)
  
  let cleanup: (() => void) | null = null
  
  // Import effect dynamically
  import('svelte/internal/client').then(({ effect }) => {
    cleanup = effect(() => {
      const style = getStyle()
      const updates: any = {}
      
      if (style.fg !== undefined) updates.fg = style.fg
      if (style.bg !== undefined) updates.bg = style.bg
      if (style.border !== undefined) updates.border = style.border
      
      bridge.updateProps({ style: updates })
    })
  }).catch(e => {
    console.warn('Failed to create style binding:', e)
  })
  
  return () => {
    cleanup?.()
    bridge.destroy()
  }
}

/**
 * Helper to create position bindings for dynamic layouts
 */
export function createPositionBinding(
  element: TerminalElement,
  getPosition: () => {
    top?: number | string
    left?: number | string
    width?: number | string
    height?: number | string
    right?: number | string
    bottom?: number | string
  }
): () => void {
  const bridge = createReactiveBridge(element)
  
  let cleanup: (() => void) | null = null
  
  // Import effect dynamically
  import('svelte/internal/client').then(({ effect }) => {
    cleanup = effect(() => {
      const position = getPosition()
      bridge.updateProps(position)
    })
  }).catch(e => {
    console.warn('Failed to create position binding:', e)
  })
  
  return () => {
    cleanup?.()
    bridge.destroy()
  }
}