/**
 * Terminal Layout Engine
 *
 * This module provides a simple layout engine for positioning terminal elements.
 * It serves as a bridge to the Yoga layout engine if available.
 */

import type { TerminalElement } from '../dom/elements'

/**
 * Layout direction
 */
export enum LayoutDirection {
  ROW = 'row',
  COLUMN = 'column',
}

/**
 * Layout justify content
 */
export enum LayoutJustify {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
}

/**
 * Layout align items
 */
export enum LayoutAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  STRETCH = 'stretch',
}

/**
 * Layout options for a container
 */
export interface LayoutOptions {
  /** Direction of the layout (row or column) */
  direction?: LayoutDirection

  /** How to justify content along the main axis */
  justifyContent?: LayoutJustify

  /** How to align items along the cross axis */
  alignItems?: LayoutAlign

  /** Whether to wrap items to multiple lines */
  wrap?: boolean

  /** Padding around the container */
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number }

  /** Gap between items */
  gap?: number
}

/**
 * Layout context for calculating positions
 */
interface LayoutContext {
  /** Width of the container */
  containerWidth: number

  /** Height of the container */
  containerHeight: number

  /** Available width for layout */
  availableWidth: number

  /** Available height for layout */
  availableHeight: number

  /** Start position for layout (x) */
  startX: number

  /** Start position for layout (y) */
  startY: number

  /** Layout options */
  options: LayoutOptions
}

/**
 * Calculated item position
 */
interface ItemPosition {
  /** X position */
  x: number

  /** Y position */
  y: number

  /** Width */
  width: number

  /** Height */
  height: number
}

/**
 * Applies layout to a container and its children
 *
 * @param container - The container element
 * @param options - Layout options
 */
export function applyLayout(
  container: TerminalElement,
  options: LayoutOptions = {}
): void {
  // Get container dimensions
  const width = getElementWidth(container)
  const height = getElementHeight(container)

  // Convert to numbers if needed (assuming 100% of parent or screen size)
  const containerWidth =
    typeof width === 'number'
      ? width
      : width === '100%'
      ? container.blessed?.screen?.width || 80
      : parseInt(width) || 80
  const containerHeight =
    typeof height === 'number'
      ? height
      : height === '100%'
      ? container.blessed?.screen?.height || 24
      : parseInt(height) || 24

  // Calculate padding
  const padding = calculatePadding(options.padding)

  // Create layout context
  const context: LayoutContext = {
    containerWidth,
    containerHeight,
    availableWidth: containerWidth - padding.left - padding.right,
    availableHeight: containerHeight - padding.top - padding.bottom,
    startX: padding.left,
    startY: padding.top,
    options: {
      direction: options.direction || LayoutDirection.COLUMN,
      justifyContent: options.justifyContent || LayoutJustify.START,
      alignItems: options.alignItems || LayoutAlign.START,
      wrap: options.wrap || false,
      gap: options.gap || 0,
      padding: options.padding,
    },
  }

  // Skip layout if invalid dimensions
  if (context.availableWidth <= 0 || context.availableHeight <= 0) {
    return
  }

  // Layout children
  layoutChildren(container, context)
}

/**
 * Layouts the children of a container
 *
 * @param container - The container element
 * @param context - The layout context
 */
function layoutChildren(
  container: TerminalElement,
  context: LayoutContext
): void {
  // Skip if no children
  if (container.children.length === 0) {
    return
  }

  // Calculate item positions based on layout direction
  const positions =
    context.options.direction === LayoutDirection.ROW
      ? layoutRow(container.children, context)
      : layoutColumn(container.children, context)

  // Apply positions to children
  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i]
    const position = positions[i]

    // Apply position
    child.setProps({
      ...child.props,
      left: context.startX + position.x,
      top: context.startY + position.y,
      width: position.width,
      height: position.height,
    })
  }
}

/**
 * Layouts items in a row
 *
 * @param items - The items to layout
 * @param context - The layout context
 * @returns The calculated item positions
 */
function layoutRow(
  items: TerminalElement[],
  context: LayoutContext
): ItemPosition[] {
  const positions: ItemPosition[] = []
  const gap = context.options.gap || 0
  const totalGap = (items.length - 1) * gap

  // Calculate fixed widths and count flex items
  let totalFixedWidth = 0
  let flexItems = 0

  for (const item of items) {
    const width = getElementWidth(item)
    if (typeof width === 'number') {
      totalFixedWidth += width
    } else {
      flexItems++
    }
  }

  // Calculate remaining width for flex items
  const remainingWidth = context.availableWidth - totalFixedWidth - totalGap
  const flexWidth =
    flexItems > 0 ? Math.max(1, Math.floor(remainingWidth / flexItems)) : 0

  // Calculate positions
  let x = 0

  for (const item of items) {
    const width =
      typeof getElementWidth(item) === 'number'
        ? (getElementWidth(item) as number)
        : flexWidth

    const height =
      typeof getElementHeight(item) === 'number'
        ? (getElementHeight(item) as number)
        : context.availableHeight

    // Calculate y position based on alignment
    let y = 0

    if (context.options.alignItems === LayoutAlign.CENTER) {
      y = Math.floor((context.availableHeight - height) / 2)
    } else if (context.options.alignItems === LayoutAlign.END) {
      y = context.availableHeight - height
    }

    // Add position
    positions.push({ x, y, width, height })

    // Update x for next item
    x += width + gap
  }

  // Apply justification
  applyJustification(
    positions,
    context.availableWidth,
    context.options.justifyContent
  )

  return positions
}

/**
 * Layouts items in a column
 *
 * @param items - The items to layout
 * @param context - The layout context
 * @returns The calculated item positions
 */
function layoutColumn(
  items: TerminalElement[],
  context: LayoutContext
): ItemPosition[] {
  const positions: ItemPosition[] = []
  const gap = context.options.gap || 0
  const totalGap = (items.length - 1) * gap

  // Calculate fixed heights and count flex items
  let totalFixedHeight = 0
  let flexItems = 0

  for (const item of items) {
    const height = getElementHeight(item)
    if (typeof height === 'number') {
      totalFixedHeight += height
    } else {
      flexItems++
    }
  }

  // Calculate remaining height for flex items
  const remainingHeight = context.availableHeight - totalFixedHeight - totalGap
  const flexHeight =
    flexItems > 0 ? Math.max(1, Math.floor(remainingHeight / flexItems)) : 0

  // Calculate positions
  let y = 0

  for (const item of items) {
    const width =
      typeof getElementWidth(item) === 'number'
        ? (getElementWidth(item) as number)
        : context.availableWidth

    const height =
      typeof getElementHeight(item) === 'number'
        ? (getElementHeight(item) as number)
        : flexHeight

    // Calculate x position based on alignment
    let x = 0

    if (context.options.alignItems === LayoutAlign.CENTER) {
      x = Math.floor((context.availableWidth - width) / 2)
    } else if (context.options.alignItems === LayoutAlign.END) {
      x = context.availableWidth - width
    }

    // Add position
    positions.push({ x, y, width, height })

    // Update y for next item
    y += height + gap
  }

  // For column layout, apply justification to the y-axis
  applyVerticalJustification(
    positions,
    context.availableHeight,
    context.options.justifyContent
  )

  return positions
}

/**
 * Applies justification to item positions on the x-axis
 *
 * @param positions - The item positions
 * @param availableWidth - The available width
 * @param justify - The justification method
 */
function applyJustification(
  positions: ItemPosition[],
  availableWidth: number,
  justify?: LayoutJustify
): void {
  if (!positions.length) return

  // Calculate total width
  const totalWidth = positions.reduce((sum, pos) => sum + pos.width, 0)

  // Calculate total gap (space between items)
  const lastPos = positions[positions.length - 1]
  const totalContentWidth = lastPos.x + lastPos.width - positions[0].x

  // Calculate remaining space
  const remainingSpace = availableWidth - totalContentWidth

  if (remainingSpace <= 0) return

  if (justify === LayoutJustify.CENTER) {
    // Center all items
    const offset = Math.floor(remainingSpace / 2)
    for (const pos of positions) {
      pos.x += offset
    }
  } else if (justify === LayoutJustify.END) {
    // Align to end
    const offset = remainingSpace
    for (const pos of positions) {
      pos.x += offset
    }
  } else if (justify === LayoutJustify.SPACE_BETWEEN && positions.length > 1) {
    // Distribute space between items
    const gap = Math.floor(remainingSpace / (positions.length - 1))
    for (let i = 1; i < positions.length; i++) {
      positions[i].x += gap * i
    }
  } else if (justify === LayoutJustify.SPACE_AROUND && positions.length > 0) {
    // Distribute space around items
    const gap = Math.floor(remainingSpace / (positions.length * 2))
    for (let i = 0; i < positions.length; i++) {
      positions[i].x += gap * (2 * i + 1)
    }
  }
}

/**
 * Applies justification to item positions on the y-axis
 *
 * @param positions - The item positions
 * @param availableHeight - The available height
 * @param justify - The justification method
 */
function applyVerticalJustification(
  positions: ItemPosition[],
  availableHeight: number,
  justify?: LayoutJustify
): void {
  if (!positions.length) return

  // Calculate total height
  const totalHeight = positions.reduce((sum, pos) => sum + pos.height, 0)

  // Calculate total gap (space between items)
  const lastPos = positions[positions.length - 1]
  const totalContentHeight = lastPos.y + lastPos.height - positions[0].y

  // Calculate remaining space
  const remainingSpace = availableHeight - totalContentHeight

  if (remainingSpace <= 0) return

  if (justify === LayoutJustify.CENTER) {
    // Center all items
    const offset = Math.floor(remainingSpace / 2)
    for (const pos of positions) {
      pos.y += offset
    }
  } else if (justify === LayoutJustify.END) {
    // Align to end
    const offset = remainingSpace
    for (const pos of positions) {
      pos.y += offset
    }
  } else if (justify === LayoutJustify.SPACE_BETWEEN && positions.length > 1) {
    // Distribute space between items
    const gap = Math.floor(remainingSpace / (positions.length - 1))
    for (let i = 1; i < positions.length; i++) {
      positions[i].y += gap * i
    }
  } else if (justify === LayoutJustify.SPACE_AROUND && positions.length > 0) {
    // Distribute space around items
    const gap = Math.floor(remainingSpace / (positions.length * 2))
    for (let i = 0; i < positions.length; i++) {
      positions[i].y += gap * (2 * i + 1)
    }
  }
}

/**
 * Calculates padding from padding option
 *
 * @param padding - The padding option
 * @returns The calculated padding
 */
function calculatePadding(
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number }
): { top: number; right: number; bottom: number; left: number } {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding }
  } else if (padding) {
    return {
      top: padding.top || 0,
      right: padding.right || 0,
      bottom: padding.bottom || 0,
      left: padding.left || 0,
    }
  } else {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
}

/**
 * Gets the width of an element
 *
 * @param element - The element
 * @returns The element width
 */
function getElementWidth(element: TerminalElement): number | string {
  return element.props.width || '100%'
}

/**
 * Gets the height of an element
 *
 * @param element - The element
 * @returns The element height
 */
function getElementHeight(element: TerminalElement): number | string {
  return element.props.height || '100%'
}

/**
 * Converts a percentage string to a number
 *
 * @param value - The value to convert
 * @param total - The total value (100%)
 * @returns The converted value
 */
export function percentToPixels(value: string, total: number): number {
  if (value.endsWith('%')) {
    const percent = parseFloat(value)
    return Math.floor((percent / 100) * total)
  }

  return 0
}

/**
 * Resolves an element's width to pixels
 *
 * @param element - The element
 * @param containerWidth - The container width
 * @returns The width in pixels
 */
export function resolveWidth(
  element: TerminalElement,
  containerWidth: number
): number {
  const width = element.props.width

  if (typeof width === 'number') {
    return width
  } else if (typeof width === 'string') {
    if (width === '100%') {
      return containerWidth
    } else if (width === 'half') {
      return Math.floor(containerWidth / 2)
    } else if (width.endsWith('%')) {
      return percentToPixels(width, containerWidth)
    }
  }

  return containerWidth // Default to full width
}

/**
 * Resolves an element's height to pixels
 *
 * @param element - The element
 * @param containerHeight - The container height
 * @returns The height in pixels
 */
export function resolveHeight(
  element: TerminalElement,
  containerHeight: number
): number {
  const height = element.props.height

  if (typeof height === 'number') {
    return height
  } else if (typeof height === 'string') {
    if (height === '100%') {
      return containerHeight
    } else if (height === 'half') {
      return Math.floor(containerHeight / 2)
    } else if (height.endsWith('%')) {
      return percentToPixels(height, containerHeight)
    }
  }

  return containerHeight // Default to full height
}
