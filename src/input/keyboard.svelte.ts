// ============================================================================
// SVELTUI V2 - KEYBOARD MODULE
// Hybrid API: Reactive state + imperative event handlers
//
// Reactive (for templates/derived):
//   keyboard.lastEvent  - KeyboardEvent | null
//   keyboard.lastKey    - string
//
// Imperative (for handling events):
//   keyboard.on(handler)           - subscribe to all keys
//   keyboard.onKey('Enter', fn)    - specific key callback
//   keyboard.onFocused(index, fn)  - when component focused
// ============================================================================

import { createSubscriber } from 'svelte/reactivity'
import { getEngine, focus } from '../core/state/engine.svelte.ts'

const engine = getEngine()

// ============================================================================
// KEYBOARD EVENT TYPE
// ============================================================================

export interface KeyboardEvent {
  key: string // Normalized key like 'Enter', 'a', 'ArrowUp'
  raw: string // Raw terminal input
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
}

// ============================================================================
// EVENT EMITTER
// ============================================================================

type KeyHandler = (event: KeyboardEvent) => void | boolean
const listeners = new Set<KeyHandler>()

// ============================================================================
// REACTIVE STATE (via createSubscriber)
// ============================================================================

// Internal state for last event
let _lastEvent: KeyboardEvent | null = null

// Reactive update function - called when key is pressed
let reactiveUpdate: (() => void) | null = null

// Create subscriber for reactive access
const subscribe = createSubscriber((update) => {
  // Store the update function so we can call it when keys are pressed
  reactiveUpdate = update

  // Cleanup when no effects are reading anymore
  return () => {
    reactiveUpdate = null
  }
})

// Key code mapping for special keys
const KEY_MAP: Record<string, string> = {
  '\x1b[A': 'ArrowUp',
  '\x1b[B': 'ArrowDown',
  '\x1b[C': 'ArrowRight',
  '\x1b[D': 'ArrowLeft',
  '\x1b[H': 'Home',
  '\x1b[F': 'End',
  '\x1b[5~': 'PageUp',
  '\x1b[6~': 'PageDown',
  '\x09': 'Tab',
  // '\t': 'Tab',
  '\x1b[Z': 'Shift+Tab',
  '\x0d': 'Enter',
  // '\r': 'Enter',
  '\x1b': 'Escape',
  '\x7f': 'Backspace',
  '\x08': 'Backspace',
  '\x1b[3~': 'Delete',
  '\x03': 'Ctrl+C',
  '\x01': 'Ctrl+A',
  '\x05': 'Ctrl+E',
  '\x0b': 'Ctrl+K',
  '\x15': 'Ctrl+U',
  '\x10': 'Ctrl+P',
}

// ============================================================================
// STDIN LISTENER
// ============================================================================

let initialized = false

function initialize() {
  if (initialized || !process.stdin.isTTY) return
  initialized = true

  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  process.stdin.on('data', (data: Buffer | string) => {
    const raw = data.toString()
    const key = KEY_MAP[raw] || raw

    // Create event
    const event: KeyboardEvent = {
      key,
      raw,
      ctrlKey:
        key.includes('Ctrl+') ||
        (raw.charCodeAt(0) < 32 &&
          raw !== '\t' &&
          raw !== '\r' &&
          raw !== '\x1b'),
      shiftKey: key.includes('Shift+') || (raw >= 'A' && raw <= 'Z'),
      altKey: key.includes('Alt+'),
      metaKey: key.includes('Meta+'),
    }

    // Update reactive state
    _lastEvent = event

    // Notify reactive subscribers (effects/templates reading lastEvent/lastKey)
    if (reactiveUpdate) {
      reactiveUpdate()
    }

    // System-level handling (always happens)
    if (key === 'Ctrl+C') {
      cleanup()
      process.exit(0)
    }

    // Emit to all listeners
    for (const handler of listeners) {
      const consumed = handler(event)
      if (consumed === true) break // Stop propagation if consumed
    }
  })
}

function cleanup() {
  initialized = false
  listeners.clear()
  _lastEvent = null
  reactiveUpdate = null
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false)
    process.stdin.pause()
  }
  process.stdout.write('\x1b[?25h') // Show cursor
}

// ============================================================================
// PUBLIC API
// ============================================================================

// ----------------------------------------------------------------------------
// REACTIVE GETTERS (for templates and derived values)
// ----------------------------------------------------------------------------

/**
 * Get the last keyboard event (reactive)
 * Reading this in an effect or template will re-run when a key is pressed
 */
function getLastEvent(): KeyboardEvent | null {
  subscribe() // Make this reactive
  return _lastEvent
}

/**
 * Get the last key pressed (reactive)
 * Shorthand for keyboard.lastEvent?.key
 */
function getLastKey(): string {
  subscribe() // Make this reactive
  return _lastEvent?.key ?? ''
}

// ----------------------------------------------------------------------------
// IMPERATIVE API (for event handling)
// ----------------------------------------------------------------------------

/**
 * Subscribe to keyboard events
 * @param handler - Function to handle keyboard events, return true to stop propagation
 * @returns Cleanup function to unsubscribe
 */
export function on(handler: KeyHandler): () => void {
  // Initialize on first subscriber
  if (!initialized) initialize()

  listeners.add(handler)

  // Return cleanup function
  return () => {
    listeners.delete(handler)
  }
}

/**
 * Subscribe to a specific key
 * @param key - Key to listen for (e.g. 'Enter', 'a', 'ArrowUp')
 * @param handler - Function to call when key is pressed
 * @returns Cleanup function to unsubscribe
 */
export function onKey(key: string | string[], handler: () => void): () => void {
  const keys = Array.isArray(key) ? key : [key]

  return on((event) => {
    if (keys.includes(event.key)) {
      handler()
      return true // Consume the event
    }
  })
}

/**
 * Subscribe to keyboard events only when a component is focused
 * @param index - Component index
 * @param handler - Function to handle keyboard events
 * @returns Cleanup function to unsubscribe
 */
export function onFocused(index: number, handler: KeyHandler): () => void {
  return on((event) => {
    if (focus.value === index) {
      return handler(event)
    }
  })
}

// ============================================================================
// FOCUS HELPERS
// ============================================================================

export function focusNext() {
  const next = engine().nextFocusableIndex
  if (next !== -1) {
    focus.value = next
  }
}

export function focusPrevious() {
  const prev = engine().previousFocusableIndex
  if (prev !== -1) {
    focus.value = prev
  }
}

export function clearFocus() {
  focus.value = -1
}

// ============================================================================
// EXPORT EVERYTHING
// ============================================================================

export const keyboard = {
  // Reactive getters (for templates/derived)
  get lastEvent() {
    return getLastEvent()
  },
  get lastKey() {
    return getLastKey()
  },

  // Imperative API (for event handling)
  on,
  onKey,
  onFocused,

  // Focus management
  focusNext,
  focusPrevious,
  clearFocus,

  // Lifecycle
  initialize,
  cleanup,
}
