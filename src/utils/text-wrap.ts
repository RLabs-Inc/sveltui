// ============================================================================
// SVELTUI - TEXT WRAPPING UTILITY
// Improved word wrapping with Bun.stringWidth support
// ============================================================================

import { measureText, stripANSI, getStringWidth } from './bun-text.ts'

// Re-export measureText for convenience
export { measureText }

/**
 * Wraps text to fit within a given width, respecting word boundaries
 * Now uses Bun.stringWidth for accurate measurement of emoji, wide chars, etc.
 * @param text - The text to wrap
 * @param width - Maximum width in characters
 * @returns Array of wrapped lines
 */
export function wrapText(text: string, width: number): string[] {
  if (!text || width <= 0) return []

  const lines: string[] = []
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push('')
      continue
    }

    // Use accurate measurement instead of .length
    if (measureText(paragraph) <= width) {
      lines.push(paragraph)
      continue
    }

    // Word wrap with word boundary detection
    let currentLine = ''
    const words = paragraph.split(' ')

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const wordWidth = measureText(word!)

      // Handle words longer than width
      if (wordWidth > width) {
        // Flush current line if any
        if (currentLine) {
          lines.push(currentLine)
          currentLine = ''
        }

        // Break long word by actual display width
        let wordPart = ''
        let partWidth = 0

        for (const char of word!) {
          const charWidth = getStringWidth(char)
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
      const separator = currentLine ? ' ' : ''
      const testLine = currentLine + separator + word
      const testWidth = measureText(testLine)

      if (testWidth <= width) {
        currentLine = testLine
      } else {
        // Current line is full, start new line
        if (currentLine) {
          lines.push(currentLine)
        }
        currentLine = word!
      }
    }

    // Don't forget last line
    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines
}
