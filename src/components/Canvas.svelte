<script lang="ts">
import {
  ComponentType,
  canvasCells,
  colors,
  borderStyles,
  computedWidth,
  computedHeight,
} from '../core/state/engine.svelte.ts'
import { getTheme } from '../theme/theme.svelte.ts'
import { PixelBuffer, type Color } from '../canvas/index.ts'
import { parseColor, toRGBA, type ColorInput } from '../utils/bun-color.ts'
import { useComponent, type ComponentProps } from './base-component.svelte.ts'

const theme = getTheme()

// Props
interface CanvasProps extends ComponentProps {
  // Visual
  border?: 'none' | 'single' | 'double' | 'rounded' | 'bold' | 'dashed' | 'dotted'
  borderColor?: ColorInput
  backgroundColor?: ColorInput
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'

  // Drawing callback - called synchronously inside $effect
  // Any reactive values read inside become dependencies!
  onDraw?: (ctx: CanvasContext) => void
}

/**
 * Canvas drawing context - provides drawing API
 */
export interface CanvasContext {
  /** Width in pixels (2x cell width) */
  readonly width: number
  /** Height in pixels (2x cell height) */
  readonly height: number
  /** Width in terminal cells */
  readonly cellWidth: number
  /** Height in terminal cells */
  readonly cellHeight: number

  /** Clear the canvas */
  clear(color?: Color): void
  /** Set a single pixel */
  setPixel(x: number, y: number, color: Color): void
  /** Get a pixel color */
  getPixel(x: number, y: number): Color | null
  /** Draw a line */
  drawLine(x0: number, y0: number, x1: number, y1: number, color: Color): void
  /** Draw a rectangle outline */
  drawRect(x: number, y: number, width: number, height: number, color: Color): void
  /** Fill a rectangle */
  fillRect(x: number, y: number, width: number, height: number, color: Color): void
  /** Draw a circle outline */
  drawCircle(cx: number, cy: number, radius: number, color: Color): void
  /** Fill a circle */
  fillCircle(cx: number, cy: number, radius: number, color: Color): void

  /**
   * Convert any ColorInput to a Color for drawing
   * Use this to convert theme colors, hex values, or any color format
   */
  color(input: ColorInput): Color
}

let {
  // Visual
  border = 'none',
  borderColor,
  backgroundColor,
  variant,
  // Drawing callback
  onDraw,
  // All other props from ComponentProps
  ...baseProps
}: CanvasProps = $props()

// Create base component
const component = useComponent(ComponentType.CANVAS, baseProps, false)
const index = component.getIndex()

/**
 * Convert ColorInput to Color using Bun.color utilities
 */
function colorInputToColor(input: ColorInput): Color {
  const rgba = toRGBA(input)
  if (rgba) {
    return { r: rgba.r, g: rgba.g, b: rgba.b, a: Math.round(rgba.a * 255) }
  }
  // Fallback
  return { r: 0, g: 0, b: 0, a: 255 }
}

// Update visual properties when they change
$effect(() => {
  // Border style
  borderStyles[index] =
    border === 'single' ? 1 :
    border === 'double' ? 2 :
    border === 'rounded' ? 3 :
    border === 'bold' ? 4 :
    border === 'dashed' ? 5 :
    border === 'dotted' ? 6 :
    0

  // Border color with theme support
  let finalBorderColor = borderColor ? parseColor(borderColor) : undefined
  if (!finalBorderColor && variant) {
    finalBorderColor = theme().colors[variant]
  }

  // Background color
  const finalBgColor = backgroundColor ? parseColor(backgroundColor) : undefined

  colors[index * 2] = finalBorderColor
  colors[index * 2 + 1] = finalBgColor
})

// Watch for prop changes and update base component
$effect(() => {
  component.updateProps(baseProps)
})

// Main drawing effect - THIS IS THE KEY!
// Any reactive values read inside onDraw become dependencies
// When they change, this effect re-runs, canvas redraws, cells update
$effect(() => {
  // Get computed dimensions from layout
  let width = computedWidth[index] || 0
  let height = computedHeight[index] || 0

  // Account for border
  const hasBorder = borderStyles[index] > 0
  if (hasBorder) {
    width = Math.max(0, width - 2)
    height = Math.max(0, height - 2)
  }

  // Need valid dimensions
  if (width <= 0 || height <= 0) {
    canvasCells[index] = null
    return
  }

  // Create pixel buffer for this frame
  const pixelBuffer = new PixelBuffer(width, height)

  // Set background if specified
  if (backgroundColor) {
    const bgColor = colorInputToColor(backgroundColor)
    pixelBuffer.setBackground(bgColor)
  }
  pixelBuffer.clear()

  // Call user's draw function - THIS IS WHERE REACTIVITY MAGIC HAPPENS
  // Any reactive state they read inside becomes a dependency of this effect!
  if (onDraw) {
    const ctx: CanvasContext = {
      get width() { return pixelBuffer.pixelWidth },
      get height() { return pixelBuffer.pixelHeight },
      get cellWidth() { return pixelBuffer.cellWidth },
      get cellHeight() { return pixelBuffer.cellHeight },

      clear: (color?: Color) => pixelBuffer.clear(color),
      setPixel: (x, y, color) => pixelBuffer.setPixel(x, y, color),
      getPixel: (x, y) => pixelBuffer.getPixel(x, y),
      drawLine: (x0, y0, x1, y1, color) => pixelBuffer.drawLine(x0, y0, x1, y1, color),
      drawRect: (x, y, w, h, color) => pixelBuffer.drawRect(x, y, w, h, color),
      fillRect: (x, y, w, h, color) => pixelBuffer.fillRect(x, y, w, h, color),
      drawCircle: (cx, cy, r, color) => pixelBuffer.drawCircle(cx, cy, r, color),
      fillCircle: (cx, cy, r, color) => pixelBuffer.fillCircle(cx, cy, r, color),

      // Helper to convert any color input (including theme colors) to Color
      color: (input: ColorInput) => colorInputToColor(input),
    }

    onDraw(ctx)
  }

  // Compute cells and store in state - this triggers the renderer!
  // We create a NEW array each time, which is what Svelte needs to detect the change
  canvasCells[index] = pixelBuffer.getAllCells()
})
</script>
