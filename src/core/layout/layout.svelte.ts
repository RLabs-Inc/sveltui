// ============================================================================
// SVELTUI - LAYOUT SYSTEM
// Leverages Svelte's reactive arrays and bottom-up initialization
// ============================================================================

import {
  visibility,
  borderStyles,
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
  focusable,
} from '../state/engine.svelte.ts'
import { Yoga } from './yoga-instance.ts'
import { applyTerminalProps, type TerminalLayoutProps } from './yoga-props.ts'
import {
  measureText as getTextWidth,
  wrapText,
} from '../../utils/bun-text.ts'

// ============================================================================
// TEXT MEASUREMENT - Using Bun's native stringWidth for accurate Unicode support
// ============================================================================

function measureText(text: string): { width: number; height: number } {
  const lines = text.split('\n')
  return {
    width: Math.max(...lines.map((line) => getTextWidth(line)), 1),
    height: Math.max(lines.length, 1),
  }
}

// ============================================================================
// YOGA NODE SETUP
// ============================================================================

export function setupYogaNode(index: number) {
  const node = yogaNodes[index]
  if (!node) return

  const type = componentType[index]

  // Text nodes get a measure function
  if (type === ComponentType.TEXT) {
    node.setMeasureFunc(
      (width: number, widthMode: any, height: number, heightMode: any) => {
        const text = texts[index] || ''
        const { width: textWidth, height: textHeight } = measureText(text)

        // If constrained width, wrap text
        if (width && width < textWidth) {
          const wrapped = wrapText(text, Math.floor(width))
          return {
            width: Math.min(textWidth, width),
            height: wrapped.length,
          }
        }

        return { width: textWidth, height: textHeight }
      }
    )
  }
}

// ============================================================================
// LAYOUT CALCULATION
// ============================================================================

function calculateLayout() {
  // Step 1: Apply all layout props to yoga nodes
  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue

    const node = yogaNodes[i]
    if (!node) continue

    const props = (layoutProps[i] as TerminalLayoutProps) || {}
    applyTerminalProps(node, props, Yoga)

    // Handle border from borderStyles
    if (!props.borderWidth && borderStyles[i] && borderStyles[i]! > 0) {
      node.setBorder(Yoga.EDGE_ALL, 1)
    }
  }

  // Step 2: Calculate layout from root nodes
  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue

    const parentIdx = parentIndex[i]
    if (parentIdx === undefined || parentIdx >= 0) continue // Skip non-roots

    const rootNode = yogaNodes[i]
    if (!rootNode) continue

    // Use terminal dimensions for root
    // In non-fullscreen mode, use undefined height to let content determine height
    rootNode.calculateLayout(
      terminalSize.width,
      terminalSize.fullscreen ? terminalSize.height : undefined,
      Yoga.DIRECTION_LTR
    )
  }

  // Step 3: Read computed values into reactive arrays
  for (let i = 0; i < registry.nextIndex; i++) {
    if (!registry.allocatedIndices.has(i)) continue

    const node = yogaNodes[i]
    if (!node) continue

    // Get absolute position by walking up the tree
    let x = Math.round(node.getComputedLeft())
    let y = Math.round(node.getComputedTop())

    // Add parent positions for absolute coordinates
    let current = node.getParent()
    while (current) {
      x += Math.round(current.getComputedLeft())
      y += Math.round(current.getComputedTop())
      current = current.getParent()
    }

    // Update reactive arrays
    computedX[i] = x
    computedY[i] = y
    computedWidth[i] = Math.round(node.getComputedWidth())
    computedHeight[i] = Math.round(node.getComputedHeight())

    // Handle text wrapping
    if (componentType[i] === ComponentType.TEXT) {
      const text = texts[i] || ''
      const width = computedWidth[i] || 80
      wrappedLines[i] = wrapText(text, width)
    } else {
      wrappedLines[i] = []
    }

    // Simple overflow detection for scrollable containers
    if (componentType[i] === ComponentType.BOX) {
      let maxChildBottom = 0
      const childCount = node.getChildCount()

      for (let c = 0; c < childCount; c++) {
        const child = node.getChild(c)
        if (child) {
          const childBottom = child.getComputedTop() + child.getComputedHeight()
          maxChildBottom = Math.max(maxChildBottom, childBottom)
        }
      }

      const boxHeight = computedHeight[i] || 0

      if (maxChildBottom > boxHeight) {
        maxScrollOffset[i] = Math.ceil(maxChildBottom - boxHeight)
        const props = layoutProps[i] as TerminalLayoutProps
        if (!props?.overflow || props.overflow === 'scroll') {
          scrollable[i] = true
          focusable[i] = true
        }
      } else {
        maxScrollOffset[i] = 0
      }
    }
  }

  // Update content height for renderer
  if (terminalSize.fullscreen) {
    // In fullscreen mode, always use terminal height
    contentHeight.value = terminalSize.height
  } else {
    // In non-fullscreen mode, find the actual bottom of ALL visible content
    // Don't just look at root components - scan everything to find the true bottom
    let maxBottom = 0

    for (let i = 0; i < registry.nextIndex; i++) {
      if (!registry.allocatedIndices.has(i)) continue
      if (!visibility[i]) continue

      // Check the bottom edge of every visible component
      const bottom = (computedY[i] || 0) + (computedHeight[i] || 0)
      maxBottom = Math.max(maxBottom, bottom)
    }

    contentHeight.value = Math.max(maxBottom, 1)
  }
}

// ============================================================================
// REACTIVE CONTENT HEIGHT
// ============================================================================

export const contentHeight = $state({ value: 0 })

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeLayout() {
  // Create reactive effect for layout calculation
  // Svelte will automatically track dependencies accessed in calculateLayout
  $effect(() => {
    calculateLayout()
  })

  return () => {} // Cleanup handled by Svelte
}
