import { Theme, TerminalTheme, DarkTheme, LightTheme } from './theme';
import { lighten, darken, withAlpha } from './color-utils';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

// Theme registry
const themeRegistry = new Map<string, Theme>();

// Theme directories
const BUILT_IN_THEMES_DIR = path.resolve(process.cwd(), 'themes/built-in');
const CUSTOM_THEMES_DIR = path.resolve(process.cwd(), 'themes/custom');

// Register default themes
themeRegistry.set('terminal', TerminalTheme);
themeRegistry.set('dark', DarkTheme);
themeRegistry.set('light', LightTheme);

// Load built-in themes
try {
  if (fs.existsSync(BUILT_IN_THEMES_DIR)) {
    const themeFiles = fs.readdirSync(BUILT_IN_THEMES_DIR).filter(file => 
      file.endsWith('.yaml') || file.endsWith('.yml')
    );
    
    themeFiles.forEach(file => {
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
  console.warn('Failed to load built-in themes:', error);
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
  if (typeof theme === 'string') {
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
 */
export function getThemeFiles(): { builtIn: string[], custom: string[] } {
  const result = {
    builtIn: [] as string[],
    custom: [] as string[]
  };
  
  try {
    if (fs.existsSync(BUILT_IN_THEMES_DIR)) {
      result.builtIn = fs.readdirSync(BUILT_IN_THEMES_DIR)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => path.join(BUILT_IN_THEMES_DIR, file));
    }
  } catch (error) {
    console.warn('Failed to read built-in theme directory:', error);
  }
  
  try {
    if (fs.existsSync(CUSTOM_THEMES_DIR)) {
      result.custom = fs.readdirSync(CUSTOM_THEMES_DIR)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => path.join(CUSTOM_THEMES_DIR, file));
    }
  } catch (error) {
    console.warn('Failed to read custom theme directory:', error);
  }
  
  return result;
}

/**
 * Load a theme from a YAML file
 */
export function loadTheme(filePath: string): Theme | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const themeData = yaml.load(fileContent) as Theme;
    
    // Basic validation
    if (!themeData.name || !themeData.colors) {
      console.error('Invalid theme format: missing required properties');
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
  const derived = {
    // Surface color is slightly lighter/darker than background
    surfaceColor: theme.colors.background === null ? 
      null : lighten(theme.colors.background, 0.05),
    
    // Muted text is the same color with some transparency or slightly darker
    mutedText: theme.colors.foreground === null ?
      null : withAlpha(theme.colors.foreground, 0.7),
  };
  
  // Override with any explicitly defined values in the theme
  return { ...derived, ...theme.derived };
}

/**
 * Apply theme to component props
 */
export function applyThemeToProps(
  elementType: string, 
  props: Record<string, any>,
  theme: Theme = activeTheme
): Record<string, any> {
  const derivedColors = getDerivedColors(theme);
  const result = { ...props };
  
  // Common theme application logic based on element type
  switch (elementType.toLowerCase()) {
    case 'box':
      // Apply background color if defined
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }
      
      // For panels, use surface color
      if (props.type === 'panel' && derivedColors.surfaceColor !== null) {
        result.bg = derivedColors.surfaceColor;
      }
      
      // Apply foreground color if defined
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }
      
      // Apply component-specific styling if available
      if (theme.components?.box) {
        if (theme.components.box.background) result.bg = theme.components.box.background;
        if (theme.components.box.foreground) result.fg = theme.components.box.foreground;
        
        // Handle border styling
        if (theme.components.box.border) {
          result.style = result.style || {};
          result.style.border = result.style.border || {};
          
          if (theme.components.box.border.color) {
            result.style.border.fg = theme.components.box.border.color;
          }
          
          if (props.focus && theme.components.box.border.focusColor) {
            result.style.border.fg = theme.components.box.border.focusColor;
          }
        }
      }
      break;
      
    case 'text':
      // Apply foreground color
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }
      
      // If text is marked as muted, use muted text color
      if (props.muted && derivedColors.mutedText !== null) {
        result.fg = derivedColors.mutedText;
      }
      
      // Apply component-specific styling
      if (theme.components?.text) {
        if (props.muted && theme.components.text.muted) {
          result.fg = theme.components.text.muted;
        } else if (theme.components.text.normal) {
          result.fg = theme.components.text.normal;
        }
        
        // If text is bold, apply bold styling
        if (props.bold && theme.components.text.bold?.color) {
          result.fg = theme.components.text.bold.color;
        }
      }
      break;
      
    case 'list':
      // Apply basic styling
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }
      
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }
      
      // Apply component-specific styling
      if (theme.components?.list) {
        if (theme.components.list.background) {
          result.bg = theme.components.list.background;
        }
        
        // Apply item styling
        if (theme.components.list.item) {
          result.style = result.style || {};
          
          // Selected item styling
          if (theme.components.list.item.selected) {
            result.style.selected = result.style.selected || {};
            
            if (theme.components.list.item.selected.background) {
              result.style.selected.bg = theme.components.list.item.selected.background;
            } else {
              result.style.selected.bg = theme.colors.primary;
            }
            
            if (theme.components.list.item.selected.foreground) {
              result.style.selected.fg = theme.components.list.item.selected.foreground;
            }
          } else {
            // Default selected styling
            result.style.selected = {
              bg: theme.colors.primary || 'blue',
              fg: 'white'
            };
          }
          
          // Hover styling
          if (theme.components.list.item.hover?.background) {
            result.style.item = result.style.item || {};
            result.style.item.hover = result.style.item.hover || {};
            result.style.item.hover.bg = theme.components.list.item.hover.background;
          }
        }
      }
      break;
      
    case 'input':
      // Apply basic styling
      if (theme.colors.background !== null) {
        result.bg = theme.colors.background;
      }
      
      if (theme.colors.foreground !== null) {
        result.fg = theme.colors.foreground;
      }
      
      // Apply component-specific styling
      if (theme.components?.input) {
        if (theme.components.input.background) {
          result.bg = theme.components.input.background;
        }
        
        if (theme.components.input.foreground) {
          result.fg = theme.components.input.foreground;
        }
        
        if (theme.components.input.placeholder) {
          result.placeholder = theme.components.input.placeholder;
        }
        
        // Border styling
        if (theme.components.input.border) {
          result.style = result.style || {};
          result.style.border = result.style.border || {};
          
          if (theme.components.input.border.color) {
            result.style.border.fg = theme.components.input.border.color;
          }
          
          // Focus styling
          if (props.focus && theme.components.input.border.focusColor) {
            result.style.border.fg = theme.components.input.border.focusColor;
          }
        }
      }
      break;
  }
  
  return result;
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