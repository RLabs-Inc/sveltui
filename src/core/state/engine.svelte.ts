// ============================================================================
// SVELTUI V3 - CLEAN STATE ENGINE
// Direct exports for state, double function only for derived
// ============================================================================

import { SvelteMap } from 'svelte/reactivity'
import { Yoga } from '../layout/yoga-instance.ts'
import {
  HitGrid,
  MouseEventDispatcher,
  type MouseHandlers,
} from '../../input/mouse.ts'

// ============================================================================
// COMPONENT TYPE CONSTANTS
// ============================================================================

export const ComponentType = {
  TEXT: 0,
  BOX: 1,
} as const

// ============================================================================
// REGISTRY - Component ID management
// ============================================================================

export const registry = $state({
  idToIndex: new SvelteMap<string, number>(),
  indexToId: new SvelteMap<number, string>(),
  allocatedIndices: new Set<number>(),
  freeIndices: [] as number[],
  nextIndex: 0,
})

// ============================================================================
// TERMINAL STATE
// ============================================================================

export const terminalSize = $state({
  width: 80,
  height: 24,
  fullscreen: false,
})

// ============================================================================
// INPUT ARRAYS - Components write these (DIRECT EXPORTS)
// ============================================================================

// Component basics
export const componentType = $state<number[]>([])
export const visibility = $state<boolean[]>([])
export const zIndex = $state<number[]>([]) // For proper layering
export const opacity = $state<number[]>([]) // 0-100 for transparency

// Hierarchy
export const parentIndex = $state<number[]>([])
export const childIndices = $state<number[][]>([])
export const depth = $state<number[]>([])

// Text content
export const texts = $state<string[]>([])
export const wrappedLines = $state<string[][]>([]) // Wrapped text lines after layout

// Layout properties (components set these)
export const layoutProps = $state<any[]>([])

// Visual properties
export const colors = $state<(number | undefined)[]>([]) // [fg, bg] packed as index*2
export const textStyles = $state<number[]>([]) // Bit flags: 1=bold, 2=italic, 4=underline, 8=strikethrough, 16=dim, 32=blink, 64=reverse, 128=hidden
export const borderStyles = $state<number[]>([]) // 0=none, 1=single, 2=double, 3=rounded, 4=heavy, 5=dashed, 6=dotted, 7=ascii, 8=block, 9=mixedDoubleH, 10=mixedDoubleV
export const borderColors = $state<(number | undefined)[]>([]) // Border color

// Individual border control - each side can have different style
export const borderTop = $state<number[]>([]) // Top border style (0=none, 1-10=style)
export const borderBottom = $state<number[]>([]) // Bottom border style
export const borderLeft = $state<number[]>([]) // Left border style
export const borderRight = $state<number[]>([]) // Right border style

// Scrolling
export const scrollable = $state<boolean[]>([])
export const scrollOffset = $state<number[]>([]) // Current scroll position (Y axis)
export const scrollOffsetX = $state<number[]>([]) // Current scroll position (X axis)
export const maxScrollOffset = $state<number[]>([]) // Maximum scroll value (Y)
export const maxScrollOffsetX = $state<number[]>([]) // Maximum scroll value (X)

// Focus
export const focusable = $state<boolean[]>([])
export const tabIndex = $state<number[]>([])
export const focus = $state({ value: -1 })

// Cursor and selection for input fields
export const cursorPosition = $state<number[]>([]) // Cursor position in text
export const selectionStart = $state<number[]>([]) // Selection start position (-1 = no selection)
export const selectionEnd = $state<number[]>([]) // Selection end position

// Mouse support
export const mouseHandlers = $state<(MouseHandlers | null)[]>([])
export const hovered = $state<boolean[]>([])
export const pressed = $state<boolean[]>([])

// Hit testing grid - maps terminal positions to component indices
export const hitGrid = $state(new HitGrid(80, 24))
export const mouseDispatcher = $state(new MouseEventDispatcher(80, 24))

// ============================================================================
// COMPUTED ARRAYS - Layout system writes these (DIRECT EXPORTS)
// ============================================================================

// Position and size after Yoga calculation
export const computedX = $state<number[]>([])
export const computedY = $state<number[]>([])
export const computedWidth = $state<number[]>([])
export const computedHeight = $state<number[]>([])

// ============================================================================
// YOGA NODES - For layout calculation (DIRECT EXPORT)
// ============================================================================

// Internal arrays for Yoga (used by layout system)
export const yogaNodes = $state<any[]>([])

// ============================================================================
// STATE MANAGEMENT FUNCTIONS (DIRECT EXPORTS)
// ============================================================================

export function allocateIndex(id: string): number {
  // Check if already allocated
  const existing = registry.idToIndex.get(id)
  if (existing !== undefined) return existing

  // Try to reuse a free index
  let index: number
  if (registry.freeIndices.length > 0) {
    index = registry.freeIndices.pop()!
  } else {
    index = registry.nextIndex++
  }

  registry.idToIndex.set(id, index)
  registry.indexToId.set(index, id)
  registry.allocatedIndices.add(index)

  // Create Yoga node immediately
  if (!yogaNodes[index]) {
    yogaNodes[index] = Yoga.Node.create()
  }

  return index
}

export function releaseIndex(id: string): void {
  const index = registry.idToIndex.get(id)
  if (index === undefined) return

  registry.idToIndex.delete(id)
  registry.indexToId.delete(index)
  registry.allocatedIndices.delete(index)
  registry.freeIndices.push(index)

  // Clean up arrays
  componentType[index] = 0
  visibility[index] = false
  zIndex[index] = 0
  opacity[index] = 100
  parentIndex[index] = -1
  childIndices[index] = []
  depth[index] = 0
  texts[index] = ''
  wrappedLines[index] = []
  layoutProps[index] = null
  colors[index * 2] = undefined
  colors[index * 2 + 1] = undefined
  textStyles[index] = 0
  borderStyles[index] = 0
  borderColors[index] = undefined
  borderTop[index] = 0
  borderBottom[index] = 0
  borderLeft[index] = 0
  borderRight[index] = 0
  scrollable[index] = false
  scrollOffset[index] = 0
  scrollOffsetX[index] = 0
  maxScrollOffset[index] = 0
  maxScrollOffsetX[index] = 0
  focusable[index] = false
  tabIndex[index] = -1
  cursorPosition[index] = 0
  selectionStart[index] = -1
  selectionEnd[index] = -1
  mouseHandlers[index] = null
  hovered[index] = false
  pressed[index] = false

  // Remove mouse handlers from dispatcher
  mouseDispatcher.removeHandlers(index)

  // Clear computed values
  computedX[index] = 0
  computedY[index] = 0
  computedWidth[index] = 0
  computedHeight[index] = 0

  if (yogaNodes[index]) {
    yogaNodes[index].free()
    yogaNodes[index] = null
  }
}

export function setTerminalSize(width: number, height: number) {
  terminalSize.width = width
  terminalSize.height = height

  // Resize hit testing grid
  hitGrid.resize(width, height)
  mouseDispatcher.resize(width, height)
}

// ============================================================================
// DERIVED VALUES - Only these need double function pattern!
// ============================================================================

export function getEngine() {
  // Visible components sorted by z-index for rendering
  const visibleComponentsSorted = $derived.by(() => {
    const visible: number[] = []

    for (let i = 0; i < registry.nextIndex; i++) {
      if (registry.allocatedIndices.has(i) && visibility[i]) {
        visible.push(i)
      }
    }

    // Sort by zIndex (lower renders first)
    visible.sort((a, b) => (zIndex[a] || 0) - (zIndex[b] || 0))

    return visible
  })

  // Get next focusable index (for Tab navigation)
  const nextFocusableIndex = $derived.by(() => {
    const start = focus.value

    // Look forward from current position
    for (let i = start + 1; i < registry.nextIndex; i++) {
      if (registry.allocatedIndices.has(i) && focusable[i] && visibility[i]) {
        return i
      }
    }

    // Wrap around to beginning
    for (let i = 0; i <= start; i++) {
      if (registry.allocatedIndices.has(i) && focusable[i] && visibility[i]) {
        return i
      }
    }

    return -1
  })

  // Get previous focusable index (for Shift+Tab navigation)
  const previousFocusableIndex = $derived.by(() => {
    const start = focus.value

    // Look backward from current position
    for (let i = start - 1; i >= 0; i--) {
      if (registry.allocatedIndices.has(i) && focusable[i] && visibility[i]) {
        return i
      }
    }

    // Wrap around to end
    for (let i = registry.nextIndex - 1; i >= start; i--) {
      if (registry.allocatedIndices.has(i) && focusable[i] && visibility[i]) {
        return i
      }
    }

    return -1
  })

  // Only return the derived values through the double function
  return () => ({
    visibleComponentsSorted,
    nextFocusableIndex,
    previousFocusableIndex,
  })
}
