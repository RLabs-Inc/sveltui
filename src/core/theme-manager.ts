import type { Theme, Color } from "./types";
import { TerminalTheme, DarkTheme, LightTheme } from "./theme";
import { lighten, withAlpha } from "./color-utils";
import * as yaml from "js-yaml";

// Conditionally load Node.js modules
let fs: any = null;
let path: any = null;
let BUILT_IN_THEMES_DIR: string = "";
let CUSTOM_THEMES_DIR: string = "";

// Check if we're running in Node.js environment
const isNodeEnv = typeof process !== 'undefined' && 
  process.versions != null && 
  process.versions.node != null;

// Only import fs/path in Node environment
if (isNodeEnv) {
  try {
    // Dynamic imports to avoid Vite warnings
    fs = require('fs');
    path = require('path');
    
    // Set theme directories
    BUILT_IN_THEMES_DIR = path.resolve(process.cwd(), "themes/built-in");
    CUSTOM_THEMES_DIR = path.resolve(process.cwd(), "themes/custom");
  } catch (e) {
    console.warn('Unable to import Node.js modules:', e);
  }
}

// Theme registry
const themeRegistry = new Map<string, Theme>();

// Register default themes
themeRegistry.set("terminal", TerminalTheme);
themeRegistry.set("dark", DarkTheme);
themeRegistry.set("light", LightTheme);

// Load built-in themes - only in Node environment
if (isNodeEnv && fs && path) {
  try {
    if (fs.existsSync(BUILT_IN_THEMES_DIR)) {
      const themeFiles = fs
        .readdirSync(BUILT_IN_THEMES_DIR)
        .filter((file: string) => file.endsWith(".yaml") || file.endsWith(".yml"));

      themeFiles.forEach((file: string) => {
        try {
          const theme = loadTheme(path.join(BUILT_IN_THEMES_DIR, file));
          if (theme) {
            registerTheme(theme);
          }
        } catch (error) {
          console.warn(`Failed to load built-in theme ${file}:`, error);
        }
      });
    }
  } catch (error) {
    console.warn("Failed to load built-in themes:", error);
  }
}

// Currently active theme
let activeTheme: Theme = TerminalTheme;

/**
 * Get the current active theme
 */
export function getTheme(): Theme {
  return activeTheme;
}

/**
 * Set the active theme by name or theme object
 */
export function setTheme(theme: string | Theme): boolean {
  if (typeof theme === "string") {
    const foundTheme = themeRegistry.get(theme.toLowerCase());
    if (foundTheme) {
      activeTheme = foundTheme;
      return true;
    }
    return false;
  } else {
    activeTheme = theme;
    return true;
  }
}

/**
 * Register a new theme
 */
export function registerTheme(theme: Theme): void {
  themeRegistry.set(theme.name.toLowerCase(), theme);
}

/**
 * Get a list of available theme names from the registry
 */
export function getAvailableThemes(): string[] {
  return Array.from(themeRegistry.keys());
}

/**
 * Get a list of all theme files (both built-in and custom)
 * Only works in Node.js environment
 */
export function getThemeFiles(): { builtIn: string[]; custom: string[] } {
  const result = {
    builtIn: [] as string[],
    custom: [] as string[],
  };

  if (!isNodeEnv || !fs || !path) {
    console.warn("Theme file operations require Node.js environment");
    return result;
  }

  try {
    if (fs.existsSync(BUILT_IN_THEMES_DIR)) {
      result.builtIn = fs
        .readdirSync(BUILT_IN_THEMES_DIR)
        .filter((file: string) => file.endsWith(".yaml") || file.endsWith(".yml"))
        .map((file: string) => path.join(BUILT_IN_THEMES_DIR, file));
    }
  } catch (error) {
    console.warn("Failed to read built-in theme directory:", error);
  }

  try {
    if (fs.existsSync(CUSTOM_THEMES_DIR)) {
      result.custom = fs
        .readdirSync(CUSTOM_THEMES_DIR)
        .filter((file: string) => file.endsWith(".yaml") || file.endsWith(".yml"))
        .map((file: string) => path.join(CUSTOM_THEMES_DIR, file));
    }
  } catch (error) {
    console.warn("Failed to read custom theme directory:", error);
  }

  return result;
}

/**
 * Load a theme from a YAML file
 * Only works in Node.js environment
 */
export function loadTheme(filePath: string): Theme | null {
  if (!isNodeEnv || !fs) {
    console.warn("Theme loading requires Node.js environment");
    return null;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const themeData = yaml.load(fileContent) as Theme;

    // Basic validation
    if (!themeData.name || !themeData.colors) {
      console.error("Invalid theme format: missing required properties");
      return null;
    }

    return themeData;
  } catch (error) {
    console.error(`Error loading theme: ${error}`);
    return null;
  }
}

/**
 * Get derived colors for the theme
 */
export function getDerivedColors(theme: Theme = activeTheme) {
  // Safety check - if theme is undefined or doesn't have colors
  if (!theme || !theme.colors) {
    console.warn(
      "getDerivedColors: Theme or theme.colors is undefined, using default values"
    );
    return {
      surfaceColor: null,
      mutedText: null,
    };
  }

  const derived = {
    // Surface color is slightly lighter/darker than background
    surfaceColor:
      theme.colors.background === null
        ? null
        : lighten(theme.colors.background, 0.05),

    // Muted text is the same color with some transparency or slightly darker
    mutedText:
      theme.colors.foreground === null
        ? null
        : withAlpha(theme.colors.foreground, 0.7),
  };

  // Override with any explicitly defined values in the theme
  return { ...derived, ...theme.derived };
}

/**
 * Create a custom theme with basic colors
 */
export function createTheme(
  name: string,
  colors: {
    primary: Color;
    background: Color;
    foreground: Color;
  }
): Theme {
  // Create a basic theme with minimal configuration
  return {
    name,
    description: `Custom theme: ${name}`,
    author: "User",
    version: "1.0.0",
    colors: {
      primary: colors.primary,
      secondary: colors.primary, // Default to primary
      background: colors.background,
      foreground: colors.foreground,
      success: "green",
      warning: "yellow",
      error: "red",
      info: "blue",
    }
  };
}

/**
 * Apply theme to component props
 */
export function applyThemeToProps(
  elementType: string,
  props: Record<string, any>,
  theme: Theme = activeTheme
): Record<string, any> {
  // Safety check - if no theme, just return original props
  if (!theme) {
    console.warn(
      "applyThemeToProps: Theme is undefined, returning original props"
    );
    return { ...props };
  }

  const derivedColors = getDerivedColors(theme);
  const result = { ...props };

  // Common theme application logic based on element type
  switch (elementType.toLowerCase()) {
    case "box":
      // Apply background color if defined
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }

      // For panels, use surface color
      if (props.type === "panel" && derivedColors.surfaceColor !== null) {
        result.bg = derivedColors.surfaceColor;
      }

      // Apply foreground color if defined
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }

      break;

    case "text":
      // Apply foreground color
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }

      // If text is marked as muted, use muted text color
      if (props.muted && derivedColors.mutedText !== null) {
        result.fg = derivedColors.mutedText;
      }

      break;

    case "list":
      // Apply basic styling
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }

      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }

      break;

    case "input":
      // Apply basic styling
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }

      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }
      break;

    case "select":
      // Apply basic styling
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }

      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }

      // Add tags support for colored text
      result.tags = true;

      // Apply focus indicator using the primary color
      result.style = result.style || {};
      if (props.isFocused || props.focused) {
        // For Select components, we want to highlight the border when focused
        result.style.border = result.style.border || {};
        result.style.border.fg = theme.colors.primary || "blue";
      }

      // Ensure we set style for dropdown list
      if (props.open) {
        // When open, handle the dropdown styling
        result.style.selected = result.style.selected || {};
        result.style.selected.bg = theme.colors.primary || "blue";
        result.style.selected.fg = theme.colors.foreground || "white";
      }
      break;

    case "checkbox":
      // Apply basic styling
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }

      // Add tags support for colored text
      result.tags = true;

      // Set style properties for checkbox states
      result.style = result.style || {};

      // Handle disabled state
      if (props.disabled) {
        result.style.fg = "gray";
      }
      // Handle focus state
      else if (props.isFocused || props.focused) {
        // Use primary color for the focus indicator
        result.style.fg = theme.colors.primary || "blue";
      }
      break;
  }

  return result;
}