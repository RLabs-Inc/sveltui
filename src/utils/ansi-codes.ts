// ============================================================================
// ANSI ESCAPE CODES - Complete set for terminal control
// ============================================================================

// Cursor control
export const HIDE_CURSOR = '\x1B[?25l'
export const SHOW_CURSOR = '\x1B[?25h'
export const SAVE_CURSOR = '\x1B[s'
export const RESTORE_CURSOR = '\x1B[u'

export function moveTo(x: number, y: number): string {
  return `\x1B[${y};${x}H`
}

export function moveUp(n: number = 1): string {
  return `\x1B[${n}A`
}

export function moveDown(n: number = 1): string {
  return `\x1B[${n}B`
}

export function moveRight(n: number = 1): string {
  return `\x1B[${n}C`
}

export function moveLeft(n: number = 1): string {
  return `\x1B[${n}D`
}

// Screen control
export const CLEAR_SCREEN = '\x1B[2J'
export const CLEAR_LINE = '\x1B[2K'
export const CLEAR_TO_END_OF_LINE = '\x1B[K'
export const CLEAR_TO_END_OF_SCREEN = '\x1B[J'

// Alternative screen buffer
export const ENTER_ALT_SCREEN = '\x1B[?1049h'
export const EXIT_ALT_SCREEN = '\x1B[?1049l'

// Colors
export const RESET = '\x1B[0m'

export function setFgColor(hex: number): string {
  const r = (hex >> 16) & 0xFF
  const g = (hex >> 8) & 0xFF
  const b = hex & 0xFF
  return `\x1B[38;2;${r};${g};${b}m`
}

export function setBgColor(hex: number): string {
  const r = (hex >> 16) & 0xFF
  const g = (hex >> 8) & 0xFF
  const b = hex & 0xFF
  return `\x1B[48;2;${r};${g};${b}m`
}

// 256 color mode
export function setFg256(color: number): string {
  return `\x1B[38;5;${color}m`
}

export function setBg256(color: number): string {
  return `\x1B[48;5;${color}m`
}

// Basic colors
export const FG_BLACK = '\x1B[30m'
export const FG_RED = '\x1B[31m'
export const FG_GREEN = '\x1B[32m'
export const FG_YELLOW = '\x1B[33m'
export const FG_BLUE = '\x1B[34m'
export const FG_MAGENTA = '\x1B[35m'
export const FG_CYAN = '\x1B[36m'
export const FG_WHITE = '\x1B[37m'

export const BG_BLACK = '\x1B[40m'
export const BG_RED = '\x1B[41m'
export const BG_GREEN = '\x1B[42m'
export const BG_YELLOW = '\x1B[43m'
export const BG_BLUE = '\x1B[44m'
export const BG_MAGENTA = '\x1B[45m'
export const BG_CYAN = '\x1B[46m'
export const BG_WHITE = '\x1B[47m'

// Text styles
export const BOLD = '\x1B[1m'
export const DIM = '\x1B[2m'
export const ITALIC = '\x1B[3m'
export const UNDERLINE = '\x1B[4m'
export const BLINK = '\x1B[5m'
export const REVERSE = '\x1B[7m'
export const HIDDEN = '\x1B[8m'
export const STRIKETHROUGH = '\x1B[9m'

// Style flags for bitwise operations
export const StyleFlags = {
  BOLD: 1 << 0,
  DIM: 1 << 1,
  ITALIC: 1 << 2,
  UNDERLINE: 1 << 3,
  BLINK: 1 << 4,
  REVERSE: 1 << 5,
  HIDDEN: 1 << 6,
  STRIKETHROUGH: 1 << 7,
}

export function setTextStyle(style: number): string {
  const codes: string[] = []
  
  if (style & StyleFlags.BOLD) codes.push(BOLD)
  if (style & StyleFlags.DIM) codes.push(DIM)
  if (style & StyleFlags.ITALIC) codes.push(ITALIC)
  if (style & StyleFlags.UNDERLINE) codes.push(UNDERLINE)
  if (style & StyleFlags.BLINK) codes.push(BLINK)
  if (style & StyleFlags.REVERSE) codes.push(REVERSE)
  if (style & StyleFlags.HIDDEN) codes.push(HIDDEN)
  if (style & StyleFlags.STRIKETHROUGH) codes.push(STRIKETHROUGH)
  
  return codes.join('')
}

// Mouse support
export const ENABLE_MOUSE = '\x1B[?1000h\x1B[?1002h\x1B[?1003h\x1B[?1006h'
export const DISABLE_MOUSE = '\x1B[?1000l\x1B[?1002l\x1B[?1003l\x1B[?1006l'

// Scrolling
export function setScrollRegion(top: number, bottom: number): string {
  return `\x1B[${top};${bottom}r`
}

export function scrollUp(n: number = 1): string {
  return `\x1B[${n}S`
}

export function scrollDown(n: number = 1): string {
  return `\x1B[${n}T`
}