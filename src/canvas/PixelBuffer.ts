// ============================================================================
// PIXEL BUFFER - Sub-cell resolution graphics for terminal
// Uses quadrant block characters for 2x2 pixel resolution per cell
// ============================================================================

/**
 * RGBA color (0-255 per channel)
 */
export interface Color {
  r: number
  g: number
  b: number
  a: number
}

/**
 * A terminal cell with character, foreground and background colors
 */
export interface TerminalCell {
  char: string
  fg: number  // 0xRRGGBB format
  bg: number  // 0xRRGGBB format
}

/**
 * Quadrant block characters - 16 patterns for 2x2 pixel grid
 * Each bit represents: TL(8) TR(4) BL(2) BR(1)
 */
const QUADRANT_CHARS: string[] = [
  ' ',   // 0000 - empty
  '▗',   // 0001 - BR
  '▖',   // 0010 - BL
  '▄',   // 0011 - bottom half
  '▝',   // 0100 - TR
  '▐',   // 0101 - right half
  '▞',   // 0110 - diagonal (TR + BL)
  '▟',   // 0111 - TR + BL + BR
  '▘',   // 1000 - TL
  '▚',   // 1001 - diagonal (TL + BR)
  '▌',   // 1010 - left half
  '▙',   // 1011 - TL + BL + BR
  '▀',   // 1100 - top half
  '▜',   // 1101 - TL + TR + BR
  '▛',   // 1110 - TL + TR + BL
  '█',   // 1111 - full block
]

/**
 * Convert Color to 0xRRGGBB format
 */
function colorToHex(color: Color): number {
  return ((color.r & 0xff) << 16) | ((color.g & 0xff) << 8) | (color.b & 0xff)
}

/**
 * Calculate squared color distance (faster than sqrt)
 */
function colorDistanceSq(a: Color, b: Color): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

/**
 * Calculate luminance for a color
 */
function luminance(color: Color): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

/**
 * Average multiple colors
 */
function averageColors(colors: Color[]): Color {
  if (colors.length === 0) return { r: 0, g: 0, b: 0, a: 255 }

  let r = 0, g = 0, b = 0, a = 0
  for (const c of colors) {
    r += c.r
    g += c.g
    b += c.b
    a += c.a
  }
  const n = colors.length
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
    a: Math.round(a / n),
  }
}

/**
 * PixelBuffer - A 2D pixel buffer that converts to terminal cells
 *
 * Internal resolution is 2x the terminal cell dimensions.
 * A 40x20 cell canvas has 80x40 pixels.
 */
export class PixelBuffer {
  /** Width in terminal cells */
  readonly cellWidth: number
  /** Height in terminal cells */
  readonly cellHeight: number
  /** Width in pixels (2x cellWidth) */
  readonly pixelWidth: number
  /** Height in pixels (2x cellHeight) */
  readonly pixelHeight: number

  /** Pixel data - flat array of RGBA values */
  private pixels: Uint8Array

  /** Default background color */
  private bgColor: Color = { r: 0, g: 0, b: 0, a: 255 }

  constructor(cellWidth: number, cellHeight: number) {
    this.cellWidth = cellWidth
    this.cellHeight = cellHeight
    this.pixelWidth = cellWidth * 2
    this.pixelHeight = cellHeight * 2

    // 4 bytes per pixel (RGBA)
    this.pixels = new Uint8Array(this.pixelWidth * this.pixelHeight * 4)
    this.clear()
  }

  /**
   * Set background color used when clearing
   */
  setBackground(color: Color): void {
    this.bgColor = color
  }

  /**
   * Clear the buffer to background color
   */
  clear(color?: Color): void {
    const c = color || this.bgColor
    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] = c.r
      this.pixels[i + 1] = c.g
      this.pixels[i + 2] = c.b
      this.pixels[i + 3] = c.a
    }
  }

  /**
   * Set a pixel at (x, y) in pixel coordinates
   */
  setPixel(x: number, y: number, color: Color): void {
    if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) return

    const i = (y * this.pixelWidth + x) * 4
    this.pixels[i] = color.r
    this.pixels[i + 1] = color.g
    this.pixels[i + 2] = color.b
    this.pixels[i + 3] = color.a
  }

  /**
   * Get a pixel at (x, y) in pixel coordinates
   */
  getPixel(x: number, y: number): Color | null {
    if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) return null

    const i = (y * this.pixelWidth + x) * 4
    return {
      r: this.pixels[i],
      g: this.pixels[i + 1],
      b: this.pixels[i + 2],
      a: this.pixels[i + 3],
    }
  }

  /**
   * Draw a horizontal line
   */
  drawLine(x0: number, y0: number, x1: number, y1: number, color: Color): void {
    // Bresenham's line algorithm
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    let x = x0
    let y = y0

    while (true) {
      this.setPixel(x, y, color)

      if (x === x1 && y === y1) break

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }
  }

  /**
   * Draw a rectangle outline
   */
  drawRect(x: number, y: number, width: number, height: number, color: Color): void {
    // Top and bottom
    for (let dx = 0; dx < width; dx++) {
      this.setPixel(x + dx, y, color)
      this.setPixel(x + dx, y + height - 1, color)
    }
    // Left and right
    for (let dy = 0; dy < height; dy++) {
      this.setPixel(x, y + dy, color)
      this.setPixel(x + width - 1, y + dy, color)
    }
  }

  /**
   * Fill a rectangle
   */
  fillRect(x: number, y: number, width: number, height: number, color: Color): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.setPixel(x + dx, y + dy, color)
      }
    }
  }

  /**
   * Draw a circle outline
   */
  drawCircle(cx: number, cy: number, radius: number, color: Color): void {
    // Midpoint circle algorithm
    let x = radius
    let y = 0
    let err = 0

    while (x >= y) {
      this.setPixel(cx + x, cy + y, color)
      this.setPixel(cx + y, cy + x, color)
      this.setPixel(cx - y, cy + x, color)
      this.setPixel(cx - x, cy + y, color)
      this.setPixel(cx - x, cy - y, color)
      this.setPixel(cx - y, cy - x, color)
      this.setPixel(cx + y, cy - x, color)
      this.setPixel(cx + x, cy - y, color)

      y++
      err += 1 + 2 * y
      if (2 * (err - x) + 1 > 0) {
        x--
        err += 1 - 2 * x
      }
    }
  }

  /**
   * Fill a circle
   */
  fillCircle(cx: number, cy: number, radius: number, color: Color): void {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius) {
          this.setPixel(cx + x, cy + y, color)
        }
      }
    }
  }

  /**
   * Get a terminal cell at (cellX, cellY) in cell coordinates
   * This converts a 2x2 pixel block to a quadrant character
   */
  getCell(cellX: number, cellY: number): TerminalCell {
    if (cellX < 0 || cellX >= this.cellWidth || cellY < 0 || cellY >= this.cellHeight) {
      return { char: ' ', fg: 0, bg: 0 }
    }

    // Get the 4 pixels for this cell (2x2 grid)
    const px = cellX * 2
    const py = cellY * 2

    const pixels: Color[] = [
      this.getPixel(px, py) || this.bgColor,         // TL
      this.getPixel(px + 1, py) || this.bgColor,     // TR
      this.getPixel(px, py + 1) || this.bgColor,     // BL
      this.getPixel(px + 1, py + 1) || this.bgColor, // BR
    ]

    // Find the two most different colors
    let maxDist = 0
    let idxA = 0
    let idxB = 1

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const dist = colorDistanceSq(pixels[i], pixels[j])
        if (dist > maxDist) {
          maxDist = dist
          idxA = i
          idxB = j
        }
      }
    }

    const candA = pixels[idxA]
    const candB = pixels[idxB]

    // Determine dark and light colors based on luminance
    let darkColor: Color
    let lightColor: Color

    if (luminance(candA) <= luminance(candB)) {
      darkColor = candA
      lightColor = candB
    } else {
      darkColor = candB
      lightColor = candA
    }

    // Determine quadrant pattern - which pixels are closer to dark vs light
    // Bit pattern: TL(8) TR(4) BL(2) BR(1)
    let pattern = 0
    const bitValues = [8, 4, 2, 1] // TL, TR, BL, BR

    for (let i = 0; i < 4; i++) {
      const distToDark = colorDistanceSq(pixels[i], darkColor)
      const distToLight = colorDistanceSq(pixels[i], lightColor)
      if (distToDark <= distToLight) {
        pattern |= bitValues[i]
      }
    }

    // Special cases for uniform colors
    if (pattern === 0) {
      // All light - use space with light background
      return {
        char: ' ',
        fg: colorToHex(darkColor),
        bg: colorToHex(averageColors(pixels)),
      }
    } else if (pattern === 15) {
      // All dark - use full block with dark foreground
      return {
        char: QUADRANT_CHARS[15],
        fg: colorToHex(averageColors(pixels)),
        bg: colorToHex(lightColor),
      }
    }

    // Mixed pattern
    return {
      char: QUADRANT_CHARS[pattern],
      fg: colorToHex(darkColor),
      bg: colorToHex(lightColor),
    }
  }

  /**
   * Resize the buffer (clears content)
   */
  resize(cellWidth: number, cellHeight: number): void {
    (this as any).cellWidth = cellWidth;
    (this as any).cellHeight = cellHeight;
    (this as any).pixelWidth = cellWidth * 2;
    (this as any).pixelHeight = cellHeight * 2;

    this.pixels = new Uint8Array(this.pixelWidth * this.pixelHeight * 4)
    this.clear()
  }

  /**
   * Get all terminal cells as a 2D array
   * Returns a NEW array each time (important for reactivity)
   */
  getAllCells(): TerminalCell[][] {
    const cells: TerminalCell[][] = []

    for (let cy = 0; cy < this.cellHeight; cy++) {
      const row: TerminalCell[] = []
      for (let cx = 0; cx < this.cellWidth; cx++) {
        row.push(this.getCell(cx, cy))
      }
      cells.push(row)
    }

    return cells
  }
}
