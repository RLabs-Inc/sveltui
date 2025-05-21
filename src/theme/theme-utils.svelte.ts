import type { Theme, Color } from '../types'
import * as yaml from 'js-yaml'

// Theme registry - using module level state for reactivity
let themeRegistry = $state<Map<string, Theme>>(new Map())
let fs: any = null
let path: any = null
let BUILT_IN_THEMES_DIR: string = ''
let CUSTOM_THEMES_DIR: string = ''

// Check if we're in a Node.js environment
const isNodeEnv =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null

let themesPaths = $derived.by(() => {
  if (isNodeEnv) {
    try {
      // import fs and path dynamically to avoid Vite warnings
      fs = require('fs')
      path = require('path')
      // Set theme directories
      BUILT_IN_THEMES_DIR = path.resolve(process.cwd(), 'themes/built-in')
      CUSTOM_THEMES_DIR = path.resolve(process.cwd(), 'themes/custom')
    } catch (error) {
      console.warn('Error checking theme directories:', error)
    }
    // Return the paths to the directories
    return {
      builtIn: fs ? fs.readdirSync(BUILT_IN_THEMES_DIR) : [],
      custom: fs ? fs.readdirSync(CUSTOM_THEMES_DIR) : [],
    }
  }
})

// Export the theme registry and methods using our reactive pattern
export function getThemeRegistry() {
  // Method to reinitialize the theme registry
  function refreshThemes() {
    initializeThemes()
  }

  // Register a new theme
  function registerTheme(theme: Theme): void {
    const updatedRegistry = new Map(themeRegistry)
    updatedRegistry.set(theme.name.toLowerCase(), theme)
    themeRegistry = updatedRegistry
  }

  // Get a theme by name
  function getTheme(name: string): Theme | undefined {
    return themeRegistry.get(name.toLowerCase())
  }

  // Get a list of available theme names
  function getAvailableThemes(): string[] {
    return Array.from(themeRegistry.keys())
  }

  // Load a theme from a YAML file
  // Only works in Node.js environment
  function loadTheme(filePath: string): Theme | null {
    if (!isNodeEnv || !fs) {
      console.warn('Theme loading requires Node.js environment')
      return null
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const themeData = yaml.load(fileContent) as Theme

      // Basic validation
      if (!themeData.name || !themeData.colors) {
        console.error('Invalid theme format: missing required properties')
        return null
      }

      return themeData
    } catch (error) {
      console.error(`Error loading theme: ${error}`)
      return null
    }
  }

  // Load themes from directory
  function loadThemesFromDirectory(directoryPath: string) {
    if (!isNodeEnv || !fs || !path || !directoryPath) return

    try {
      if (fs.existsSync(directoryPath)) {
        const themeFiles = fs
          .readdirSync(directoryPath)
          .filter(
            (file: string) => file.endsWith('.yaml') || file.endsWith('.yml')
          )

        themeFiles.forEach((file: string) => {
          try {
            const theme = loadTheme(path.join(directoryPath, file))
            if (theme) {
              registerTheme(theme)
            }
          } catch (error) {
            console.warn(`Failed to load theme ${file}:`, error)
          }
        })
      }
    } catch (error) {
      console.warn(`Failed to load themes from ${directoryPath}:`, error)
    }
  }

  // Initialize with all themes
  function initializeThemes() {
    // Clear registry before initializing
    themeRegistry = new Map()

    // Load built-in themes from YAML files
    loadThemesFromDirectory(themesPaths?.builtIn)

    // Load custom themes from YAML files
    loadThemesFromDirectory(themesPaths?.custom)
  }

  // Get a list of all theme files (both built-in and custom)
  // Only works in Node.js environment
  function getThemeFiles(): { builtIn: string[]; custom: string[] } {
    const result = {
      builtIn: [] as string[],
      custom: [] as string[],
    }

    if (!isNodeEnv || !fs || !path) {
      console.warn('Theme file operations require Node.js environment')
      return result
    }

    try {
      if (fs.existsSync(themesPaths?.builtIn)) {
        result.builtIn = fs
          .readdirSync(themesPaths?.builtIn)
          .filter(
            (file: string) => file.endsWith('.yaml') || file.endsWith('.yml')
          )
          .map((file: string) => path.join(themesPaths?.builtIn, file))
      }
    } catch (error) {
      console.warn('Failed to read built-in theme directory:', error)
    }

    try {
      if (fs.existsSync(themesPaths?.custom)) {
        result.custom = fs
          .readdirSync(themesPaths?.custom)
          .filter(
            (file: string) => file.endsWith('.yaml') || file.endsWith('.yml')
          )
          .map((file: string) => path.join(themesPaths?.custom, file))
      }
    } catch (error) {
      console.warn('Failed to read custom theme directory:', error)
    }

    return result
  }

  // Create a custom theme with basic colors
  function createTheme(
    name: string,
    colors: {
      primary: Color
      background: Color
      foreground: Color
    }
  ): Theme {
    // Create a basic theme with minimal configuration
    return {
      name,
      description: `Custom theme: ${name}`,
      author: 'User',
      version: '1.0.0',
      colors: {
        primary: colors.primary,
        secondary: colors.primary, // Default to primary
        background: colors.background,
        foreground: colors.foreground,
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'blue',
      },
    }
  }

  // Return function that gives access to the registry and its methods
  return () => ({
    // State
    themeRegistry,
    themesPaths,
    // Theme registry methods
    getTheme,
    registerTheme,
    getAvailableThemes,
    getThemeFiles,
    loadTheme,
    createTheme,
    refreshThemes,
  })
}
