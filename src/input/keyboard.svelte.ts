// ============================================================================
// SVELTUI V2 - KEYBOARD MODULE
// Simple event emitter for keyboard events
// Anyone can subscribe with keyboard.on('key', handler)
// ============================================================================

import { getEngine, focus } from '../core/state/engine.svelte.ts'
import { getDebugPanel } from '../debug/debug-panel.svelte.ts'

const engine = getEngine()
const debug = getDebugPanel()

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

    // Update debug panel
    debug().updateKey(key, raw)

    // System-level handling (always happens)
    if (key === 'Ctrl+C') {
      cleanup()
      process.exit(0)
    }

    // Debug panel toggle
    if (key === 'Ctrl+P') {
      debug().toggle()
      return
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
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false)
    process.stdin.pause()
  }
  process.stdout.write('\x1b[?25h') // Show cursor
}

// ============================================================================
// PUBLIC API - Simple and clean!
// ============================================================================

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
  on,
  onKey,
  onFocused,
  focusNext,
  focusPrevious,
  clearFocus,
  initialize,
  cleanup,
}
