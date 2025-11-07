<script lang="ts">
import { getEngine } from '../core/state/engine.svelte.ts'
import { keyboard, type KeyboardEvent } from '../input/keyboard.svelte.ts'
import { onMount, onDestroy } from 'svelte'

const engine = getEngine()

// Props
interface InputProps {
  value?: string
  placeholder?: string
  maxLength?: number
  onchange?: (value: string) => void
  onkeydown?: (event: KeyboardEvent) => void
  onfocus?: () => void
  onblur?: () => void
  x?: number
  y?: number
  width?: number
}

let {
  value = $bindable(''),
  placeholder = '',
  maxLength = -1,
  onchange,
  onkeydown,
  onfocus,
  onblur,
  x = 0,
  y = 0,
  width = 20,
}: InputProps = $props()

// Create component in engine
const id = `input-${Math.random()}`
const index = engine().allocateIndex(id)

// Set component type
engine().componentType[index] = 4 // INPUT

// Initialize positions - update when props change!
$effect(() => {
  engine().positions[index * 4] = x
  engine().positions[index * 4 + 1] = y
  engine().positions[index * 4 + 2] = width
  engine().positions[index * 4 + 3] = 1
})

// Update input properties when they change
$effect(() => {
  engine().inputValue[index] = value
  engine().cursorPosition[index] = value.length
})

$effect(() => {
  engine().placeholder[index] = placeholder
  engine().maxLength[index] = maxLength
})
engine().focusable[index] = true
engine().tabIndex[index] = 0
engine().visibility[index] = true

// Subscribe to keyboard events when focused
let unsubscribeKeyboard: (() => void) | null = null

onMount(() => {
  unsubscribeKeyboard = keyboard.onFocused(index, (event: KeyboardEvent) => {
    // Call user's handler first
    if (onkeydown) {
      onkeydown(event)
      // Check if event was consumed by user handler
      // For now, assume it wasn't unless they return true
    }
    
    // Default input behavior
    const cursor = engine().cursorPosition[index]
    const key = event.key
    
    if (key.length === 1 && !event.ctrlKey && !event.altKey && key.charCodeAt(0) >= 32) {
      if (maxLength === -1 || value.length < maxLength) {
        value = value.slice(0, cursor) + key + value.slice(cursor)
        engine().inputValue[index] = value
        engine().cursorPosition[index]++
        onchange?.(value)
      }
      return true // Consume the event
    } else if (key === 'Backspace' && cursor > 0) {
      value = value.slice(0, cursor - 1) + value.slice(cursor)
      engine().inputValue[index] = value
      engine().cursorPosition[index]--
      onchange?.(value)
      return true
    } else if (key === 'Delete' && cursor < value.length) {
      value = value.slice(0, cursor) + value.slice(cursor + 1)
      engine().inputValue[index] = value
      onchange?.(value)
      return true
    } else if (key === 'ArrowLeft' && cursor > 0) {
      engine().cursorPosition[index]--
      return true
    } else if (key === 'ArrowRight' && cursor < value.length) {
      engine().cursorPosition[index]++
      return true
    } else if (key === 'Home') {
      engine().cursorPosition[index] = 0
      return true
    } else if (key === 'End') {
      engine().cursorPosition[index] = value.length
      return true
    } else if (key === 'Ctrl+A') {
      engine().selectionStart[index] = 0
      engine().selectionEnd[index] = value.length
      return true
    } else if (key === 'Ctrl+K') {
      value = value.slice(0, cursor)
      engine().inputValue[index] = value
      onchange?.(value)
      return true
    } else if (key === 'Ctrl+U') {
      value = value.slice(cursor)
      engine().inputValue[index] = value
      engine().cursorPosition[index] = 0
      onchange?.(value)
      return true
    }
  })
})

// Watch focus state reactively
const isFocused = $derived(engine().focusedIndex === index)
let wasFocused = false

// Call handlers when focus changes
$effect(() => {
  if (isFocused && !wasFocused) {
    onfocus?.()
    wasFocused = true
  } else if (!isFocused && wasFocused) {
    onblur?.()
    wasFocused = false
  }
})

// Cleanup
onDestroy(() => {
  if (unsubscribeKeyboard) unsubscribeKeyboard()
  engine().releaseIndex(id)
})
</script>