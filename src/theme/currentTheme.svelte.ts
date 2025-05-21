import { type Theme, type Color } from '../types'
import { getThemeRegistry } from './theme-utils.svelte'
// import {
//   darken,
//   isDarkColor,
//   lighten,
//   withAlpha,
// } from '../utils/color-utils.svelte'

// Initial theme - this will be replaced by the current theme terminal theme
//this theme gets the default terminal colors from the terminal
// and sets the default theme to the terminal colors
const initialTheme: Theme = {
  name: 'Default',
  description: 'Default theme',
  author: 'RLabs Inc.',
  version: '1.0.0',
  // Default colors - these will be replaced by the terminal colors

  colors: {
    primary: 'blue',
    secondary: 'cyan',
    background: null,
    foreground: null,

    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
  },
  derived: {
    surfaceColor: null,
    mutedText: null,
  },
}

// Current active theme - using state for reactivity
let currentTheme = $state<Theme>(initialTheme)

// // Create reactive derived color values
// let derivedColors = $derived({
//   surfaceColor:
//     currentTheme.derived?.surfaceColor ??
//     (isDarkColor(currentTheme.colors.background ?? '')
//       ? darken(currentTheme.colors.background ?? '', 0.1)
//       : lighten(currentTheme.colors.background ?? '', 0.1)),

//   mutedText:
//     currentTheme.derived?.mutedText ??
//     (isDarkColor(currentTheme.colors.background ?? '')
//       ? lighten(currentTheme.colors.foreground ?? '', 0.5)
//       : darken(currentTheme.colors.foreground ?? '', 0.5)),
// })

// Apply theme to component props
export function applyThemeToProps(
  elementType: string,
  props: Record<string, any>
): Record<string, any> {
  // Safety check - if no theme, just return original props
  if (!currentTheme) {
    console.warn(
      'applyThemeToProps: Theme is undefined, returning original props'
    )
    return { ...props }
  }

  const result = { ...props }

  // Common theme application logic based on element type
  switch (elementType.toLowerCase()) {
    case 'box':
      // Apply background color if defined
      if (currentTheme.colors.background !== null) {
        result.bg = currentTheme.colors.background
      }

      // For panels, use surface color
      // if (props.type === 'panel' && derivedColors.surfaceColor !== null) {
      //   result.bg = derivedColors.surfaceColor
      // }

      // Apply foreground color if defined
      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }

      break

    case 'text':
      // Apply foreground color
      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }

      // If text is marked as muted, use muted text color
      // if (props.muted) {
      //   result.fg = derivedColors.mutedText
      // }

      break

    case 'list':
      // Apply basic styling
      if (currentTheme.colors.background !== null) {
        result.bg = currentTheme.colors.background
      }

      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }

      break

    case 'input':
    case 'textarea':
      // Apply basic styling
      if (currentTheme.colors.background !== null) {
        result.bg = currentTheme.colors.background
      }

      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }
      break

    case 'select':
      // Apply basic styling
      if (currentTheme.colors.background !== null) {
        result.bg = currentTheme.colors.background
      }

      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }

      // Add tags support for colored text
      result.tags = true

      // Apply focus indicator using the primary color
      result.style = result.style || {}
      if (props.isFocused || props.focused) {
        // For Select components, we want to highlight the border when focused
        result.style.border = result.style.border || {}
        result.style.border.fg = currentTheme.colors.primary || 'blue'
      }

      // Ensure we set style for dropdown list
      if (props.open) {
        // When open, handle the dropdown styling
        result.style.selected = result.style.selected || {}
        result.style.selected.bg = currentTheme.colors.primary || 'blue'
        result.style.selected.fg = currentTheme.colors.foreground || 'white'
      }
      break

    case 'checkbox':
      // Apply basic styling
      if (currentTheme.colors.foreground !== null) {
        result.fg = currentTheme.colors.foreground
      }

      // Add tags support for colored text
      result.tags = true

      // Set style properties for checkbox states
      result.style = result.style || {}

      // Handle disabled state
      if (props.disabled) {
        result.style.fg = 'gray'
      }
      // Handle focus state
      else if (props.isFocused || props.focused) {
        // Use primary color for the focus indicator
        result.style.fg = currentTheme.colors.primary || 'blue'
      }
      break
  }

  return result
}

// Export the current theme with all functionality
export function getCurrentTheme() {
  // Get the theme registry
  const themeRegistry = getThemeRegistry()

  // Theme getter methods
  function getColors() {
    return currentTheme.colors
  }

  // function getDerivedColors() {
  //   return derivedColors
  // }

  function getThemeInfo() {
    return {
      name: currentTheme.name,
      description: currentTheme.description,
      author: currentTheme.author,
      version: currentTheme.version,
    }
  }

  // Theme setter methods
  function setTheme(theme: Theme | string) {
    if (typeof theme === 'string') {
      const foundTheme = themeRegistry().getTheme(theme.toLowerCase())
      if (foundTheme) {
        currentTheme = foundTheme
        return true
      }
      return false
    } else {
      currentTheme = theme
      return true
    }
  }

  // Theme registry access
  function getAvailableThemeNames() {
    return themeRegistry().getAvailableThemes()
  }

  function loadThemeFromFile(filePath: string) {
    const theme = themeRegistry().loadTheme(filePath)
    if (theme) {
      themeRegistry().registerTheme(theme)
      return theme
    }
    return null
  }

  function registerCustomTheme(theme: Theme) {
    themeRegistry().registerTheme(theme)
  }

  function createCustomTheme(
    name: string,
    colors: {
      primary: Color
      background: Color
      foreground: Color
    }
  ) {
    const theme = themeRegistry().createTheme(name, colors)
    themeRegistry().registerTheme(theme)
    return theme
  }

  // Return function that gives access to the currentTheme and its methods
  return () => ({
    // Theme state
    currentTheme,

    // Theme getters
    getColors,
    // getDerivedColors,
    getThemeInfo,

    // Theme setters
    setTheme,

    // Theme registry access
    getAvailableThemeNames,
    loadThemeFromFile,
    registerCustomTheme,
    createCustomTheme,

    // Theme application
    applyThemeToProps,
  })
}
