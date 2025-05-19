import { Color } from './theme';

// Simple color utilities for theme variation

/**
 * Lightens a color by the given amount
 * @param color The color to lighten (hex, named color, or null)
 * @param amount Amount to lighten (0-1)
 * @returns Lightened color or null if input was null
 */
export function lighten(color: Color, amount: number = 0.1): Color {
  if (color === null) return null;
  
  try {
    // For named colors, we return the name with "bright" prefix if amount is significant
    if (isNamedColor(color) && amount >= 0.3) {
      return `bright${color}`;
    }
    
    // For hex colors, convert to HSL, adjust lightness, convert back
    if (color.startsWith('#')) {
      const [h, s, l] = hexToHsl(color);
      return hslToHex(h, s, Math.min(1, l + amount));
    }
    
    // Default fallback - return original color
    return color;
  } catch (e) {
    // If any error occurs, return the original color
    return color;
  }
}

/**
 * Darkens a color by the given amount
 * @param color The color to darken (hex, named color, or null)
 * @param amount Amount to darken (0-1)
 * @returns Darkened color or null if input was null
 */
export function darken(color: Color, amount: number = 0.1): Color {
  if (color === null) return null;
  
  try {
    // Named colors - can't go darker than the base named color
    if (isNamedColor(color)) {
      // If it's a bright color and amount is significant, return the base color
      if (color.startsWith('bright') && amount >= 0.3) {
        return color.replace('bright', '');
      }
      return color;
    }
    
    // For hex colors, convert to HSL, adjust lightness, convert back
    if (color.startsWith('#')) {
      const [h, s, l] = hexToHsl(color);
      return hslToHex(h, s, Math.max(0, l - amount));
    }
    
    // Default fallback
    return color;
  } catch (e) {
    return color;
  }
}

/**
 * Adds transparency to a color
 * @param color The color to modify
 * @param alpha The alpha value (0-1)
 * @returns Color with alpha or null if input was null
 */
export function withAlpha(color: Color, alpha: number): Color {
  if (color === null) return null;
  
  try {
    // For named colors, we use a simple approach
    if (isNamedColor(color)) {
      return `${color}-alpha${Math.round(alpha * 100)}`;
    }
    
    // For hex colors, convert to rgba
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    
    return color;
  } catch (e) {
    return color;
  }
}

// Helper functions

/**
 * Check if a color is a named terminal color
 */
function isNamedColor(color: string): boolean {
  const namedColors = [
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'brightblack', 'brightred', 'brightgreen', 'brightyellow', 
    'brightblue', 'brightmagenta', 'brightcyan', 'brightwhite'
  ];
  
  return namedColors.includes(color);
}

/**
 * Convert hex color to HSL components
 */
function hexToHsl(hex: string): [number, number, number] {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}