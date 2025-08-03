/**
 * Patches for DOM node compatibility with Svelte 5
 * 
 * This module provides utilities to ensure DOM nodes created by Svelte
 * work properly with our terminal DOM implementation.
 */

/**
 * Makes node properties writable if they are readonly
 */
export function ensureNodePropertiesWritable(node: any): void {
  const properties = ['parentNode', 'nextSibling', 'previousSibling', 'firstChild', 'lastChild']
  
  for (const prop of properties) {
    const descriptor = Object.getOwnPropertyDescriptor(node, prop)
    
    // If property exists and is not writable, make it writable
    if (descriptor && !descriptor.writable && descriptor.configurable) {
      Object.defineProperty(node, prop, {
        ...descriptor,
        writable: true
      })
    }
  }
}

/**
 * Patches appendChild to handle readonly properties
 */
export function patchAppendChild(elementClass: any): void {
  const originalAppendChild = elementClass.prototype.appendChild
  
  elementClass.prototype.appendChild = function(child: any) {
    // Ensure child properties are writable
    ensureNodePropertiesWritable(child)
    
    // Call original appendChild
    return originalAppendChild.call(this, child)
  }
}

/**
 * Patches insertBefore to handle readonly properties
 */
export function patchInsertBefore(elementClass: any): void {
  const originalInsertBefore = elementClass.prototype.insertBefore
  
  elementClass.prototype.insertBefore = function(node: any, refNode: any) {
    // Ensure node properties are writable
    ensureNodePropertiesWritable(node)
    
    // Call original insertBefore
    return originalInsertBefore.call(this, node, refNode)
  }
}

/**
 * Apply all node patches
 */
export function applyNodePatches(Element: any, Document: any): void {
  // Patch Element methods
  patchAppendChild(Element)
  patchInsertBefore(Element)
  
  // Patch Document methods
  patchAppendChild(Document)
  patchInsertBefore(Document)
}