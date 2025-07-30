/**
 * Compiler Transform Utilities
 *
 * This module provides utilities for transforming Svelte's DOM operations
 * into terminal-specific operations for SvelTUI.
 */

import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { MemberExpression, Identifier, Literal } from 'estree'
import type { ExtendedNode, ExtendedCallExpression } from './types'
import { isCallExpression, isMemberExpression } from './types'
import { ELEMENT_MAP } from './index'

/**
 * DOM methods that need to be transformed
 */
export const DOM_METHODS = [
  'createElement',
  'createElementNS',
  'createTextNode',
  'createComment',
  'appendChild',
  'insertBefore',
  'removeChild',
  'replaceChild',
  'setAttribute',
  'getAttribute',
  'removeAttribute',
  'addEventListener',
  'removeEventListener',
]

/**
 * Checks if a node is a document method call
 */
function isDocumentMethodCall(
  node: ExtendedCallExpression,
  methodName: string
): boolean {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'document' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === methodName
  )
}

/**
 * Checks if a node is a method call on an element
 */
function isElementMethodCall(
  node: ExtendedCallExpression,
  methodName: string
): boolean {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === methodName
  )
}

/**
 * Transforms createElement calls to terminal element creation
 */
export function transformCreateElement(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isDocumentMethodCall(node, 'createElement')) {
    if (node.arguments.length > 0 && node.arguments[0].type === 'Literal') {
      // Handle string literals (most common case)
      const elementType = (node.arguments[0] as Literal).value as string
      const terminalType = mapElementType(elementType)

      // Replace with terminal element creation
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_createElement("${terminalType}")`
        )
      }

      return true
    } else if (node.arguments.length > 0) {
      // Handle dynamic element types
      const arg = node.arguments[0]
      if (
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const elementArg = s.slice(arg.start, arg.end)

        // Replace with a function that maps the element type
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_createElement(${elementArg}.toLowerCase() in ${JSON.stringify(
            ELEMENT_MAP
          )} ? ${JSON.stringify(
            ELEMENT_MAP
          )}[${elementArg}.toLowerCase()] : "box")`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Maps an HTML element type to its terminal equivalent
 */
function mapElementType(elementType: string): string {
  return ELEMENT_MAP[elementType.toLowerCase()] || 'box'
}

/**
 * Transforms createTextNode calls to terminal text node creation
 */
export function transformCreateTextNode(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isDocumentMethodCall(node, 'createTextNode')) {
    if (node.arguments.length > 0) {
      const arg = node.arguments[0]
      if (
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const contentArg = s.slice(arg.start, arg.end)

        // Replace with terminal text node creation
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_createTextNode(${contentArg})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms createComment calls to terminal comment node creation
 */
export function transformCreateComment(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isDocumentMethodCall(node, 'createComment')) {
    if (node.arguments.length > 0) {
      const arg = node.arguments[0]
      if (
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const contentArg = s.slice(arg.start, arg.end)

        // Replace with terminal comment node creation
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_createComment(${contentArg})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms appendChild calls to terminal element appendChild
 */
export function transformAppendChild(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'appendChild')) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg = node.arguments[0]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const argCode = s.slice(arg.start, arg.end)

        // Replace with terminal appendChild
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_appendChild(${objectCode}, ${argCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms insertBefore calls to terminal element insertBefore
 */
export function transformInsertBefore(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'insertBefore')) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg1 = node.arguments[0]
      const arg2 = node.arguments[1]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg1.start !== undefined &&
        arg1.end !== undefined &&
        arg2.start !== undefined &&
        arg2.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const newNodeCode = s.slice(arg1.start, arg1.end)
        const refNodeCode = s.slice(arg2.start, arg2.end)

        // Replace with terminal insertBefore
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_insertBefore(${objectCode}, ${newNodeCode}, ${refNodeCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms removeChild calls to terminal element removeChild
 */
export function transformRemoveChild(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'removeChild')) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg = node.arguments[0]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const argCode = s.slice(arg.start, arg.end)

        // Replace with terminal removeChild
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_removeChild(${objectCode}, ${argCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms setAttribute calls to terminal element property setting
 */
export function transformSetAttribute(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'setAttribute')) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg1 = node.arguments[0]
      const arg2 = node.arguments[1]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg1.start !== undefined &&
        arg1.end !== undefined &&
        arg2.start !== undefined &&
        arg2.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const nameCode = s.slice(arg1.start, arg1.end)
        const valueCode = s.slice(arg2.start, arg2.end)

        // Replace with terminal setAttribute
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_setAttribute(${objectCode}, ${nameCode}, ${valueCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms removeAttribute calls to terminal element property removal
 */
export function transformRemoveAttribute(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'removeAttribute')) {
    if (node.arguments.length > 0 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg = node.arguments[0]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg.start !== undefined &&
        arg.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const nameCode = s.slice(arg.start, arg.end)

        // Replace with terminal removeAttribute
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_removeAttribute(${objectCode}, ${nameCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms addEventListener calls to terminal element event binding
 */
export function transformAddEventListener(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'addEventListener')) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg1 = node.arguments[0]
      const arg2 = node.arguments[1]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg1.start !== undefined &&
        arg1.end !== undefined &&
        arg2.start !== undefined &&
        arg2.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const eventCode = s.slice(arg1.start, arg1.end)
        const handlerCode = s.slice(arg2.start, arg2.end)

        // Replace with terminal addEventListener
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_addEventListener(${objectCode}, ${eventCode}, ${handlerCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms removeEventListener calls to terminal element event unbinding
 */
export function transformRemoveEventListener(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  if (isElementMethodCall(node, 'removeEventListener')) {
    if (node.arguments.length >= 2 && isMemberExpression(node.callee)) {
      const callee = node.callee
      const objectStart = callee.object.start
      const objectEnd = callee.object.end
      const arg1 = node.arguments[0]
      const arg2 = node.arguments[1]

      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        arg1.start !== undefined &&
        arg1.end !== undefined &&
        arg2.start !== undefined &&
        arg2.end !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        // Get the object and argument expressions
        const objectCode = s.slice(objectStart, objectEnd)
        const eventCode = s.slice(arg1.start, arg1.end)
        const handlerCode = s.slice(arg2.start, arg2.end)

        // Replace with terminal removeEventListener
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_removeEventListener(${objectCode}, ${eventCode})`
        )
      }

      return true
    }
  }

  return false
}

/**
 * Transforms a DOM method call to a terminal operation
 *
 * @param node - The AST node
 * @param s - MagicString instance
 * @returns Whether the node was transformed
 */
export function transformDOMMethod(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  // Try each transformation in sequence
  return (
    transformCreateElement(node, s) ||
    transformCreateTextNode(node, s) ||
    transformCreateComment(node, s) ||
    transformAppendChild(node, s) ||
    transformInsertBefore(node, s) ||
    transformRemoveChild(node, s) ||
    transformSetAttribute(node, s) ||
    transformRemoveAttribute(node, s) ||
    transformAddEventListener(node, s) ||
    transformRemoveEventListener(node, s)
  )
}
