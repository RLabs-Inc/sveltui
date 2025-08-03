/**
 * Style utilities for SvelTUI
 * 
 * Provides utilities for parsing, merging, and converting terminal styles.
 * Handles blessed's style syntax and attribute formats.
 */

import type { TerminalStyle } from './style-state.svelte.ts'

/**
 * Terminal color names supported by blessed
 */
export const TERMINAL_COLORS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'brightred',
  'brightgreen',
  'brightyellow',
  'brightblue',
  'brightmagenta',
  'brightcyan',
  'brightwhite',
  'default'
] as const

export type TerminalColor = typeof TERMINAL_COLORS[number]

/**
 * Text attributes supported by blessed
 */
export const TEXT_ATTRIBUTES = [
  'bold',
  'underline',
  'blink',
  'inverse',
  'invisible',
  'italic'
] as const

export type TextAttribute = typeof TEXT_ATTRIBUTES[number]

/**
 * Border types supported by blessed
 */
export const BORDER_TYPES = [
  'line',
  'bg',
  'ascii',
  'double',
  'single'
] as const

export type BorderType = typeof BORDER_TYPES[number]

/**
 * Parse a color string (supports color names, hex codes, and RGB)
 */
export function parseColor(color: string | undefined): string | undefined {
  if (!color) return undefined
  
  // Terminal color names
  if (TERMINAL_COLORS.includes(color as TerminalColor)) {
    return color
  }
  
  // Hex colors (#RGB or #RRGGBB)
  if (color.startsWith('#')) {
    return color
  }
  
  // RGB format: rgb(r,g,b)
  if (color.startsWith('rgb(')) {
    return color
  }
  
  // Indexed colors (0-255)
  const num = parseInt(color, 10)
  if (!isNaN(num) && num >= 0 && num <= 255) {
    return color
  }
  
  // Default to the original color string
  return color
}

/**
 * Parse a style attribute string (e.g., "bold,underline,red")
 */
export function parseStyleAttributes(attr: string): Partial<TerminalStyle> {
  const style: Partial<TerminalStyle> = {}
  const parts = attr.split(',').map(s => s.trim().toLowerCase())
  
  for (const part of parts) {
    // Check for text attributes
    if (TEXT_ATTRIBUTES.includes(part as TextAttribute)) {
      style[part as TextAttribute] = true
      continue
    }
    
    // Check for colors (assume foreground by default)
    const color = parseColor(part)
    if (color) {
      style.fg = color
    }
  }
  
  return style
}

/**
 * Parse a blessed-style object into our style format
 */
export function parseBlessedStyle(blessed: any): TerminalStyle {
  const style: TerminalStyle = {}
  
  // Basic properties
  if (blessed.fg) style.fg = parseColor(blessed.fg)
  if (blessed.bg) style.bg = parseColor(blessed.bg)
  if (blessed.bold) style.bold = blessed.bold
  if (blessed.underline) style.underline = blessed.underline
  if (blessed.blink) style.blink = blessed.blink
  if (blessed.inverse) style.inverse = blessed.inverse
  if (blessed.invisible) style.invisible = blessed.invisible
  if (blessed.italic) style.italic = blessed.italic
  
  // Border
  if (blessed.border) {
    style.border = {}
    if (blessed.border.fg) style.border.fg = parseColor(blessed.border.fg)
    if (blessed.border.bg) style.border.bg = parseColor(blessed.border.bg)
    if (blessed.border.type) style.border.type = blessed.border.type
    if (blessed.border.ch) style.border.ch = blessed.border.ch
  }
  
  // Scrollbar
  if (blessed.scrollbar) {
    style.scrollbar = {}
    if (blessed.scrollbar.fg) style.scrollbar.fg = parseColor(blessed.scrollbar.fg)
    if (blessed.scrollbar.bg) style.scrollbar.bg = parseColor(blessed.scrollbar.bg)
    if (blessed.scrollbar.track) {
      style.scrollbar.track = {}
      if (blessed.scrollbar.track.fg) {
        style.scrollbar.track.fg = parseColor(blessed.scrollbar.track.fg)
      }
      if (blessed.scrollbar.track.bg) {
        style.scrollbar.track.bg = parseColor(blessed.scrollbar.track.bg)
      }
      if (blessed.scrollbar.track.ch) {
        style.scrollbar.track.ch = blessed.scrollbar.track.ch
      }
    }
  }
  
  // Label
  if (blessed.label) {
    style.label = {}
    if (blessed.label.fg) style.label.fg = parseColor(blessed.label.fg)
    if (blessed.label.bg) style.label.bg = parseColor(blessed.label.bg)
    if (blessed.label.bold) style.label.bold = blessed.label.bold
    if (blessed.label.underline) style.label.underline = blessed.label.underline
  }
  
  // State styles
  if (blessed.focus) style.focus = parseBlessedStyle(blessed.focus)
  if (blessed.hover) style.hover = parseBlessedStyle(blessed.hover)
  
  return style
}

/**
 * Deep merge multiple styles (later styles override earlier ones)
 */
export function mergeStyles(...styles: (Partial<TerminalStyle> | undefined)[]): TerminalStyle {
  const result: TerminalStyle = {}
  
  for (const style of styles) {
    if (!style) continue
    
    // Merge simple properties
    Object.keys(style).forEach(key => {
      const value = style[key as keyof TerminalStyle]
      if (value !== undefined && typeof value !== 'object') {
        (result as any)[key] = value
      }
    })
    
    // Merge border
    if (style.border) {
      result.border = { ...result.border, ...style.border }
    }
    
    // Merge scrollbar
    if (style.scrollbar) {
      result.scrollbar = {
        ...result.scrollbar,
        ...style.scrollbar,
        track: style.scrollbar.track
          ? { ...result.scrollbar?.track, ...style.scrollbar.track }
          : result.scrollbar?.track
      }
    }
    
    // Merge label
    if (style.label) {
      result.label = { ...result.label, ...style.label }
    }
    
    // Merge state styles
    if (style.focus) {
      result.focus = mergeStyles(result.focus, style.focus)
    }
    if (style.hover) {
      result.hover = mergeStyles(result.hover, style.hover)
    }
    if (style.pressed) {
      result.pressed = mergeStyles(result.pressed, style.pressed)
    }
  }
  
  return result
}

/**
 * Convert style to CSS-like string (for debugging)
 */
export function styleToString(style: TerminalStyle): string {
  const parts: string[] = []
  
  if (style.fg) parts.push(`color: ${style.fg}`)
  if (style.bg) parts.push(`background: ${style.bg}`)
  if (style.bold) parts.push('font-weight: bold')
  if (style.underline) parts.push('text-decoration: underline')
  if (style.italic) parts.push('font-style: italic')
  if (style.blink) parts.push('text-decoration: blink')
  if (style.inverse) parts.push('filter: invert(1)')
  if (style.invisible) parts.push('visibility: hidden')
  
  if (style.border) {
    if (style.border.fg) parts.push(`border-color: ${style.border.fg}`)
    if (style.border.type) parts.push(`border-style: ${style.border.type}`)
  }
  
  return parts.join('; ')
}

/**
 * Create a style object from shorthand properties
 */
export function createStyle(options: {
  fg?: string
  bg?: string
  border?: string | boolean | { fg?: string; type?: BorderType }
  bold?: boolean
  underline?: boolean
  italic?: boolean
  blink?: boolean
  inverse?: boolean
  invisible?: boolean
}): TerminalStyle {
  const style: TerminalStyle = {}
  
  // Basic properties
  if (options.fg) style.fg = parseColor(options.fg)
  if (options.bg) style.bg = parseColor(options.bg)
  if (options.bold) style.bold = options.bold
  if (options.underline) style.underline = options.underline
  if (options.italic) style.italic = options.italic
  if (options.blink) style.blink = options.blink
  if (options.inverse) style.inverse = options.inverse
  if (options.invisible) style.invisible = options.invisible
  
  // Border shorthand
  if (options.border) {
    if (typeof options.border === 'boolean') {
      style.border = options.border ? { type: 'line' } : undefined
    } else if (typeof options.border === 'string') {
      style.border = { fg: parseColor(options.border), type: 'line' }
    } else {
      style.border = {
        fg: options.border.fg ? parseColor(options.border.fg) : undefined,
        type: options.border.type || 'line'
      }
    }
  }
  
  return style
}

/**
 * Inherit styles from parent to child
 */
export function inheritStyles(
  parentStyle: TerminalStyle,
  childStyle: TerminalStyle,
  inheritableProps: (keyof TerminalStyle)[] = ['fg', 'bg']
): TerminalStyle {
  const inherited: TerminalStyle = { ...childStyle }
  
  for (const prop of inheritableProps) {
    if (!(prop in childStyle) && prop in parentStyle) {
      (inherited as any)[prop] = parentStyle[prop]
    }
  }
  
  return inherited
}

/**
 * Apply theme to style
 */
export function applyTheme(
  style: TerminalStyle,
  theme: Record<string, any>
): TerminalStyle {
  // This is a placeholder for theme application logic
  // In a real implementation, this would map theme tokens to style properties
  return mergeStyles(style, theme.default || {})
}