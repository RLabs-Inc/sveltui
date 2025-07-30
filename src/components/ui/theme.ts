/**
 * Theme system for SvelTUI
 * Provides color and style definitions for terminal rendering
 */

export interface ThemeColors {
  // Base text color
  text: string;
  
  // Markdown elements
  emphasis: string;      // italic text
  strong: string;       // bold text
  code: string;         // inline code
  codeBlock: string;    // code block
  link: string;         // hyperlinks
  heading1: string;     // # H1
  heading2: string;     // ## H2
  heading3: string;     // ### H3
  heading4: string;     // #### H4
  heading5: string;     // ##### H5
  heading6: string;     // ###### H6
  quote: string;        // > blockquote
  list: string;         // - list items
  
  // Additional UI colors
  border: string;       // box borders
  background?: string;  // background color (optional)
  selection?: string;   // selected text background
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

/**
 * Get the default theme using terminal's current colors
 */
export function getDefaultTheme(): Theme {
  return {
    name: 'default',
    colors: {
      // Use terminal defaults
      text: 'white',
      emphasis: 'italic',
      strong: 'bold',
      code: 'yellow',
      codeBlock: 'yellow',
      link: 'blue',
      heading1: 'bright-white',
      heading2: 'bright-white',
      heading3: 'white',
      heading4: 'white',
      heading5: 'gray',
      heading6: 'gray',
      quote: 'gray',
      list: 'white',
      border: 'gray'
    }
  };
}

/**
 * Claude-inspired theme with pleasant colors
 */
export function getClaudeTheme(): Theme {
  return {
    name: 'claude',
    colors: {
      text: '#E5D5C8',        // Warm white
      emphasis: '#F5A623',     // Orange for emphasis
      strong: '#FFFFFF',       // Bright white for bold
      code: '#6FCF97',        // Soft green
      codeBlock: '#6FCF97',   // Soft green
      link: '#56B3E9',        // Light blue
      heading1: '#FFFFFF',     // Pure white
      heading2: '#F5F5F5',    // Near white
      heading3: '#E5E5E5',    // Light gray
      heading4: '#D5D5D5',    // Medium-light gray
      heading5: '#C5C5C5',    // Medium gray
      heading6: '#B5B5B5',    // Darker gray
      quote: '#9CA3AF',       // Gray
      list: '#E5D5C8',        // Same as text
      border: '#6B7280',      // Medium gray
      background: '#1A1A1A',  // Dark background
      selection: '#3B82F6'    // Blue selection
    }
  };
}

/**
 * Monokai-inspired theme
 */
export function getMonokaiTheme(): Theme {
  return {
    name: 'monokai',
    colors: {
      text: '#F8F8F2',
      emphasis: '#FD971F',     // Orange
      strong: '#F92672',       // Pink
      code: '#A6E22E',        // Green
      codeBlock: '#A6E22E',
      link: '#66D9EF',        // Cyan
      heading1: '#F92672',    // Pink
      heading2: '#FD971F',    // Orange
      heading3: '#E6DB74',    // Yellow
      heading4: '#A6E22E',    // Green
      heading5: '#66D9EF',    // Cyan
      heading6: '#AE81FF',    // Purple
      quote: '#75715E',       // Comment gray
      list: '#F8F8F2',
      border: '#75715E',
      background: '#272822'
    }
  };
}

/**
 * Parse a YAML theme file (simple parser for basic YAML)
 */
export function parseThemeFromYAML(yamlContent: string): Theme {
  const lines = yamlContent.split('\n');
  const theme: Partial<Theme> = {
    name: 'custom',
    colors: {} as ThemeColors
  };
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    if (trimmed === 'colors:') {
      currentSection = 'colors';
      continue;
    }
    
    if (trimmed.includes(':')) {
      const [key, value] = trimmed.split(':').map(s => s.trim());
      
      if (currentSection === 'colors' && theme.colors) {
        (theme.colors as any)[key] = value.replace(/['"]/g, '');
      } else if (key === 'name') {
        theme.name = value.replace(/['"]/g, '');
      }
    }
  }
  
  // Fill in any missing colors with defaults
  const defaultTheme = getDefaultTheme();
  theme.colors = { ...defaultTheme.colors, ...theme.colors };
  
  return theme as Theme;
}