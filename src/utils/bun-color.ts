// ============================================================================
// SVELTUI - BUN OPTIMIZED COLOR UTILITIES
// Fast, flexible color parsing and ANSI generation using Bun's native APIs
// ============================================================================

declare namespace Bun {
  function color(
    input: any,
    format?:
      | 'css'
      | 'ansi'
      | 'ansi-16'
      | 'ansi-256'
      | 'ansi-16m'
      | 'number'
      | 'rgb'
      | 'rgba'
      | 'hsl'
      | 'hex'
      | 'HEX'
      | '{rgb}'
      | '{rgba}'
      | '[rgb]'
      | '[rgba]'
  ): any
}

export type ColorInput =
  | string // CSS color name, hex, rgb(), hsl(), etc.
  | number // 0xRRGGBB format
  | { r: number; g: number; b: number; a?: number } // RGB object
  | [number, number, number]
  | [number, number, number, number] // RGB array

/**
 * Parse any color input to a number (0xRRGGBB format)
 * This is our internal format for storage
 */
export function parseColor(input: ColorInput): number | undefined {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const result = Bun.color(input, 'number')
    return result !== null ? result : undefined
  }

  // Fallback for non-Bun environments
  if (typeof input === 'number') {
    return input
  }

  if (typeof input === 'string') {
    // Basic hex parsing
    if (input.startsWith('#')) {
      const hex = input.slice(1)
      if (hex.length === 3) {
        // #RGB -> #RRGGBB
        const r = parseInt(hex[0]! + hex[0]!, 16)
        const g = parseInt(hex[1]! + hex[1]!, 16)
        const b = parseInt(hex[2]! + hex[2]!, 16)
        return (r << 16) | (g << 8) | b
      }
      if (hex.length === 6) {
        return parseInt(hex, 16)
      }
    }

    // Basic color names
    const basicColors: Record<string, number> = {
      red: 0xff0000,
      green: 0x00ff00,
      blue: 0x0000ff,
      yellow: 0xffff00,
      cyan: 0x00ffff,
      magenta: 0xff00ff,
      white: 0xffffff,
      black: 0x000000,
      gray: 0x808080,
      grey: 0x808080,
    }

    return basicColors[input.toLowerCase()]
  }

  if (Array.isArray(input) && input.length >= 3) {
    const [r, g, b] = input
    return (r << 16) | (g << 8) | b
  }

  if (
    typeof input === 'object' &&
    'r' in input &&
    'g' in input &&
    'b' in input
  ) {
    return (input.r << 16) | (input.g << 8) | input.b
  }

  return undefined
}

/**
 * Convert a color to ANSI escape sequence
 * Automatically detects terminal color support
 */
export function toANSI(color: ColorInput, background = false): string {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const ansi = Bun.color(color, 'ansi')
    if (ansi === null) return ''

    // Convert foreground to background if needed
    if (background && ansi.includes('[38;')) {
      return ansi.replace('[38;', '[48;')
    }

    return ansi
  }

  // Fallback: basic 24-bit color
  const num = parseColor(color)
  if (num === undefined) return ''

  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff

  return background ? `\x1b[48;2;${r};${g};${b}m` : `\x1b[38;2;${r};${g};${b}m`
}

/**
 * Convert a color to ANSI with specific color depth
 */
export function toANSIWithDepth(
  color: ColorInput,
  depth: '16' | '256' | '16m' = '16m',
  background = false
): string {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const format = `ansi-${depth}` as const
    const ansi = Bun.color(color, format)
    if (ansi === null) return ''

    // Convert foreground to background if needed
    if (background && ansi.includes('[38;')) {
      return ansi.replace('[38;', '[48;')
    }

    return ansi
  }

  // Fallback to basic implementation
  return toANSI(color, background)
}

/**
 * Get RGB components from a color
 */
export function toRGB(
  color: ColorInput
): { r: number; g: number; b: number } | undefined {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const result = Bun.color(color, '{rgb}')
    return result !== null ? result : undefined
  }

  // Fallback
  const num = parseColor(color)
  if (num === undefined) return undefined

  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}

/**
 * Get RGBA components from a color
 */
export function toRGBA(
  color: ColorInput
): { r: number; g: number; b: number; a: number } | undefined {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const result = Bun.color(color, '{rgba}')
    return result !== null ? result : undefined
  }

  // Fallback
  const rgb = toRGB(color)
  return rgb ? { ...rgb, a: 1 } : undefined
}

/**
 * Get ANSI escape code from a number value
 * This handles the full range of color values used by our theme system:
 * - ANSI indices (0-15) used by default theme
 * - 256 colors (16-255) for extended palette
 * - RGB values (0xRRGGBB) used by Dracula/Nord themes
 */
export function getColorCode(
  color: number | undefined,
  background: boolean
): string {
  if (color === undefined) {
    // Reset to default colors
    return background ? '\x1b[49m' : '\x1b[39m'
  }

  // ANSI 16 colors - what our default theme uses
  if (color <= 15) {
    if (color <= 7) {
      // Standard colors 0-7: black, red, green, yellow, blue, magenta, cyan, white
      return background ? `\x1b[${40 + color}m` : `\x1b[${30 + color}m`
    } else {
      // Bright colors 8-15
      return background
        ? `\x1b[${100 + (color - 8)}m`
        : `\x1b[${90 + (color - 8)}m`
    }
  }
  // 256 color palette
  else if (color <= 255) {
    return background ? `\x1b[48;5;${color}m` : `\x1b[38;5;${color}m`
  }
  // True RGB colors - what Dracula/Nord themes use
  else {
    // Use toANSI which leverages Bun.color for best terminal compatibility
    return toANSI(color, background)
  }
}

/**
 * Convert color to hex string
 */
export function toHex(
  color: ColorInput,
  uppercase = false
): string | undefined {
  if (typeof Bun !== 'undefined' && Bun.color) {
    const result = Bun.color(color, uppercase ? 'HEX' : 'hex')
    return result !== null ? result : undefined
  }

  // Fallback
  const num = parseColor(color)
  if (num === undefined) return undefined

  const hex = num.toString(16).padStart(6, '0')
  return uppercase ? `#${hex.toUpperCase()}` : `#${hex}`
}

/**
 * Mix two colors together
 */
export function mixColors(
  color1: ColorInput,
  color2: ColorInput,
  ratio = 0.5
): number | undefined {
  const rgb1 = toRGB(color1)
  const rgb2 = toRGB(color2)

  if (!rgb1 || !rgb2) return undefined

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio)
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio)
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)

  return (r << 16) | (g << 8) | b
}

/**
 * Lighten a color by a percentage (0-1)
 */
export function lighten(color: ColorInput, amount = 0.1): number | undefined {
  return mixColors(color, 0xffffff, amount)
}

/**
 * Darken a color by a percentage (0-1)
 */
export function darken(color: ColorInput, amount = 0.1): number | undefined {
  return mixColors(color, 0x000000, amount)
}

/**
 * Check if a color is valid
 */
export function isValidColor(color: ColorInput): boolean {
  if (typeof Bun !== 'undefined' && Bun.color) {
    return Bun.color(color, 'number') !== null
  }

  return parseColor(color) !== undefined
}

/**
 * Generate ANSI reset sequence
 */
export function ansiReset(): string {
  return '\x1b[0m'
}

/**
 * Generate ANSI sequence for both foreground and background
 */
export function ansiColors(fg?: ColorInput, bg?: ColorInput): string {
  let result = ''

  if (fg !== undefined) {
    result += toANSI(fg, false)
  }

  if (bg !== undefined) {
    result += toANSI(bg, true)
  }

  return result
}
