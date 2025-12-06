// ============================================================================
// SVELTUI V3 - OPTIMIZED LAYOUT SYSTEM
// Three-phase architecture: Initialize, Update, Calculate
// ============================================================================

import {
  visibility,
  borderStyles,
  childIndices,
  componentType,
  ComponentType,
  computedHeight,
  computedWidth,
  computedX,
  computedY,
  layoutProps,
  parentIndex,
  registry,
  scrollable,
  terminalSize,
  texts,
  wrappedLines,
  yogaNodes,
  maxScrollOffset,
  maxScrollOffsetX,
  focus,
  focusable,
} from '../state/engine.svelte.ts'
import {
  getAbsolutePosition,
  getComputedDimensions,
  getChildIndices,
  getParentIndex,
} from './yoga-helpers.ts'
import { Yoga } from './yoga-instance.ts'
import { wrapText, measureText } from '../../utils/text-wrap.ts'
import { applyYogaProps } from './yoga-props.ts'

// Yoga is already configured globally in yoga-instance.ts

// ============================================================================
// PHASE 1: NODE INITIALIZATION - Called once when node is created
// ============================================================================

export function initializeYogaNode(index: number, type: number) {
  const node = yogaNodes[index]
  if (!node) return

  // Set measure function for TEXT components
  if (type === ComponentType.TEXT) {
    // SIMPLE: Just return the natural text dimensions
    node.setMeasureFunc(
      (width: number, widthMode: any, height: number, heightMode: any) => {
        const text = texts[index] || ''

        // Calculate natural dimensions
        const lines = text.split('\n')
        const naturalWidth = Math.max(...lines.map((l) => measureText(l)), 1)
        const naturalHeight = Math.max(lines.length, 1)

        // Return natural dimensions - let Yoga handle the rest
        return {
          width: naturalWidth,
          height: naturalHeight,
        }
      }
    )
  }
}

// ============================================================================
// PHASE 2: NODE PROPERTY UPDATE - Called when layout props change
// ============================================================================

function updateYogaNodeProps(index: number) {
  const node = yogaNodes[index]
  if (!node) return

  const props = layoutProps[index] || {}
  const parentIdx = parentIndex[index]
  const isRoot = parentIdx ? parentIdx < 0 : false

  // Prepare context for smart defaults
  const context = {
    componentType: componentType[index],
    parentProps:
      parentIdx && (parentIdx >= 0 ? layoutProps[parentIdx] : undefined),
    isRoot,
  }

  node.setAlwaysFormsContainingBlock(true /*alwaysFormsContainingBlock*/)
  // Apply props with smart defaults using the comprehensive function
  applyYogaProps(node, props, Yoga, context)

  // Additional handling for borders based on borderStyles
  if (!props.borderWidth && borderStyles[index] && borderStyles[index] > 0) {
    // If component has a border style but no explicit borderWidth, set it to 1
    node.setBorder(Yoga.EDGE_ALL, 1)
  }
}

// ============================================================================
// PHASE 3: LAYOUT CALCULATION - Reactive, reads state and triggers layout
// ============================================================================

function calculateAndUpdateLayout() {
  // Phase 1: Update all node properties from layoutProps
  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue
    updateYogaNodeProps(i)
  }

  // Phase 3: Calculate layout for all root nodes
  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue
    const parentIdx = parentIndex[i]
    if (parentIdx && parentIdx >= 0) continue // Skip non-root

    const rootNode = yogaNodes[i]
    if (!rootNode) continue

    rootNode.calculateLayout(
      terminalSize.width,
      terminalSize.height,
      Yoga.DIRECTION_LTR
    )
  }

  // Phase 4: Write computed values to output arrays
  let maxContentHeight = 0

  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue

    const node = yogaNodes[i]
    if (!node) continue

    // Get all layout values at once - more efficient!
    const layout = node.getComputedLayout()

    // Calculate absolute position using the fixed helper
    const position = getAbsolutePosition(i)

    // Write computed values (absolute positions in terminal)
    computedX[i] = position.x
    computedY[i] = position.y
    computedWidth[i] = Math.round(layout.width)
    computedHeight[i] = Math.round(layout.height)

    // Debug output
    if (i < 5) {
      console.log(
        `Component ${i}: pos(${position.x},${position.y}) size(${Math.round(
          layout.width
        )}x${Math.round(layout.height)})`
      )
    }

    // Track max content height for root components
    const parentIdx = parentIndex[i]
    if (parentIdx && parentIdx < 0 && visibility[i]) {
      const bottom = computedY[i]! + computedHeight[i]!
      maxContentHeight = Math.max(maxContentHeight, bottom)
    }

    // Phase 5: Text wrapping and overflow detection
    if (componentType[i] === ComponentType.TEXT) {
      const text = texts[i] || ''

      // Always use parent's content width for text wrapping
      const parentIdx = parentIndex[i]
      let wrapWidth = 80 // fallback

      if (parentIdx !== undefined && parentIdx >= 0) {
        const parentNode = yogaNodes[parentIdx]
        if (parentNode) {
          // Get parent's content width (excluding padding and borders)
          const parentPaddingLeft = parentNode.getComputedPadding(
            Yoga.EDGE_LEFT
          )
          const parentPaddingRight = parentNode.getComputedPadding(
            Yoga.EDGE_RIGHT
          )
          const parentBorderLeft = parentNode.getComputedBorder(Yoga.EDGE_LEFT)
          const parentBorderRight = parentNode.getComputedBorder(
            Yoga.EDGE_RIGHT
          )

          wrapWidth =
            parentNode.getComputedWidth() -
            parentPaddingLeft -
            parentPaddingRight -
            parentBorderLeft -
            parentBorderRight
        }
      }

      // Wrap text to parent's available width
      const wrapped = wrapText(text, Math.floor(Math.max(1, wrapWidth)))
      wrappedLines[i] = wrapped

      maxScrollOffset[i] = 0
      maxScrollOffsetX[i] = 0
    } else if (componentType[i] === ComponentType.BOX) {
      // Box components: check if children overflow
      wrappedLines[i] = []

      const children = getChildIndices(i) // Use yoga helper
      if (children.length > 0) {
        let maxChildBottom = 0
        let maxChildRight = 0

        // Calculate the bounds of all children
        for (const childIdx of children) {
          if (!visibility[childIdx]) continue

          const childNode = yogaNodes[childIdx]
          if (childNode) {
            const childBottom =
              childNode.getComputedTop() + childNode.getComputedHeight()
            const childRight =
              childNode.getComputedLeft() + childNode.getComputedWidth()
            maxChildBottom = Math.max(maxChildBottom, childBottom)
            maxChildRight = Math.max(maxChildRight, childRight)
          }
        }

        // Check if content overflows the box
        const boxHeight = computedHeight[i]
        const boxWidth = computedWidth[i]
        const userProps = layoutProps[i]

        // Auto-enable scrolling if content overflows and no explicit overflow set
        if (boxHeight && maxChildBottom > boxHeight) {
          maxScrollOffset[i] = Math.ceil(maxChildBottom - boxHeight)
          // Auto-enable scrolling if overflow not explicitly set to 'hidden'
          if (!userProps?.overflow || userProps.overflow === 'auto') {
            scrollable[i] = true
            focusable[i] = true
          }
        } else {
          maxScrollOffset[i] = 0
        }

        if (boxWidth && maxChildRight > boxWidth) {
          maxScrollOffsetX[i] = Math.ceil(maxChildRight - boxWidth)
          // Auto-enable scrolling if overflow not explicitly set to 'hidden'
          if (!userProps?.overflow || userProps.overflow === 'auto') {
            scrollable[i] = true
            focusable[i] = true
          }
        } else {
          maxScrollOffsetX[i] = 0
        }
      } else {
        // No children, no overflow
        maxScrollOffset[i] = 0
        maxScrollOffsetX[i] = 0
      }
    } else {
      wrappedLines[i] = []
      maxScrollOffset[i] = 0
      maxScrollOffsetX[i] = 0
    }
  }

  // Update content height
  contentHeight.value = terminalSize.fullscreen
    ? terminalSize.height
    : Math.max(maxContentHeight, 1)
}

// ============================================================================
// CONTENT HEIGHT STATE
// ============================================================================

// Export content height for the renderer to use
export const contentHeight = $state({ value: 0 })

// ============================================================================
// EXPORT
// ============================================================================

export function initializeLayout() {
  // Create a layout effect that runs when dependencies change
  $effect(() => {
    calculateAndUpdateLayout()
  })

  // Return a cleanup function (noop for now since effects auto-cleanup)
  return () => {}
}
