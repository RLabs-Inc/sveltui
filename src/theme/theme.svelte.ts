// ============================================================================
// SVELTUI - THEME SYSTEM
// Reactive theming with semantic colors only
// Father State Pattern - Everything is reactive!
// Now with Bun.color() for flexible color input!
// ============================================================================

import { parseColor, type ColorInput } from '../utils/bun-color.ts'

// Theme colors - semantic colors only
// Initialize with default theme (ANSI colors)
const colors = $state({
  // Main palette
  primary: 4, // Blue (ANSI 4)
  secondary: 5, // Magenta (ANSI 5)
  tertiary: 6, // Cyan (ANSI 6)
  accent: 3, // Yellow (ANSI 3)

  // Semantic colors
  success: 2, // Green (ANSI 2)
  warning: 3, // Yellow (ANSI 3)
  error: 1, // Red (ANSI 1)
  info: 6, // Cyan (ANSI 6)

  // Text colors
  text: undefined, // Terminal's default foreground
  textMuted: 8, // Bright Black / Gray (ANSI 8)
  textBright: 15, // Bright White (ANSI 15)

  // Background colors
  background: undefined, // Terminal's default background
})

// Current theme metadata
const metadata = $state({
  name: 'default',
  description: 'Terminal default colors',
  author: 'SvelTUI',
})

// ============================================================================
// THEME PRESETS
// ============================================================================

const themes = {
  default: {
    name: 'default',
    description: 'Terminal default colors',
    colors: {
      // Map to terminal's ANSI colors (0-15)
      primary: 11, // Bright Blue (ANSI 4)
      secondary: 6, // Cyan (ANSI 5)
      tertiary: 5, // Magenta (ANSI 6)
      accent: 9, // Bright Green (ANSI 9)
      success: 2, // Green (ANSI 2)
      warning: 3, // Yellow (ANSI 3)
      error: 1, // Red (ANSI 1)
      info: 4, // Blue (ANSI 4)
      text: undefined, // Terminal's default foreground
      textMuted: 8, // Bright Black / Gray (ANSI 8)
      textBright: 15, // Bright White (ANSI 15)
      background: undefined, // Terminal's default background
    },
  },

  dracula: {
    name: 'dracula',
    description: 'Dracula theme',
    colors: {
      primary: 0xbd93f9, // Purple
      secondary: 0xff79c6, // Pink
      tertiary: 0x8be9fd, // Cyan
      accent: 0xf1fa8c, // Yellow
      success: 0x50fa7b, // Green
      warning: 0xf1fa8c, // Yellow
      error: 0xff5555, // Red
      info: 0x8be9fd, // Cyan
      text: 0xf8f8f2, // Foreground
      textMuted: 0x6272a4, // Comment
      textBright: 0xffffff, // Bright white
      background: 0x282a36, // Background
    },
  },

  nord: {
    name: 'nord',
    description: 'Nord theme',
    colors: {
      primary: 0x88c0d0, // Frost cyan
      secondary: 0x81a1c1, // Frost blue
      tertiary: 0x5e81ac, // Frost dark blue
      accent: 0xd08770, // Aurora orange
      success: 0xa3be8c, // Aurora green
      warning: 0xebcb8b, // Aurora yellow
      error: 0xbf616a, // Aurora red
      info: 0x88c0d0, // Frost cyan
      text: 0xd8dee9, // Snow Storm
      textMuted: 0x4c566a, // Polar Night
      textBright: 0xeceff4, // Snow Storm bright
      background: 0x2e3440, // Polar Night
    },
  },

  monokai: {
    name: 'monokai',
    description: 'Monokai theme',
    colors: {
      primary: 0xf92672, // Pink
      secondary: 0xa6e22e, // Green
      tertiary: 0xae81ff, // Purple
      accent: 0xfd971f, // Orange
      success: 0xa6e22e, // Green
      warning: 0xfd971f, // Orange
      error: 0xf92672, // Pink
      info: 0x66d9ef, // Blue
      text: 0xf8f8f2, // White
      textMuted: 0x75715e, // Comment
      textBright: 0xffffff, // Bright white
      background: 0x272822, // Dark gray
    },
  },

  solarized: {
    name: 'solarized',
    description: 'Solarized Dark theme',
    colors: {
      primary: 0x268bd2, // Blue
      secondary: 0x2aa198, // Cyan
      tertiary: 0x859900, // Green
      accent: 0xcb4b16, // Orange
      success: 0x859900, // Green
      warning: 0xb58900, // Yellow
      error: 0xdc322f, // Red
      info: 0x268bd2, // Blue
      text: 0x839496, // Base0
      textMuted: 0x586e75, // Base01
      textBright: 0x93a1a1, // Base1
      background: 0x002b36, // Base03
    },
  },
}

// ============================================================================
// METHODS
// ============================================================================

function setTheme(themeName: string | Theme) {
  if (typeof themeName === 'string') {
    // Load preset theme
    const preset = themes[themeName as keyof typeof themes]
    if (!preset) {
      console.error(`Theme '${themeName}' not found`)
      return
    }

    // Apply theme colors - directly mutate the reactive state
    Object.assign(colors, preset.colors)
    metadata.name = preset.name
    metadata.description = preset.description
  } else {
    // Apply custom theme object
    if (themeName.colors) {
      Object.assign(colors, themeName.colors)
    }
    if (themeName.metadata) {
      Object.assign(metadata, themeName.metadata)
    }
  }
}

// ============================================================================
// EXPORT - Double function pattern
// ============================================================================

export function getTheme() {
  return () => ({
    // State objects - direct access maintains reactivity!
    colors,
    metadata,

    // Methods
    setTheme,

    // Available theme names
    availableThemes: Object.keys(themes),
  })
}

// Export theme type for TypeScript
export type Theme = ReturnType<ReturnType<typeof getTheme>>
export type ThemeColors = typeof colors
