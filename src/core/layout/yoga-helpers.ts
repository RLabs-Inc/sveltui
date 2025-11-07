// ============================================================================
// YOGA HELPERS - Utilities for working directly with Yoga nodes
// Reduces duplication by using Yoga's built-in getters
// ============================================================================

import { yogaNodes } from '../state/engine.svelte.ts'

/**
 * Get the parent index of a component using Yoga's getParent
 */
export function getParentIndex(index: number): number | null {
  const node = yogaNodes[index]
  if (!node) return null
  
  const parentNode = node.getParent()
  if (!parentNode) return -1 // Root node
  
  // Find parent index by searching through nodes
  for (let i = 0; i < yogaNodes.length; i++) {
    if (yogaNodes[i] === parentNode) {
      return i
    }
  }
  
  return null
}

/**
 * Get child indices using Yoga's getChild and getChildCount
 */
export function getChildIndices(index: number): number[] {
  const node = yogaNodes[index]
  if (!node) return []
  
  const count = node.getChildCount()
  const children: number[] = []
  
  for (let i = 0; i < count; i++) {
    const childNode = node.getChild(i)
    if (!childNode) continue
    
    // Find child index
    for (let j = 0; j < yogaNodes.length; j++) {
      if (yogaNodes[j] === childNode) {
        children.push(j)
        break
      }
    }
  }
  
  return children
}

/**
 * Get computed absolute position (accounting for parent positions)
 */
export function getAbsolutePosition(index: number): { x: number, y: number } {
  const node = yogaNodes[index]
  if (!node) return { x: 0, y: 0 }
  
  const layout = node.getComputedLayout()
  let x = Math.round(layout.left)
  let y = Math.round(layout.top)
  
  // Get parent's absolute position and add to ours
  const parentNode = node.getParent()
  if (parentNode) {
    // Find parent index and recursively get its absolute position
    for (let i = 0; i < yogaNodes.length; i++) {
      if (yogaNodes[i] === parentNode) {
        const parentAbsolute = getAbsolutePosition(i)
        x += parentAbsolute.x
        y += parentAbsolute.y
        break
      }
    }
  }
  
  return { x, y }
}

/**
 * Get computed dimensions directly from yoga
 */
export function getComputedDimensions(index: number): { width: number, height: number } {
  const node = yogaNodes[index]
  if (!node) return { width: 0, height: 0 }
  
  return {
    width: Math.round(node.getComputedWidth()),
    height: Math.round(node.getComputedHeight())
  }
}

/**
 * Check if a node needs layout recalculation
 */
export function needsLayout(index: number): boolean {
  const node = yogaNodes[index]
  if (!node) return false
  
  return node.isDirty() || node.hasNewLayout()
}

/**
 * Get style value with unit information
 */
export function getStyleValue(index: number, property: 'width' | 'height' | 'flexBasis'): { value: number, unit: number } | null {
  const node = yogaNodes[index]
  if (!node) return null
  
  switch (property) {
    case 'width':
      return node.getWidth()
    case 'height':  
      return node.getHeight()
    case 'flexBasis':
      return node.getFlexBasis()
    default:
      return null
  }
}

/**
 * Get the display type of a node
 */
export function getDisplay(index: number): number {
  const node = yogaNodes[index]
  if (!node) return 0 // DISPLAY_FLEX
  
  return node.getDisplay()
}

/**
 * Get position type
 */
export function getPositionType(index: number): number {
  const node = yogaNodes[index]
  if (!node) return 1 // POSITION_TYPE_RELATIVE
  
  return node.getPositionType()
}

/**
 * Mark a subtree for layout recalculation
 */
export function markDirtyRecursive(index: number): void {
  const node = yogaNodes[index]
  if (!node) return
  
  node.markDirty()
  
  // Mark children dirty
  const count = node.getChildCount()
  for (let i = 0; i < count; i++) {
    const child = node.getChild(i)
    if (child) {
      // Find child index and recurse
      for (let j = 0; j < yogaNodes.length; j++) {
        if (yogaNodes[j] === child) {
          markDirtyRecursive(j)
          break
        }
      }
    }
  }
}

/**
 * Get computed spacing (margin, padding, border) for an edge
 */
export function getComputedSpacing(
  index: number, 
  type: 'margin' | 'padding' | 'border',
  edge: number
): number {
  const node = yogaNodes[index]
  if (!node) return 0
  
  switch (type) {
    case 'margin':
      return node.getComputedMargin(edge)
    case 'padding':
      return node.getComputedPadding(edge)
    case 'border':
      return node.getComputedBorder(edge)
    default:
      return 0
  }
}