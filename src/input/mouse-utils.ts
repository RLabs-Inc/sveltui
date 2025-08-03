/**
 * Mouse Utilities for SvelTUI
 * 
 * Provides utilities for mouse position calculations, hit testing,
 * and coordinate transformations for terminal elements.
 */

import type { TerminalElement } from '../dom/elements'
import type { Widgets } from 'blessed'

/**
 * Convert screen coordinates to element-relative coordinates
 */
export function convertToElementCoordinates(
  element: TerminalElement,
  screenX: number,
  screenY: number
): { x: number, y: number } | null {
  const bounds = getElementBounds(element)
  if (!bounds) return null
  
  // Check if point is within element bounds
  if (
    screenX < bounds.left ||
    screenX >= bounds.left + bounds.width ||
    screenY < bounds.top ||
    screenY >= bounds.top + bounds.height
  ) {
    return null
  }
  
  // Convert to element-relative coordinates
  return {
    x: screenX - bounds.left,
    y: screenY - bounds.top
  }
}

/**
 * Get absolute bounds of an element on screen
 */
export function getElementBounds(element: TerminalElement): {
  left: number
  top: number
  width: number
  height: number
} | null {
  if (!element.blessed) return null
  
  const blessed = element.blessed
  
  // Get absolute position (blessed provides screen-relative coords)
  const left = blessed.aleft ?? blessed.left ?? 0
  const top = blessed.atop ?? blessed.top ?? 0
  const width = blessed.width ?? 0
  const height = blessed.height ?? 0
  
  return {
    left: typeof left === 'number' ? left : 0,
    top: typeof top === 'number' ? top : 0,
    width: typeof width === 'number' ? width : 0,
    height: typeof height === 'number' ? height : 0
  }
}

/**
 * Test if a point is within an element's bounds
 */
export function hitTest(
  element: TerminalElement,
  x: number,
  y: number
): boolean {
  const bounds = getElementBounds(element)
  if (!bounds) return false
  
  return (
    x >= bounds.left &&
    x < bounds.left + bounds.width &&
    y >= bounds.top &&
    y < bounds.top + bounds.height
  )
}

/**
 * Find the element at a given screen position
 * Performs depth-first search to find the deepest element
 */
export function getElementAtPosition(
  root: TerminalElement,
  x: number,
  y: number
): TerminalElement | null {
  // First check if root element contains the point
  if (!hitTest(root, x, y)) {
    return null
  }
  
  // Check children in reverse order (top to bottom in z-order)
  for (let i = root.children.length - 1; i >= 0; i--) {
    const child = root.children[i]
    
    // Skip hidden elements
    if (child.blessed && child.blessed.hidden) {
      continue
    }
    
    // Recursively check child and its descendants
    const found = getElementAtPosition(child, x, y)
    if (found) {
      return found
    }
  }
  
  // If no child contains the point, return the root
  return root
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate angle between two points in radians
 */
export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1)
}

/**
 * Normalize mouse event data from blessed
 */
export function normalizeMouseEvent(blessedData: any): {
  x: number
  y: number
  button: 'left' | 'middle' | 'right' | null
  shift: boolean
  ctrl: boolean
  meta: boolean
  action: 'mousedown' | 'mouseup' | 'mousemove' | 'wheel' | null
} {
  // Extract coordinates
  const x = blessedData.x ?? 0
  const y = blessedData.y ?? 0
  
  // Map button
  let button: 'left' | 'middle' | 'right' | null = null
  if (blessedData.button === 'left' || blessedData.button === 0) {
    button = 'left'
  } else if (blessedData.button === 'middle' || blessedData.button === 1) {
    button = 'middle'
  } else if (blessedData.button === 'right' || blessedData.button === 2) {
    button = 'right'
  }
  
  // Map action
  let action: 'mousedown' | 'mouseup' | 'mousemove' | 'wheel' | null = null
  if (blessedData.action === 'mousedown') {
    action = 'mousedown'
  } else if (blessedData.action === 'mouseup') {
    action = 'mouseup'
  } else if (blessedData.action === 'mousemove') {
    action = 'mousemove'
  } else if (blessedData.action === 'wheelup' || blessedData.action === 'wheeldown') {
    action = 'wheel'
  }
  
  return {
    x,
    y,
    button,
    shift: blessedData.shift ?? false,
    ctrl: blessedData.ctrl ?? false,
    meta: blessedData.meta ?? false,
    action
  }
}

/**
 * Check if element supports drag operations
 */
export function isDraggable(element: TerminalElement): boolean {
  // Check for draggable prop
  if (element.props.draggable === true) {
    return true
  }
  
  // Check if element has drag-related event handlers
  if (
    element.props.onDragStart ||
    element.props.onDrag ||
    element.props.onDragEnd
  ) {
    return true
  }
  
  return false
}

/**
 * Check if element can receive drop operations
 */
export function isDropTarget(element: TerminalElement): boolean {
  // Check for droppable prop
  if (element.props.droppable === true) {
    return true
  }
  
  // Check if element has drop-related event handlers
  if (
    element.props.onDragEnter ||
    element.props.onDragOver ||
    element.props.onDragLeave ||
    element.props.onDrop
  ) {
    return true
  }
  
  return false
}

/**
 * Calculate drag offset from initial mouse position
 */
export function calculateDragOffset(
  element: TerminalElement,
  mouseX: number,
  mouseY: number
): { offsetX: number, offsetY: number } | null {
  const bounds = getElementBounds(element)
  if (!bounds) return null
  
  return {
    offsetX: mouseX - bounds.left,
    offsetY: mouseY - bounds.top
  }
}

/**
 * Apply drag constraints to new position
 */
export function applyDragConstraints(
  x: number,
  y: number,
  width: number,
  height: number,
  constraints?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
    snapToGrid?: number
  }
): { x: number, y: number } {
  let newX = x
  let newY = y
  
  if (constraints) {
    // Apply min/max constraints
    if (constraints.minX !== undefined) {
      newX = Math.max(constraints.minX, newX)
    }
    if (constraints.maxX !== undefined) {
      newX = Math.min(constraints.maxX - width, newX)
    }
    if (constraints.minY !== undefined) {
      newY = Math.max(constraints.minY, newY)
    }
    if (constraints.maxY !== undefined) {
      newY = Math.min(constraints.maxY - height, newY)
    }
    
    // Apply grid snapping
    if (constraints.snapToGrid) {
      const grid = constraints.snapToGrid
      newX = Math.round(newX / grid) * grid
      newY = Math.round(newY / grid) * grid
    }
  }
  
  return { x: newX, y: newY }
}

/**
 * Detect gesture from movement history
 */
export interface GestureDetection {
  type: 'swipe' | 'none'
  direction?: 'up' | 'down' | 'left' | 'right'
  velocity?: number
  distance?: number
}

export function detectGesture(
  movements: Array<{ x: number, y: number, timestamp: number }>,
  threshold: number = 50
): GestureDetection {
  if (movements.length < 2) {
    return { type: 'none' }
  }
  
  const first = movements[0]
  const last = movements[movements.length - 1]
  
  const dx = last.x - first.x
  const dy = last.y - first.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const timeDelta = last.timestamp - first.timestamp
  
  if (dist < threshold || timeDelta === 0) {
    return { type: 'none' }
  }
  
  const velocity = dist / timeDelta * 1000 // pixels per second
  
  // Determine direction based on dominant axis
  let direction: 'up' | 'down' | 'left' | 'right'
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left'
  } else {
    direction = dy > 0 ? 'down' : 'up'
  }
  
  return {
    type: 'swipe',
    direction,
    velocity,
    distance: dist
  }
}

/**
 * Create a debounced mouse handler
 */
export function createDebouncedMouseHandler<T extends (...args: any[]) => void>(
  handler: T,
  delay: number = 50
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: any[] = []
  
  const debouncedHandler = (...args: any[]) => {
    lastArgs = args
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      handler(...lastArgs)
      timeoutId = null
    }, delay)
  }
  
  return debouncedHandler as T
}

/**
 * Create a throttled mouse handler
 */
export function createThrottledMouseHandler<T extends (...args: any[]) => void>(
  handler: T,
  limit: number = 16 // ~60fps
): T {
  let lastTime = 0
  let pendingArgs: any[] | null = null
  let timeoutId: NodeJS.Timeout | null = null
  
  const throttledHandler = (...args: any[]) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastTime
    
    if (timeSinceLastCall >= limit) {
      lastTime = now
      handler(...args)
    } else {
      pendingArgs = args
      
      if (!timeoutId) {
        const remainingTime = limit - timeSinceLastCall
        timeoutId = setTimeout(() => {
          if (pendingArgs) {
            lastTime = Date.now()
            handler(...pendingArgs)
            pendingArgs = null
          }
          timeoutId = null
        }, remainingTime)
      }
    }
  }
  
  return throttledHandler as T
}