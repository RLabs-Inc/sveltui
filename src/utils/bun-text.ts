// ============================================================================
// SVELTUI - BUN OPTIMIZED TEXT UTILITIES
// Fast, accurate text measurement and manipulation using Bun's native APIs
// ============================================================================

declare namespace Bun {
  function stringWidth(
    input: string,
    options?: {
      countAnsiEscapeCodes?: boolean;
      ambiguousIsNarrow?: boolean;
    }
  ): number;
  
  function stripANSI(text: string): string;
}

/**
 * Get the display width of a string in terminal columns
 * Handles wide characters, emoji, and ANSI codes correctly
 */
export function getStringWidth(text: string, countAnsi = false): number {
  // Use Bun's native implementation if available
  if (typeof Bun !== 'undefined' && Bun.stringWidth) {
    return Bun.stringWidth(text, { countAnsiEscapeCodes: countAnsi })
  }
  
  // Fallback to basic length (not accurate for emoji/wide chars)
  // This should rarely be used since we're targeting Bun
  return text.length
}

/**
 * Strip ANSI escape codes from text
 * ~57x faster than strip-ansi npm package
 */
export function stripANSI(text: string): string {
  // Use Bun's native implementation if available
  if (typeof Bun !== 'undefined' && Bun.stripANSI) {
    return Bun.stripANSI(text)
  }
  
  // Fallback regex (slower but works)
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Measure the actual display width of text (without ANSI codes)
 * This is what we need for layout calculations
 */
export function measureText(text: string): number {
  const clean = stripANSI(text)
  return getStringWidth(clean)
}

/**
 * Wrap text to fit within a given width, using accurate column counting
 * Handles wide characters, emoji, and ANSI codes correctly
 */
export function wrapTextAccurate(text: string, width: number): string[] {
  if (!text || width <= 0) return []
  
  const lines: string[] = []
  const paragraphs = text.split('\n')
  
  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push('')
      continue
    }
    
    // Quick check: if no special chars, use fast path
    if (measureText(paragraph) <= width) {
      lines.push(paragraph)
      continue
    }
    
    // Word wrap with accurate width measurement
    let currentLine = ''
    let currentWidth = 0
    const words = paragraph.split(' ')
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const wordWidth = measureText(word)
      
      // Handle words longer than width
      if (wordWidth > width) {
        // Flush current line if any
        if (currentLine) {
          lines.push(currentLine)
          currentLine = ''
          currentWidth = 0
        }
        
        // Break long word by character width
        let wordPart = ''
        let partWidth = 0
        
        // Split by actual display width, not character count
        for (const char of word) {
          const charWidth = measureText(char)
          if (partWidth + charWidth > width) {
            if (wordPart) {
              lines.push(wordPart)
              wordPart = ''
              partWidth = 0
            }
          }
          wordPart += char
          partWidth += charWidth
        }
        
        if (wordPart) {
          lines.push(wordPart)
        }
        continue
      }
      
      // Check if word fits on current line
      const spaceWidth = currentLine ? 1 : 0
      if (currentWidth + spaceWidth + wordWidth <= width) {
        // Add to current line
        if (currentLine) {
          currentLine += ' '
          currentWidth += 1
        }
        currentLine += word
        currentWidth += wordWidth
      } else {
        // Start new line
        if (currentLine) {
          lines.push(currentLine)
        }
        currentLine = word
        currentWidth = wordWidth
      }
    }
    
    // Don't forget last line
    if (currentLine) {
      lines.push(currentLine)
    }
  }
  
  return lines
}

/**
 * Truncate text to fit within a given width, adding ellipsis if needed
 * Handles wide characters and emoji correctly
 */
export function truncateText(text: string, maxWidth: number, ellipsis = '...'): string {
  const clean = stripANSI(text)
  const textWidth = getStringWidth(clean)
  
  if (textWidth <= maxWidth) {
    return text
  }
  
  const ellipsisWidth = getStringWidth(ellipsis)
  const targetWidth = maxWidth - ellipsisWidth
  
  if (targetWidth <= 0) {
    return ellipsis.slice(0, maxWidth)
  }
  
  // Truncate by actual display width
  let truncated = ''
  let currentWidth = 0
  
  for (const char of clean) {
    const charWidth = getStringWidth(char)
    if (currentWidth + charWidth > targetWidth) {
      break
    }
    truncated += char
    currentWidth += charWidth
  }
  
  return truncated + ellipsis
}

/**
 * Center text within a given width
 * Returns the text with appropriate padding
 */
export function centerText(text: string, width: number): string {
  const textWidth = measureText(text)
  
  if (textWidth >= width) {
    return text
  }
  
  const totalPadding = width - textWidth
  const leftPadding = Math.floor(totalPadding / 2)
  const rightPadding = totalPadding - leftPadding
  
  return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding)
}

/**
 * Right-align text within a given width
 */
export function rightAlignText(text: string, width: number): string {
  const textWidth = measureText(text)
  
  if (textWidth >= width) {
    return text
  }
  
  return ' '.repeat(width - textWidth) + text
}