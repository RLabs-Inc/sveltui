/**
 * Layout Utilities for SvelTUI
 * 
 * Helper functions for layout calculations, constraints, and common patterns.
 * Integrates with existing position-utils.ts for blessed compatibility.
 */

import type { TerminalElement } from '../dom/elements'
import { 
  calculateElementPosition, 
  calculateHorizontalPosition, 
  calculateVerticalPosition,
  getParentDimensions,
  type PositionContext
} from '../dom/position-utils'
import type { LayoutConstraints } from './layout-context.svelte.ts'

/**
 * Common layout patterns
 */
export enum LayoutPattern {
  /** Elements arranged in a single column */
  VERTICAL_STACK = 'vertical_stack',
  
  /** Elements arranged in a single row */
  HORIZONTAL_STACK = 'horizontal_stack',
  
  /** Elements in a grid */
  GRID = 'grid',
  
  /** Elements wrapped when they exceed container width */
  WRAP = 'wrap',
  
  /** Elements absolutely positioned */
  ABSOLUTE = 'absolute',
  
  /** Elements centered in container */
  CENTER = 'center',
  
  /** Elements fill container equally */
  FILL = 'fill'
}

/**
 * Grid layout options
 */
export interface GridLayoutOptions {
  /** Number of columns */
  columns: number
  
  /** Number of rows (optional, will auto-calculate) */
  rows?: number
  
  /** Gap between cells */
  gap?: number
  
  /** Cell width (auto-calculated if not specified) */
  cellWidth?: number
  
  /** Cell height (auto-calculated if not specified) */
  cellHeight?: number
}

/**
 * Calculate positions for elements based on a layout pattern
 */
export function calculatePatternLayout(
  elements: TerminalElement[],
  pattern: LayoutPattern,
  containerWidth: number,
  containerHeight: number,
  options: any = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  switch (pattern) {
    case LayoutPattern.VERTICAL_STACK:
      return calculateVerticalStack(elements, containerWidth, containerHeight, options)
    
    case LayoutPattern.HORIZONTAL_STACK:
      return calculateHorizontalStack(elements, containerWidth, containerHeight, options)
    
    case LayoutPattern.GRID:
      return calculateGridLayout(elements, containerWidth, containerHeight, options)
    
    case LayoutPattern.WRAP:
      return calculateWrapLayout(elements, containerWidth, containerHeight, options)
    
    case LayoutPattern.CENTER:
      return calculateCenterLayout(elements, containerWidth, containerHeight, options)
    
    case LayoutPattern.FILL:
      return calculateFillLayout(elements, containerWidth, containerHeight, options)
    
    default:
      // Absolute positioning - use existing positions
      return elements.map(el => ({
        x: el.props.left || 0,
        y: el.props.top || 0,
        width: el.props.width || containerWidth,
        height: el.props.height || containerHeight
      }))
  }
}

/**
 * Calculate vertical stack layout
 */
function calculateVerticalStack(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: { gap?: number; padding?: number } = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  const gap = options.gap || 0
  const padding = options.padding || 0
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  let currentY = padding
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2
  
  // Calculate total fixed height and flex items
  let totalFixedHeight = 0
  let flexItems = 0
  
  for (const element of elements) {
    if (typeof element.props.height === 'number') {
      totalFixedHeight += element.props.height
    } else {
      flexItems++
    }
  }
  
  // Calculate flex height
  const totalGaps = Math.max(0, elements.length - 1) * gap
  const remainingHeight = availableHeight - totalFixedHeight - totalGaps
  const flexHeight = flexItems > 0 ? Math.max(1, Math.floor(remainingHeight / flexItems)) : 0
  
  // Position elements
  for (const element of elements) {
    const width = typeof element.props.width === 'number' 
      ? Math.min(element.props.width, availableWidth)
      : availableWidth
    
    const height = typeof element.props.height === 'number'
      ? element.props.height
      : flexHeight
    
    // Center horizontally if width is less than available
    const x = padding + Math.floor((availableWidth - width) / 2)
    
    positions.push({ x, y: currentY, width, height })
    currentY += height + gap
  }
  
  return positions
}

/**
 * Calculate horizontal stack layout
 */
function calculateHorizontalStack(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: { gap?: number; padding?: number } = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  const gap = options.gap || 0
  const padding = options.padding || 0
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  let currentX = padding
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2
  
  // Calculate total fixed width and flex items
  let totalFixedWidth = 0
  let flexItems = 0
  
  for (const element of elements) {
    if (typeof element.props.width === 'number') {
      totalFixedWidth += element.props.width
    } else {
      flexItems++
    }
  }
  
  // Calculate flex width
  const totalGaps = Math.max(0, elements.length - 1) * gap
  const remainingWidth = availableWidth - totalFixedWidth - totalGaps
  const flexWidth = flexItems > 0 ? Math.max(1, Math.floor(remainingWidth / flexItems)) : 0
  
  // Position elements
  for (const element of elements) {
    const width = typeof element.props.width === 'number'
      ? element.props.width
      : flexWidth
    
    const height = typeof element.props.height === 'number'
      ? Math.min(element.props.height, availableHeight)
      : availableHeight
    
    // Center vertically if height is less than available
    const y = padding + Math.floor((availableHeight - height) / 2)
    
    positions.push({ x: currentX, y, width, height })
    currentX += width + gap
  }
  
  return positions
}

/**
 * Calculate grid layout
 */
function calculateGridLayout(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: GridLayoutOptions
): Array<{ x: number; y: number; width: number; height: number }> {
  const { columns, gap = 0 } = options
  const padding = gap // Use gap as padding too
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  // Calculate cell dimensions
  const availableWidth = containerWidth - padding * 2 - gap * (columns - 1)
  const availableHeight = containerHeight - padding * 2
  
  const cellWidth = options.cellWidth || Math.floor(availableWidth / columns)
  const rows = options.rows || Math.ceil(elements.length / columns)
  const cellHeight = options.cellHeight || Math.floor((availableHeight - gap * (rows - 1)) / rows)
  
  // Position elements in grid
  for (let i = 0; i < elements.length; i++) {
    const col = i % columns
    const row = Math.floor(i / columns)
    
    const x = padding + col * (cellWidth + gap)
    const y = padding + row * (cellHeight + gap)
    
    positions.push({ x, y, width: cellWidth, height: cellHeight })
  }
  
  return positions
}

/**
 * Calculate wrap layout
 */
function calculateWrapLayout(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: { gap?: number; padding?: number; itemWidth?: number } = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  const gap = options.gap || 1
  const padding = options.padding || 0
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  const availableWidth = containerWidth - padding * 2
  let currentX = padding
  let currentY = padding
  let rowHeight = 0
  
  for (const element of elements) {
    const width = options.itemWidth || 
      (typeof element.props.width === 'number' ? element.props.width : 10)
    const height = typeof element.props.height === 'number' ? element.props.height : 3
    
    // Check if we need to wrap to next line
    if (currentX + width > containerWidth - padding && currentX > padding) {
      currentX = padding
      currentY += rowHeight + gap
      rowHeight = 0
    }
    
    positions.push({ x: currentX, y: currentY, width, height })
    
    currentX += width + gap
    rowHeight = Math.max(rowHeight, height)
  }
  
  return positions
}

/**
 * Calculate center layout
 */
function calculateCenterLayout(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: { gap?: number } = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  const gap = options.gap || 1
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  // Calculate total height needed
  let totalHeight = 0
  const heights: number[] = []
  
  for (const element of elements) {
    const height = typeof element.props.height === 'number' ? element.props.height : 3
    heights.push(height)
    totalHeight += height
  }
  
  totalHeight += gap * (elements.length - 1)
  
  // Start position for vertical centering
  let currentY = Math.floor((containerHeight - totalHeight) / 2)
  
  // Position elements
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const width = typeof element.props.width === 'number' 
      ? element.props.width 
      : Math.floor(containerWidth * 0.8) // 80% of container
    const height = heights[i]
    
    // Center horizontally
    const x = Math.floor((containerWidth - width) / 2)
    
    positions.push({ x, y: currentY, width, height })
    currentY += height + gap
  }
  
  return positions
}

/**
 * Calculate fill layout
 */
function calculateFillLayout(
  elements: TerminalElement[],
  containerWidth: number,
  containerHeight: number,
  options: { direction?: 'horizontal' | 'vertical' } = {}
): Array<{ x: number; y: number; width: number; height: number }> {
  const direction = options.direction || 'vertical'
  const positions: Array<{ x: number; y: number; width: number; height: number }> = []
  
  if (elements.length === 0) return positions
  
  if (direction === 'vertical') {
    const itemHeight = Math.floor(containerHeight / elements.length)
    const remainder = containerHeight % elements.length
    
    let currentY = 0
    for (let i = 0; i < elements.length; i++) {
      // Add remainder pixels to first items
      const height = itemHeight + (i < remainder ? 1 : 0)
      
      positions.push({
        x: 0,
        y: currentY,
        width: containerWidth,
        height
      })
      
      currentY += height
    }
  } else {
    const itemWidth = Math.floor(containerWidth / elements.length)
    const remainder = containerWidth % elements.length
    
    let currentX = 0
    for (let i = 0; i < elements.length; i++) {
      // Add remainder pixels to first items
      const width = itemWidth + (i < remainder ? 1 : 0)
      
      positions.push({
        x: currentX,
        y: 0,
        width,
        height: containerHeight
      })
      
      currentX += width
    }
  }
  
  return positions
}

/**
 * Apply constraints to a calculated position
 */
export function applyConstraints(
  position: { x: number; y: number; width: number; height: number },
  constraints: LayoutConstraints,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; width: number; height: number } {
  let { x, y, width, height } = position
  
  // Apply width constraints
  if (constraints.minWidth !== undefined) {
    width = Math.max(width, constraints.minWidth)
  }
  if (constraints.maxWidth !== undefined) {
    width = Math.min(width, constraints.maxWidth)
  }
  
  // Apply height constraints
  if (constraints.minHeight !== undefined) {
    height = Math.max(height, constraints.minHeight)
  }
  if (constraints.maxHeight !== undefined) {
    height = Math.min(height, constraints.maxHeight)
  }
  
  // Apply aspect ratio constraint
  if (constraints.aspectRatio !== undefined) {
    const currentRatio = width / height
    if (currentRatio > constraints.aspectRatio) {
      // Too wide, adjust width
      width = Math.floor(height * constraints.aspectRatio)
    } else if (currentRatio < constraints.aspectRatio) {
      // Too tall, adjust height
      height = Math.floor(width / constraints.aspectRatio)
    }
  }
  
  // Ensure we don't exceed container bounds
  width = Math.min(width, containerWidth - x)
  height = Math.min(height, containerHeight - y)
  
  // Re-center if needed after constraint application
  if (x + width > containerWidth) {
    x = Math.max(0, containerWidth - width)
  }
  if (y + height > containerHeight) {
    y = Math.max(0, containerHeight - height)
  }
  
  return { x, y, width, height }
}

/**
 * Calculate relative position based on another element
 */
export function calculateRelativePosition(
  element: TerminalElement,
  relativeTo: TerminalElement,
  offset: { x?: number; y?: number } = {}
): { x: number; y: number } {
  const relativePos = {
    x: relativeTo.props.left || 0,
    y: relativeTo.props.top || 0
  }
  
  const relativeSize = {
    width: relativeTo.props.width || 0,
    height: relativeTo.props.height || 0
  }
  
  // Calculate position relative to the other element
  let x = relativePos.x + (offset.x || 0)
  let y = relativePos.y + (offset.y || 0)
  
  // Handle special offset values
  if (element.props.left === 'after') {
    x = relativePos.x + (typeof relativeSize.width === 'number' ? relativeSize.width : 0)
  } else if (element.props.left === 'before') {
    x = relativePos.x - (typeof element.props.width === 'number' ? element.props.width : 0)
  }
  
  if (element.props.top === 'below') {
    y = relativePos.y + (typeof relativeSize.height === 'number' ? relativeSize.height : 0)
  } else if (element.props.top === 'above') {
    y = relativePos.y - (typeof element.props.height === 'number' ? element.props.height : 0)
  }
  
  return { x, y }
}

/**
 * Calculate responsive dimensions based on screen size
 */
export function calculateResponsiveDimensions(
  screenWidth: number,
  screenHeight: number,
  breakpoints: {
    small?: { width?: number | string; height?: number | string }
    medium?: { width?: number | string; height?: number | string }
    large?: { width?: number | string; height?: number | string }
  }
): { width: number | string; height: number | string } {
  // Define breakpoint thresholds
  const SMALL = 40
  const MEDIUM = 80
  
  let config = breakpoints.large || {}
  
  if (screenWidth < SMALL) {
    config = breakpoints.small || config
  } else if (screenWidth < MEDIUM) {
    config = breakpoints.medium || config
  }
  
  return {
    width: config.width || '100%',
    height: config.height || '100%'
  }
}

/**
 * Create layout helper functions for common patterns
 */
export const layoutHelpers = {
  /** Create a centered modal-like layout */
  modal: (width: number | string = '80%', height: number | string = '60%') => ({
    position: 'absolute' as const,
    left: 'center',
    top: 'center',
    width,
    height
  }),
  
  /** Create a full-screen layout */
  fullscreen: () => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
  }),
  
  /** Create a sidebar layout */
  sidebar: (side: 'left' | 'right' = 'left', width: number | string = 20) => ({
    position: 'absolute' as const,
    [side]: 0,
    top: 0,
    width,
    height: '100%'
  }),
  
  /** Create a header/footer layout */
  bar: (position: 'top' | 'bottom' = 'top', height: number = 3) => ({
    position: 'absolute' as const,
    left: 0,
    [position]: 0,
    width: '100%',
    height
  })
}