/**
 * Text Synchronization Fix
 * 
 * Improves synchronization of text content in reactive contexts,
 * especially for text elements inside #each blocks
 */

import type { TerminalElement } from '../dom/elements'

// Track text elements and their content for efficient updates
const textElementContentMap = new WeakMap<TerminalElement, string>()

/**
 * Optimized text content sync that avoids destroying/recreating elements
 */
export function syncTextContent(
  happyElement: Element,
  terminalElement: TerminalElement,
  screen: any
): boolean {
  // Only process text elements
  if (terminalElement.type !== 'text' && terminalElement.type !== 'ttext') {
    return false
  }
  
  // Get current text content from DOM
  let currentContent = ''
  
  // Check for content attribute first
  if (happyElement.hasAttribute('content')) {
    currentContent = happyElement.getAttribute('content') || ''
  } else {
    // Get text from child text nodes
    for (const child of happyElement.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        currentContent += child.textContent || ''
      }
    }
    currentContent = currentContent.trim()
  }
  
  // Get last known content
  const lastContent = textElementContentMap.get(terminalElement) || ''
  
  // Check if content changed
  if (currentContent !== lastContent) {
    // Update the terminal element
    terminalElement.setProps({
      ...terminalElement.props,
      content: currentContent
    })
    
    // Update tracking
    textElementContentMap.set(terminalElement, currentContent)
    
    // Force immediate render
    if (terminalElement.blessed && screen) {
      screen.render()
    }
    
    return true
  }
  
  return false
}

/**
 * Enhanced mutation observer for text elements
 */
export function createTextAwareMutationObserver(
  happyElement: Element,
  terminalElement: TerminalElement,
  screen: any,
  originalCallback: MutationCallback
): MutationObserver {
  return new MutationObserver((mutations) => {
    let textContentChanged = false
    
    // First check if this is a simple text content update
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' || 
          (mutation.type === 'childList' && terminalElement.type === 'text')) {
        // Try to sync text content without rebuilding
        textContentChanged = syncTextContent(happyElement, terminalElement, screen)
        if (textContentChanged) {
          break
        }
      }
    }
    
    // If text was updated, we're done
    if (textContentChanged) {
      return
    }
    
    // Otherwise, use the original callback for structural changes
    originalCallback(mutations)
  })
}

/**
 * Clears tracked content for an element
 */
export function clearTextContent(terminalElement: TerminalElement): void {
  textElementContentMap.delete(terminalElement)
}