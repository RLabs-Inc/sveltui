// ============================================================================
// BORDER STYLES
// Extended collection of border characters for various styles
// ============================================================================

export interface BorderCharacters {
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
  horizontal: number
  vertical: number
  // T-junctions for complex layouts
  topT?: number      // ┬
  bottomT?: number   // ┴
  leftT?: number     // ├
  rightT?: number    // ┤
  cross?: number     // ┼
}

export interface BorderCharSet {
  topLeft: string
  topRight: string
  bottomLeft: string
  bottomRight: string
  horizontal: string
  vertical: string
  topT?: string
  bottomT?: string
  leftT?: string
  rightT?: string
  cross?: string
}

// ============================================================================
// BORDER STYLE DEFINITIONS
// ============================================================================

export const BORDERS = {
  // Basic single line
  single: {
    topLeft: '┌'.charCodeAt(0),
    topRight: '┐'.charCodeAt(0),
    bottomLeft: '└'.charCodeAt(0),
    bottomRight: '┘'.charCodeAt(0),
    horizontal: '─'.charCodeAt(0),
    vertical: '│'.charCodeAt(0),
    topT: '┬'.charCodeAt(0),
    bottomT: '┴'.charCodeAt(0),
    leftT: '├'.charCodeAt(0),
    rightT: '┤'.charCodeAt(0),
    cross: '┼'.charCodeAt(0),
  },
  
  // Double line
  double: {
    topLeft: '╔'.charCodeAt(0),
    topRight: '╗'.charCodeAt(0),
    bottomLeft: '╚'.charCodeAt(0),
    bottomRight: '╝'.charCodeAt(0),
    horizontal: '═'.charCodeAt(0),
    vertical: '║'.charCodeAt(0),
    topT: '╦'.charCodeAt(0),
    bottomT: '╩'.charCodeAt(0),
    leftT: '╠'.charCodeAt(0),
    rightT: '╣'.charCodeAt(0),
    cross: '╬'.charCodeAt(0),
  },
  
  // Rounded corners
  rounded: {
    topLeft: '╭'.charCodeAt(0),
    topRight: '╮'.charCodeAt(0),
    bottomLeft: '╰'.charCodeAt(0),
    bottomRight: '╯'.charCodeAt(0),
    horizontal: '─'.charCodeAt(0),
    vertical: '│'.charCodeAt(0),
    topT: '┬'.charCodeAt(0),
    bottomT: '┴'.charCodeAt(0),
    leftT: '├'.charCodeAt(0),
    rightT: '┤'.charCodeAt(0),
    cross: '┼'.charCodeAt(0),
  },
  
  // Heavy/thick lines
  heavy: {
    topLeft: '┏'.charCodeAt(0),
    topRight: '┓'.charCodeAt(0),
    bottomLeft: '┗'.charCodeAt(0),
    bottomRight: '┛'.charCodeAt(0),
    horizontal: '━'.charCodeAt(0),
    vertical: '┃'.charCodeAt(0),
    topT: '┳'.charCodeAt(0),
    bottomT: '┻'.charCodeAt(0),
    leftT: '┣'.charCodeAt(0),
    rightT: '┫'.charCodeAt(0),
    cross: '╋'.charCodeAt(0),
  },
  
  // Dashed line
  dashed: {
    topLeft: '┌'.charCodeAt(0),
    topRight: '┐'.charCodeAt(0),
    bottomLeft: '└'.charCodeAt(0),
    bottomRight: '┘'.charCodeAt(0),
    horizontal: '╌'.charCodeAt(0),
    vertical: '╎'.charCodeAt(0),
    topT: '┬'.charCodeAt(0),
    bottomT: '┴'.charCodeAt(0),
    leftT: '├'.charCodeAt(0),
    rightT: '┤'.charCodeAt(0),
    cross: '┼'.charCodeAt(0),
  },
  
  // Dotted line
  dotted: {
    topLeft: '·'.charCodeAt(0),
    topRight: '·'.charCodeAt(0),
    bottomLeft: '·'.charCodeAt(0),
    bottomRight: '·'.charCodeAt(0),
    horizontal: '·'.charCodeAt(0),
    vertical: '·'.charCodeAt(0),
    topT: '·'.charCodeAt(0),
    bottomT: '·'.charCodeAt(0),
    leftT: '·'.charCodeAt(0),
    rightT: '·'.charCodeAt(0),
    cross: '·'.charCodeAt(0),
  },
  
  // ASCII fallback (for compatibility)
  ascii: {
    topLeft: '+'.charCodeAt(0),
    topRight: '+'.charCodeAt(0),
    bottomLeft: '+'.charCodeAt(0),
    bottomRight: '+'.charCodeAt(0),
    horizontal: '-'.charCodeAt(0),
    vertical: '|'.charCodeAt(0),
    topT: '+'.charCodeAt(0),
    bottomT: '+'.charCodeAt(0),
    leftT: '+'.charCodeAt(0),
    rightT: '+'.charCodeAt(0),
    cross: '+'.charCodeAt(0),
  },
  
  // Block/solid style
  block: {
    topLeft: '█'.charCodeAt(0),
    topRight: '█'.charCodeAt(0),
    bottomLeft: '█'.charCodeAt(0),
    bottomRight: '█'.charCodeAt(0),
    horizontal: '█'.charCodeAt(0),
    vertical: '█'.charCodeAt(0),
    topT: '█'.charCodeAt(0),
    bottomT: '█'.charCodeAt(0),
    leftT: '█'.charCodeAt(0),
    rightT: '█'.charCodeAt(0),
    cross: '█'.charCodeAt(0),
  },
  
  // Mixed style (double horizontal, single vertical)
  mixedDoubleH: {
    topLeft: '╒'.charCodeAt(0),
    topRight: '╕'.charCodeAt(0),
    bottomLeft: '╘'.charCodeAt(0),
    bottomRight: '╛'.charCodeAt(0),
    horizontal: '═'.charCodeAt(0),
    vertical: '│'.charCodeAt(0),
    topT: '╤'.charCodeAt(0),
    bottomT: '╧'.charCodeAt(0),
    leftT: '╞'.charCodeAt(0),
    rightT: '╡'.charCodeAt(0),
    cross: '╪'.charCodeAt(0),
  },
  
  // Mixed style (single horizontal, double vertical)
  mixedDoubleV: {
    topLeft: '╓'.charCodeAt(0),
    topRight: '╖'.charCodeAt(0),
    bottomLeft: '╙'.charCodeAt(0),
    bottomRight: '╜'.charCodeAt(0),
    horizontal: '─'.charCodeAt(0),
    vertical: '║'.charCodeAt(0),
    topT: '╥'.charCodeAt(0),
    bottomT: '╨'.charCodeAt(0),
    leftT: '╟'.charCodeAt(0),
    rightT: '╢'.charCodeAt(0),
    cross: '╫'.charCodeAt(0),
  },
}

// ============================================================================
// BORDER STYLE TYPE
// ============================================================================

export type BorderStyle = keyof typeof BORDERS

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get border characters for a given style
 */
export function getBorderChars(style: BorderStyle | BorderCharacters): BorderCharacters {
  if (typeof style === 'string') {
    return BORDERS[style] || BORDERS.single
  }
  return style
}

/**
 * Create custom border characters from strings
 */
export function createBorderChars(chars: BorderCharSet): BorderCharacters {
  return {
    topLeft: chars.topLeft.charCodeAt(0),
    topRight: chars.topRight.charCodeAt(0),
    bottomLeft: chars.bottomLeft.charCodeAt(0),
    bottomRight: chars.bottomRight.charCodeAt(0),
    horizontal: chars.horizontal.charCodeAt(0),
    vertical: chars.vertical.charCodeAt(0),
    topT: chars.topT?.charCodeAt(0),
    bottomT: chars.bottomT?.charCodeAt(0),
    leftT: chars.leftT?.charCodeAt(0),
    rightT: chars.rightT?.charCodeAt(0),
    cross: chars.cross?.charCodeAt(0),
  }
}

/**
 * Convert border style number to BorderStyle
 * Used for backward compatibility with existing code
 */
export function borderStyleFromNumber(style: number): BorderStyle {
  switch (style) {
    case 1: return 'single'
    case 2: return 'double'
    case 3: return 'rounded'
    case 4: return 'heavy'
    case 5: return 'dashed'
    case 6: return 'dotted'
    case 7: return 'ascii'
    case 8: return 'block'
    default: return 'single'
  }
}

/**
 * Convert BorderStyle to number
 */
export function borderStyleToNumber(style: BorderStyle): number {
  const map: Record<BorderStyle, number> = {
    single: 1,
    double: 2,
    rounded: 3,
    heavy: 4,
    dashed: 5,
    dotted: 6,
    ascii: 7,
    block: 8,
    mixedDoubleH: 9,
    mixedDoubleV: 10,
  }
  return map[style] || 1
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  BORDERS,
  getBorderChars,
  createBorderChars,
  borderStyleFromNumber,
  borderStyleToNumber,
}