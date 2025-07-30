/**
 * DOM to Terminal Synchronization
 * 
 * This module provides efficient synchronization between Happy DOM
 * and terminal elements for reactive updates
 */

import type { TerminalElement } from '../dom/elements'
import { syncTextContent } from './text-sync-fix'

interface SyncMap {
  domNode: Node
  terminalElement: TerminalElement
  children: SyncMap[]
}

/**
 * Builds a synchronization map between DOM and terminal trees
 */
export function buildSyncMap(
  domNode: Node, 
  terminalElement: TerminalElement
): SyncMap {
  const map: SyncMap = {
    domNode,
    terminalElement,
    children: []
  }
  
  // Map children
  if (domNode.nodeType === Node.ELEMENT_NODE) {
    const domChildren = Array.from(domNode.childNodes)
    const terminalChildren = terminalElement.children || []
    
    // Match DOM children to terminal children
    let terminalIndex = 0
    for (let i = 0; i < domChildren.length; i++) {
      const domChild = domChildren[i]
      
      if (domChild.nodeType === Node.TEXT_NODE) {
        // Text nodes don't have corresponding terminal elements
        // Their content is on the parent terminal element
        continue
      }
      
      if (terminalIndex < terminalChildren.length) {
        const childMap = buildSyncMap(domChild, terminalChildren[terminalIndex])
        map.children.push(childMap)
        terminalIndex++
      }
    }
  }
  
  return map
}

/**
 * Synchronizes DOM changes to terminal elements
 */
export function syncDOMToTerminal(
  syncMap: SyncMap,
  screen: any
): void {
  // Update this element
  if (syncMap.domNode.nodeType === Node.ELEMENT_NODE) {
    const element = syncMap.domNode as Element
    const terminalEl = syncMap.terminalElement
    
    // Check for text content in direct text node children
    let textContent = ''
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        textContent += child.textContent || ''
      }
    }
    
    // Update text content if this is a text element
    if (terminalEl.type === 'text' || terminalEl.type === 'ttext') {
      // Use optimized text sync
      syncTextContent(element, terminalEl, screen)
    }
    
    // Update attributes that might have changed
    if (element.hasAttributes()) {
      const updates: Record<string, any> = {}
      let hasUpdates = false
      
      for (const attr of element.attributes) {
        const propName = attr.name === 'class' ? 'className' : attr.name
        let value: any = attr.value
        
        // Convert numeric attributes
        if (['width', 'height', 'top', 'left', 'right', 'bottom'].includes(propName)) {
          const numValue = parseInt(value, 10)
          if (!isNaN(numValue) && numValue.toString() === value) {
            value = numValue
          }
        }
        
        // Check if value changed
        if (terminalEl.props[propName] !== value) {
          updates[propName] = value
          hasUpdates = true
        }
      }
      
      if (hasUpdates) {
        terminalEl.setProps({
          ...terminalEl.props,
          ...updates
        })
      }
    }
  }
  
  // Recursively sync children
  for (const childMap of syncMap.children) {
    syncDOMToTerminal(childMap, screen)
  }
}

/**
 * Sets up reactive synchronization between DOM and terminal
 */
export function setupReactiveSync(
  happyDomRoot: Element,
  terminalRoot: TerminalElement,
  screen: any
): () => void {
  // Build initial sync map
  let syncMap = buildSyncMap(happyDomRoot, terminalRoot)
  
  // Polling interval for updates - configurable via env var or default to 16ms
  // Lower values = more responsive but higher CPU usage
  // 16ms = ~60fps (default - silky smooth!), 25ms = 40fps, 50ms = 20fps
  const SYNC_INTERVAL = process.env.SVELTUI_SYNC_INTERVAL ? 
    parseInt(process.env.SVELTUI_SYNC_INTERVAL, 10) : 16
  
  const interval = setInterval(() => {
    // Rebuild sync map in case structure changed
    syncMap = buildSyncMap(happyDomRoot, terminalRoot)
    
    // Sync changes
    syncDOMToTerminal(syncMap, screen)
    
    // Render screen
    screen.render()
  }, 50)
  
  // Return cleanup function
  return () => {
    clearInterval(interval)
  }
}