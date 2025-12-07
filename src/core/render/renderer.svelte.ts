// ============================================================================
// SVELTUI - OPTIMIZED RENDERER WITH PROPER ARCHITECTURE
// Clean $derived.by frameBuffer, single $effect, uses all our utilities
// ============================================================================

import {
  registry,
  parentIndex,
  childIndices,
  terminalSize,
  componentType,
  ComponentType,
  computedX,
  computedY,
  computedWidth,
  computedHeight,
  visibility,
  zIndex,
  opacity,
  texts,
  wrappedLines,
  colors,
  textStyles,
  borderStyles,
  borderColors,
  borderTop,
  borderBottom,
  borderLeft,
  borderRight,
  scrollOffset,
  scrollOffsetX,
  scrollable,
  focus,
  cursorPosition,
  selectionStart,
  selectionEnd,
  hitGrid,
  getEngine,
} from '../state/engine.svelte.ts'
import { contentHeight } from '../layout/layout.svelte.ts'
import { getColorCode } from '../../utils/bun-color.ts'
import * as ANSI from '../../utils/ansi-codes.ts'
import { BORDERS as BORDER_STYLES } from '../../utils/borders.ts'
import { writeStdout } from '../../utils/bun-output.ts'

// ============================================================================
// CELL STRUCTURE
// ============================================================================

interface Cell {
  char: string // Direct string, not codepoint
  fg: number | undefined // Color in 0xRRGGBB format
  bg: number | undefined
  style: number // Bit flags: 1=bold, 2=italic, 4=underline, 8=strikethrough
}

// Clipping rectangle for content rendering
interface ClipRect {
  x: number
  y: number
  width: number
  height: number
}

// ============================================================================
// FRAME BUFFER CLASS
// ============================================================================

class FrameBuffer {
  cells: Cell[]
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.cells = new Array(width * height)
    this.clear()
  }

  clear() {
    const defaultCell: Cell = {
      char: ' ',
      fg: undefined,
      bg: undefined,
      style: 0,
    }
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = { ...defaultCell }
    }
  }

  setCell(x: number, y: number, cell: Partial<Cell>, clipRect?: ClipRect) {
    // Check terminal bounds
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return

    // Check clipping rectangle if provided
    if (clipRect) {
      if (x < clipRect.x || x >= clipRect.x + clipRect.width) return
      if (y < clipRect.y || y >= clipRect.y + clipRect.height) return
    }

    Object.assign(this.cells[y * this.width + x]!, cell)
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null
    return this.cells[y * this.width + x]!
  }
}

// ============================================================================
// BORDER RENDERING - Using our proper borders utility
// ============================================================================

function getBorderSet(style: number) {
  const borderMap = [
    null, // 0 = none
    BORDER_STYLES.single, // 1
    BORDER_STYLES.double, // 2
    BORDER_STYLES.rounded, // 3
    BORDER_STYLES.heavy, // 4
    BORDER_STYLES.dashed, // 5
    BORDER_STYLES.dotted, // 6
    BORDER_STYLES.ascii, // 7
    BORDER_STYLES.block, // 8
    BORDER_STYLES.mixedDoubleH, // 9
    BORDER_STYLES.mixedDoubleV, // 10
  ]
  return borderMap[style] || null
}

function renderBorder(
  buffer: FrameBuffer,
  x: number,
  y: number,
  width: number,
  height: number,
  style: number,
  color: number | undefined,
  clipRect?: ClipRect
) {
  if (style < 1 || style > 10) return
  const borderSet = getBorderSet(style)
  if (!borderSet) return

  // Top and bottom borders
  for (let dx = 1; dx < width - 1; dx++) {
    buffer.setCell(
      x + dx,
      y,
      {
        char: String.fromCharCode(borderSet.horizontal),
        fg: color,
      },
      clipRect
    )
    buffer.setCell(
      x + dx,
      y + height - 1,
      {
        char: String.fromCharCode(borderSet.horizontal),
        fg: color,
      },
      clipRect
    )
  }

  // Left and right borders
  for (let dy = 1; dy < height - 1; dy++) {
    buffer.setCell(
      x,
      y + dy,
      {
        char: String.fromCharCode(borderSet.vertical),
        fg: color,
      },
      clipRect
    )
    buffer.setCell(
      x + width - 1,
      y + dy,
      {
        char: String.fromCharCode(borderSet.vertical),
        fg: color,
      },
      clipRect
    )
  }

  // Corners
  buffer.setCell(
    x,
    y,
    {
      char: String.fromCharCode(borderSet.topLeft),
      fg: color,
    },
    clipRect
  )
  buffer.setCell(
    x + width - 1,
    y,
    {
      char: String.fromCharCode(borderSet.topRight),
      fg: color,
    },
    clipRect
  )
  buffer.setCell(
    x,
    y + height - 1,
    {
      char: String.fromCharCode(borderSet.bottomLeft),
      fg: color,
    },
    clipRect
  )
  buffer.setCell(
    x + width - 1,
    y + height - 1,
    {
      char: String.fromCharCode(borderSet.bottomRight),
      fg: color,
    },
    clipRect
  )
}

// ============================================================================
// CLIPPING HELPERS
// ============================================================================

function intersectClipRects(a: ClipRect, b: ClipRect): ClipRect | null {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)

  if (right <= x || bottom <= y) return null // No intersection

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  }
}

function getContentClipRect(
  index: number,
  parentClip?: ClipRect
): ClipRect | null {
  const x = computedX[index] || 0
  const y = computedY[index] || 0
  const width = computedWidth[index] || 0
  const height = computedHeight[index] || 0

  // Account for borders
  const borderStyle = borderStyles[index] || 0
  const hasBorder = borderStyle > 0

  const contentX = hasBorder ? x + 1 : x
  const contentY = hasBorder ? y + 1 : y
  const contentWidth = hasBorder ? Math.max(0, width - 2) : width
  const contentHeight = hasBorder ? Math.max(0, height - 2) : height

  const componentClip: ClipRect = {
    x: contentX,
    y: contentY,
    width: contentWidth,
    height: contentHeight,
  }

  // If there's a parent clip, intersect with it
  if (parentClip) {
    return intersectClipRects(componentClip, parentClip)
  }

  return componentClip
}

// ============================================================================
// COMPONENT RENDERING
// ============================================================================

function renderComponent(
  buffer: FrameBuffer,
  index: number,
  parentClip?: ClipRect,
  parentScrollY = 0,
  parentScrollX = 0
) {
  if (!visibility[index]) return

  // Apply parent's scroll offset to this component's position
  const x = (computedX[index] || 0) - parentScrollX
  const y = (computedY[index] || 0) - parentScrollY
  const width = computedWidth[index] || 0
  const height = computedHeight[index] || 0

  if (width <= 0 || height <= 0) return

  // Calculate the component's full bounds (including borders)
  const componentBounds: ClipRect = { x, y, width, height }

  // If there's a parent clip, check if this component is even visible
  if (parentClip) {
    const intersection = intersectClipRects(componentBounds, parentClip)
    if (!intersection) return // Component is completely outside parent's clip rect
  }

  // Get styles
  const fgColor = colors[index * 2]
  const bgColor = colors[index * 2 + 1]
  const textStyle = textStyles[index] || 0
  const borderStyle = borderStyles[index] || 0

  // Get scroll offset for THIS component (only if it's a scrollable BOX)
  const yOffset =
    scrollable[index] && componentType[index] === ComponentType.BOX
      ? scrollOffset[index] || 0
      : 0
  const xOffset =
    scrollable[index] && componentType[index] === ComponentType.BOX
      ? scrollOffsetX[index] || 0
      : 0

  // Fill background (respecting parent clip)
  if (bgColor !== undefined) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        buffer.setCell(x + dx, y + dy, { bg: bgColor }, parentClip)
      }
    }
  }

  // Render borders - check individual sides first, fall back to borderStyle
  const borderColor = borderColors[index] ?? fgColor

  // Individual border rendering
  const topStyle = borderTop[index] || borderStyle
  const bottomStyle = borderBottom[index] || borderStyle
  const leftStyle = borderLeft[index] || borderStyle
  const rightStyle = borderRight[index] || borderStyle

  // Render each border side if it has a style
  if (topStyle > 0) {
    const borderSet = getBorderSet(topStyle)
    if (borderSet) {
      for (let dx = 1; dx < width - 1; dx++) {
        buffer.setCell(
          x + dx,
          y,
          {
            char: String.fromCharCode(borderSet.horizontal),
            fg: borderColor,
          },
          parentClip
        )
      }
    }
  }

  if (bottomStyle > 0) {
    const borderSet = getBorderSet(bottomStyle)
    if (borderSet) {
      for (let dx = 1; dx < width - 1; dx++) {
        buffer.setCell(
          x + dx,
          y + height - 1,
          {
            char: String.fromCharCode(borderSet.horizontal),
            fg: borderColor,
          },
          parentClip
        )
      }
    }
  }

  if (leftStyle > 0) {
    const borderSet = getBorderSet(leftStyle)
    if (borderSet) {
      for (let dy = 1; dy < height - 1; dy++) {
        buffer.setCell(
          x,
          y + dy,
          {
            char: String.fromCharCode(borderSet.vertical),
            fg: borderColor,
          },
          parentClip
        )
      }
    }
  }

  if (rightStyle > 0) {
    const borderSet = getBorderSet(rightStyle)
    if (borderSet) {
      for (let dy = 1; dy < height - 1; dy++) {
        buffer.setCell(
          x + width - 1,
          y + dy,
          {
            char: String.fromCharCode(borderSet.vertical),
            fg: borderColor,
          },
          parentClip
        )
      }
    }
  }

  // Render corners based on which borders meet
  if (topStyle > 0 || leftStyle > 0) {
    const cornerStyle = topStyle || leftStyle
    const borderSet = getBorderSet(cornerStyle)
    if (borderSet) {
      buffer.setCell(
        x,
        y,
        {
          char: String.fromCharCode(borderSet.topLeft),
          fg: borderColor,
        },
        parentClip
      )
    }
  }

  if (topStyle > 0 || rightStyle > 0) {
    const cornerStyle = topStyle || rightStyle
    const borderSet = getBorderSet(cornerStyle)
    if (borderSet) {
      buffer.setCell(
        x + width - 1,
        y,
        {
          char: String.fromCharCode(borderSet.topRight),
          fg: borderColor,
        },
        parentClip
      )
    }
  }

  if (bottomStyle > 0 || leftStyle > 0) {
    const cornerStyle = bottomStyle || leftStyle
    const borderSet = getBorderSet(cornerStyle)
    if (borderSet) {
      buffer.setCell(
        x,
        y + height - 1,
        {
          char: String.fromCharCode(borderSet.bottomLeft),
          fg: borderColor,
        },
        parentClip
      )
    }
  }

  if (bottomStyle > 0 || rightStyle > 0) {
    const cornerStyle = bottomStyle || rightStyle
    const borderSet = getBorderSet(cornerStyle)
    if (borderSet) {
      buffer.setCell(
        x + width - 1,
        y + height - 1,
        {
          char: String.fromCharCode(borderSet.bottomRight),
          fg: borderColor,
        },
        parentClip
      )
    }
  }

  // Calculate content clip rect for children
  // Use the RENDERED position (after scroll adjustment) for clipping
  const adjustedClipRect = {
    x: x + (borderStyle > 0 ? 1 : 0),
    y: y + (borderStyle > 0 ? 1 : 0),
    width: width - (borderStyle > 0 ? 2 : 0),
    height: height - (borderStyle > 0 ? 2 : 0),
  }
  const contentClip = parentClip
    ? intersectClipRects(adjustedClipRect, parentClip)
    : (adjustedClipRect as ClipRect)

  // Render text content
  if (componentType[index] === ComponentType.TEXT) {
    if (!contentClip) return // Content area is completely clipped

    const lines = wrappedLines[index] || []
    const contentX = borderStyle > 0 ? x + 1 : x
    const contentY = borderStyle > 0 ? y + 1 : y
    const contentWidth = borderStyle > 0 ? width - 2 : width
    const contentHeight = borderStyle > 0 ? height - 2 : height

    // Text components don't scroll themselves - they're scrolled by their parent
    for (
      let lineIdx = 0;
      lineIdx < lines.length && lineIdx < contentHeight;
      lineIdx++
    ) {
      const line = lines[lineIdx]
      const py = contentY + lineIdx

      // Skip lines outside the clip rect
      if (py < contentClip.y || py >= contentClip.y + contentClip.height)
        continue

      const visibleLine = line

      // Render characters with proper clipping
      for (
        let charIdx = 0;
        visibleLine && charIdx < visibleLine.length && charIdx < contentWidth;
        charIdx++
      ) {
        const cellX = contentX + charIdx
        buffer.setCell(
          cellX,
          py,
          {
            char: visibleLine[charIdx],
            fg: fgColor,
            style: textStyle,
          },
          contentClip
        )
      }
    }

    // Render cursor if focused
    if (focus.value === index && cursorPosition[index] !== undefined) {
      const pos = cursorPosition[index]
      // TODO: Calculate actual cursor position based on wrapped lines
    }
  }

  // Render child components with proper clipping and scrolling
  if (componentType[index] === ComponentType.BOX) {
    // Only render children if there's a valid clip rect
    if (!contentClip) return // No valid clipping area for children

    const children = childIndices[index] || []
    // Pass the accumulated scroll offset to children
    const childScrollY = parentScrollY + yOffset
    const childScrollX = parentScrollX + xOffset

    for (const childIndex of children) {
      renderComponent(
        buffer,
        childIndex,
        contentClip,
        childScrollY,
        childScrollX
      )
    }
  }
}

// ============================================================================
// FRAME BUFFER AS DERIVED - Pure, no side effects!
// ============================================================================

const frameBuffer = $derived.by(() => {
  // Get the actual render height from layout calculations
  const renderHeight = contentHeight.value

  // Create buffer with proper height
  const buffer = new FrameBuffer(terminalSize.width, renderHeight)

  // Get components sorted by z-index (using our existing derived!)
  const engine = getEngine()
  const sortedComponents = engine().visibleComponentsSorted

  // Render root components (those without parents) with their children
  // This ensures proper parent-child clipping
  for (const index of sortedComponents) {
    // Only render root components here; children are rendered recursively
    if (!parentIndex[index] || parentIndex[index] === -1) {
      renderComponent(buffer, index, undefined, 0, 0)
    }
  }

  return buffer
})

// ============================================================================
// DIFFERENTIAL ANSI OUTPUT
// ============================================================================

function generateDiff(prev: FrameBuffer | null, next: FrameBuffer): string {
  const parts: string[] = []

  // Track last styles to minimize escape codes
  let lastFg: number | undefined = undefined
  let lastBg: number | undefined = undefined
  let lastStyle = 0
  let lastY = -1
  let lastX = -1

  // In non-fullscreen mode, we need to handle positioning differently
  const isFullscreen = terminalSize.fullscreen

  // Detect terminal resize - buffer dimensions changed
  const sizeChanged =
    prev && (prev.width !== next.width || prev.height !== next.height)

  // In non-fullscreen mode, if size changed, we need to do full redraw
  // The cursor is already at our origin (restored before calling generateDiff)
  // We don't clear because some terminals (like Warp) push content to scrollback
  // Instead, we just overwrite by forcing a full render
  if (sizeChanged && !isFullscreen) {
    // If buffer got smaller, we need to clear the extra lines that won't be overwritten
    if (prev && (prev.height > next.height || prev.width > next.width)) {
      // Clear lines beyond the new buffer height
      for (let y = next.height; y < prev.height; y++) {
        parts.push(ANSI.moveTo(1, y + 1))
        parts.push(ANSI.CLEAR_LINE)
      }
      // Move back to origin
      parts.push(ANSI.RESTORE_CURSOR)
    }
    // Force full redraw by ignoring previous buffer
    prev = null
  }

  // Use full buffer height in non-fullscreen, clamp to terminal height in fullscreen
  const height = isFullscreen
    ? Math.min(next.height, terminalSize.height)
    : next.height

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < next.width; x++) {
      const newCell = next.getCell(x, y)!
      const oldCell = prev?.getCell(x, y)

      // Skip unchanged cells
      if (
        oldCell &&
        oldCell.char === newCell.char &&
        oldCell.fg === newCell.fg &&
        oldCell.bg === newCell.bg &&
        oldCell.style === newCell.style
      ) {
        continue
      }

      // Move cursor if needed
      if (lastY !== y || lastX !== x - 1) {
        // Use absolute positioning for both fullscreen and non-fullscreen modes
        // This avoids cursor movement limits that can occur with relative positioning
        parts.push(ANSI.moveTo(x + 1, y + 1))
        lastY = y
        lastX = x
      } else {
        lastX = x
      }

      // Update text style if changed
      if (newCell.style !== lastStyle) {
        parts.push(ANSI.RESET)
        if (newCell.style & 1) parts.push(ANSI.BOLD)
        if (newCell.style & 2) parts.push(ANSI.ITALIC)
        if (newCell.style & 4) parts.push(ANSI.UNDERLINE)
        if (newCell.style & 8) parts.push(ANSI.STRIKETHROUGH)
        if (newCell.style & 16) parts.push(ANSI.DIM)
        if (newCell.style & 32) parts.push(ANSI.BLINK)
        if (newCell.style & 64) parts.push(ANSI.REVERSE)
        if (newCell.style & 128) parts.push(ANSI.HIDDEN)
        lastStyle = newCell.style
        // Force color update after reset
        lastFg = undefined
        lastBg = undefined
      }

      // Update colors - handles ANSI indices, 256 colors, and RGB
      if (newCell.fg !== lastFg) {
        parts.push(getColorCode(newCell.fg, false))
        lastFg = newCell.fg
      }

      if (newCell.bg !== lastBg) {
        parts.push(getColorCode(newCell.bg, true))
        lastBg = newCell.bg
      }

      // Output the character
      parts.push(newCell.char)
    }
  }

  return parts.join('')
}

// ============================================================================
// RENDERER STATE
// ============================================================================

let previousBuffer: FrameBuffer | null = null
let isFirstRender = true

// ============================================================================
// PUBLIC API
// ============================================================================

export function initializeRenderer() {
  // Save cursor position once for non-fullscreen mode
  if (!terminalSize.fullscreen) {
    writeStdout(ANSI.SAVE_CURSOR)
  }

  // Single effect that watches the derived frameBuffer
  $effect(() => {
    const nextBuffer = frameBuffer // Creates reactive dependency

    // In non-fullscreen mode, restore to saved position before each frame
    if (!terminalSize.fullscreen && !isFirstRender) {
      writeStdout(ANSI.RESTORE_CURSOR)
    }

    // Generate differential output
    const diff = generateDiff(previousBuffer, nextBuffer)

    // Output if there are changes
    if (diff) {
      writeStdout(diff)
    }

    // Save for next diff
    previousBuffer = nextBuffer
    isFirstRender = false
  })

  // Return cleanup
  return () => {
    writeStdout(ANSI.RESET)
    if (!terminalSize.fullscreen) {
      writeStdout(ANSI.RESTORE_CURSOR)
    }
    previousBuffer = null
    isFirstRender = true
  }
}
