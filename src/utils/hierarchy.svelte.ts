// ============================================================================
// SVELTUI - HIERARCHY
// ============================================================================

import { getContext, setContext } from 'svelte'
import {
  childIndices,
  depth,
  parentIndex,
  yogaNodes,
} from '../core/state/engine.svelte.ts'

export function setupComponent(
  index: number,
  canHaveChildren: boolean = false
) {
  // Get parent from context
  const parentIdx = getContext<number | undefined>('parentIndex')

  if (parentIdx !== undefined) {
    // Child component
    parentIndex[index] = parentIdx
    if (!childIndices[parentIdx]) {
      childIndices[parentIdx] = []
    }
    childIndices[parentIdx].push(index)
    const parentDepth = depth[parentIdx]
    if (parentDepth === undefined) {
      throw new Error('Parent depth is undefined')
    }
    depth[index] = parentDepth + 1

    // Connect Yoga nodes immediately
    const childNode = yogaNodes[index]
    const parentNode = yogaNodes[parentIdx]
    if (childNode && parentNode) {
      // Defensive: if child already has a parent, remove it first
      // This handles Svelte's {#each} lifecycle where creates may happen before destroys
      const existingParent = childNode.getParent()
      if (existingParent) {
        existingParent.removeChild(childNode)
      }
      parentNode.insertChild(childNode, parentNode.getChildCount())
    }
  } else {
    // Root component
    parentIndex[index] = -1
    depth[index] = 0
  }

  // If this component can have children, provide context
  if (canHaveChildren) {
    setContext('parentIndex', index)
  }
}

export function cleanupComponent(index: number) {
  // Disconnect Yoga node from parent
  const childNode = yogaNodes[index]
  if (childNode) {
    const parentNode = childNode.getParent()
    if (parentNode) {
      parentNode.removeChild(childNode)
    }
  }

  // Remove from parent's children
  const parentIdx = parentIndex[index]
  if (parentIdx && parentIdx >= 0 && childIndices[parentIdx]) {
    const children = childIndices[parentIdx]
    const childIndex = children.indexOf(index)
    if (childIndex >= 0) {
      children.splice(childIndex, 1)
    }
  }

  // Clear own children array
  childIndices[index] = []
}
