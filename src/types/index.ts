import * as blessed from 'blessed'

// Theme-related types
export type Color = string | null

export interface Theme {
  name: string
  description: string
  author: string
  version: string

  colors: {
    // Base colors
    primary: Color
    secondary: Color
    background: Color
    foreground: Color

    // Status colors
    success: Color
    warning: Color
    error: Color
    info: Color
  }

  // Derived colors (calculated from base colors, but can be overridden)
  derived?: {
    surfaceColor?: Color
    mutedText?: Color
  }
}
