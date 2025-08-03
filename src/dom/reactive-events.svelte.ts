/**
 * Reactive Event System for SvelTUI
 * 
 * This module provides a reactive event system that bridges blessed's EventEmitter
 * pattern with Svelte 5's reactivity. It tracks event counts and last event data
 * using $state for reactivity.
 * 
 * CRITICAL: NEVER update state inside $effect. Use $effect ONLY for side effects.
 * Use $derived for computed values.
 */

import type { Widgets } from 'blessed'
import type { TerminalElement } from './elements'

// Event data structure
export interface ReactiveEventData {
  type: string
  timestamp: number
  data: any
  target?: TerminalElement
  propagationStopped?: boolean
}

// Event handler type
export type ReactiveEventHandler = (event: ReactiveEventData) => void

/**
 * Reactive Event Emitter
 * 
 * Tracks event counts and last event data using Svelte 5's $state
 */
export class ReactiveEventEmitter {
  // Event tracking using $state
  private eventCounts = $state<Record<string, number>>({})
  private lastEvents = $state<Record<string, ReactiveEventData | null>>({})
  private eventHistory = $state<ReactiveEventData[]>([])
  private historyLimit = 50
  
  // Event handlers - not reactive, just storage
  private handlers = new Map<string, Set<ReactiveEventHandler>>()
  
  // Parent emitter for event bubbling
  private parent: ReactiveEventEmitter | null = null
  
  constructor(parent?: ReactiveEventEmitter) {
    this.parent = parent || null
  }
  
  /**
   * Get event count for a specific event type
   * This is reactive and will trigger updates when the count changes
   */
  getEventCount(eventType: string): number {
    return this.eventCounts[eventType] || 0
  }
  
  /**
   * Get last event data for a specific event type
   * This is reactive and will trigger updates when new events occur
   */
  getLastEvent(eventType: string): ReactiveEventData | null {
    return this.lastEvents[eventType] || null
  }
  
  /**
   * Get event history (limited to historyLimit)
   * This is reactive and will trigger updates when new events are added
   */
  getEventHistory(): ReactiveEventData[] {
    return this.eventHistory
  }
  
  /**
   * Get all event counts
   * This is reactive and will trigger updates when any count changes
   */
  getAllEventCounts(): Record<string, number> {
    return this.eventCounts
  }
  
  /**
   * Subscribe to an event
   */
  on(eventType: string, handler: ReactiveEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    
    this.handlers.get(eventType)!.add(handler)
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.handlers.delete(eventType)
        }
      }
    }
  }
  
  /**
   * Subscribe to an event (alias for on)
   */
  addEventListener(eventType: string, handler: ReactiveEventHandler): () => void {
    return this.on(eventType, handler)
  }
  
  /**
   * Emit an event
   * Updates reactive state and notifies handlers
   */
  emit(eventType: string, data?: any): boolean {
    const event: ReactiveEventData = {
      type: eventType,
      timestamp: Date.now(),
      data,
      propagationStopped: false
    }
    
    // Update reactive state
    this.updateEventState(event)
    
    // Call handlers
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event)
          if (event.propagationStopped) {
            return false
          }
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error)
        }
      }
    }
    
    // Bubble event to parent if not stopped
    if (!event.propagationStopped && this.parent) {
      event.target = event.target || (this as any)
      return this.parent.emit(eventType, data)
    }
    
    return true
  }
  
  /**
   * Emit an event (alias for emit)
   */
  dispatchEvent(eventType: string, data?: any): boolean {
    return this.emit(eventType, data)
  }
  
  /**
   * Update reactive event state
   * This updates the reactive state that triggers UI updates
   */
  private updateEventState(event: ReactiveEventData): void {
    // Update event count
    this.eventCounts[event.type] = (this.eventCounts[event.type] || 0) + 1
    
    // Update last event
    this.lastEvents[event.type] = event
    
    // Add to history
    this.eventHistory = [...this.eventHistory, event].slice(-this.historyLimit)
  }
  
  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }
  
  /**
   * Reset all event counts
   */
  resetCounts(): void {
    this.eventCounts = {}
  }
  
  /**
   * Set history limit
   */
  setHistoryLimit(limit: number): void {
    this.historyLimit = limit
    if (this.eventHistory.length > limit) {
      this.eventHistory = this.eventHistory.slice(-limit)
    }
  }
  
  /**
   * Stop event propagation for the current event
   */
  stopPropagation(event: ReactiveEventData): void {
    event.propagationStopped = true
  }
  
  /**
   * Get filtered event counts
   * Returns current counts filtered by the provided function
   */
  getFilteredEventCounts(filter: (eventType: string) => boolean): Record<string, number> {
    const counts = this.eventCounts
    const filtered: Record<string, number> = {}
    
    for (const [type, count] of Object.entries(counts)) {
      if (filter(type)) {
        filtered[type] = count
      }
    }
    
    return filtered
  }
  
  /**
   * Track event rate (events per second)
   * Returns current rate based on a time window
   */
  private eventRates = new Map<string, { timestamps: number[], windowMs: number }>()
  
  trackEventRate(eventType: string, windowMs: number = 1000): void {
    if (!this.eventRates.has(eventType)) {
      this.eventRates.set(eventType, { timestamps: [], windowMs })
      
      // Track timestamps when events occur
      this.on(eventType, () => {
        const rate = this.eventRates.get(eventType)!
        const now = Date.now()
        rate.timestamps.push(now)
        
        // Clean old timestamps
        const cutoff = now - rate.windowMs
        rate.timestamps = rate.timestamps.filter(t => t >= cutoff)
      })
    }
  }
  
  getEventRate(eventType: string): number {
    const rate = this.eventRates.get(eventType)
    if (!rate) return 0
    
    const now = Date.now()
    const cutoff = now - rate.windowMs
    const recentCount = rate.timestamps.filter(t => t >= cutoff).length
    return (recentCount / rate.windowMs) * 1000 // events per second
  }
}

/**
 * Create a reactive event emitter for a terminal element
 */
export function createElementEventEmitter(
  element: TerminalElement,
  parentEmitter?: ReactiveEventEmitter
): ReactiveEventEmitter {
  const emitter = new ReactiveEventEmitter(parentEmitter)
  
  // Attach to element for easy access
  ;(element as any).__reactiveEmitter = emitter
  
  return emitter
}

/**
 * Get the reactive event emitter for a terminal element
 */
export function getElementEventEmitter(element: TerminalElement): ReactiveEventEmitter | null {
  return (element as any).__reactiveEmitter || null
}

/**
 * Create a global event bus
 */
// Create global event bus lazily to ensure browser globals are set up
let _globalEventBus: ReactiveEventEmitter | null = null
export function getGlobalEventBus(): ReactiveEventEmitter {
  if (!_globalEventBus) {
    _globalEventBus = new ReactiveEventEmitter()
  }
  return _globalEventBus
}

// Export a getter that creates it lazily
export const globalEventBus = {
  get on() { return getGlobalEventBus().on.bind(getGlobalEventBus()) },
  get off() { return getGlobalEventBus().off.bind(getGlobalEventBus()) },
  get emit() { return getGlobalEventBus().emit.bind(getGlobalEventBus()) },
  get getEventCount() { return getGlobalEventBus().getEventCount.bind(getGlobalEventBus()) },
  get getLastEvent() { return getGlobalEventBus().getLastEvent.bind(getGlobalEventBus()) },
  get getAllEventCounts() { return getGlobalEventBus().getAllEventCounts.bind(getGlobalEventBus()) },
  get getRecentEvents() { return getGlobalEventBus().getRecentEvents.bind(getGlobalEventBus()) },
  get clearHistory() { return getGlobalEventBus().clearHistory.bind(getGlobalEventBus()) },
}

/**
 * Helper to create event watchers that use $effect properly
 * CRITICAL: The watcher function should only perform side effects, never update state
 */
export function createEventWatcher(
  emitter: ReactiveEventEmitter,
  eventType: string,
  sideEffect: (event: ReactiveEventData | null) => void
): () => void {
  // Use $effect to watch for changes and perform side effects
  const cleanup = $effect(() => {
    const lastEvent = emitter.getLastEvent(eventType)
    sideEffect(lastEvent)
  })
  
  return cleanup
}

/**
 * Helper to create a derived event summary
 * This should be used inside component context where $derived is available
 */
export function createEventSummary(emitter: ReactiveEventEmitter) {
  // Return a function that can be called within component context
  return () => {
    const counts = emitter.getAllEventCounts()
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const types = Object.keys(counts).length
    const mostFrequent = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
    
    return {
      total,
      types,
      mostFrequent,
      counts
    }
  }
}