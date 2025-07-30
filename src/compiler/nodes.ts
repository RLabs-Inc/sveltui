/**
 * Compiler Node Handlers
 *
 * This module provides handlers for different AST node types
 * during the compilation process. These handlers transform various
 * DOM-related operations to their terminal equivalents.
 */

import MagicString from 'magic-string'
import type {
  PropertyDefinition,
  ClassDeclaration,
  MethodDefinition,
  ClassBody,
} from 'estree'
import type {
  ExtendedNode,
  ExtendedCallExpression,
  ExtendedMemberExpression,
  ExtendedIdentifier,
  ExtendedAssignmentExpression,
} from './types'
import {
  isCallExpression,
  isMemberExpression,
  isIdentifier,
  isAssignmentExpression,
} from './types'
import { transformDOMMethod } from './transform'

/**
 * Handles a call expression node
 *
 * @param node - The call expression node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleCallExpression(
  node: ExtendedCallExpression,
  s: MagicString
): boolean {
  // Handle DOM method calls
  if (node.callee.type === 'MemberExpression') {
    return transformDOMMethod(node, s)
  }

  return false
}

/**
 * Handles a member expression node
 *
 * @param node - The member expression node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleMemberExpression(
  node: ExtendedMemberExpression,
  s: MagicString
): boolean {
  // Handle DOM property access
  if (
    node.object.type === 'Identifier' &&
    (node.object.name === 'document' || node.object.name === 'window') &&
    node.property.type === 'Identifier'
  ) {
    const objectName = node.object.name
    const propertyName = node.property.name

    // Transform document.body and document.head
    if (
      objectName === 'document' &&
      (propertyName === 'body' ||
        propertyName === 'head' ||
        propertyName === 'documentElement')
    ) {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_root`)
      }
      return true
    }

    // Transform window properties
    if (objectName === 'window') {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_window.${propertyName}`)
      }
      return true
    }
  }

  return false
}

/**
 * Handles an identifier node
 *
 * @param node - The identifier node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleIdentifier(
  node: ExtendedIdentifier,
  s: MagicString
): boolean {
  // Handle special global identifiers
  if (node.name === 'document' || node.name === 'window') {
    // Only replace standalone references, not as part of member expressions
    const parent = node.parent
    if (
      !parent ||
      ((parent.type !== 'MemberExpression' ||
        (parent as any).object === node) &&
        parent.type !== 'ImportSpecifier')
    ) {
      if (node.start !== undefined && node.end !== undefined) {
        s.overwrite(node.start, node.end, `__sveltui_${node.name}`)
      }
      return true
    }
  }

  return false
}

/**
 * Handles an assignment expression node
 *
 * @param node - The assignment expression node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleAssignmentExpression(
  node: ExtendedAssignmentExpression,
  s: MagicString
): boolean {
  // Handle assignments to DOM properties
  if (isMemberExpression(node.left)) {
    const leftNode = node.left

    // Check for assignments to textContent
    if (
      isIdentifier(leftNode.property) &&
      leftNode.property.name === 'textContent'
    ) {
      const objectStart = leftNode.object.start
      const objectEnd = leftNode.object.end
      const valueStart = node.right.start
      const valueEnd = node.right.end

      // Get the object and value expressions
      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        valueStart !== undefined &&
        valueEnd !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const objectCode = s.slice(objectStart, objectEnd)
        const valueCode = s.slice(valueStart, valueEnd)

        // Replace with terminal text content setter
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_setText(${objectCode}, ${valueCode})`
        )
      }
      return true
    }

    // Check for assignments to innerHTML
    if (
      isIdentifier(leftNode.property) &&
      leftNode.property.name === 'innerHTML'
    ) {
      const objectStart = leftNode.object.start
      const objectEnd = leftNode.object.end
      const valueStart = node.right.start
      const valueEnd = node.right.end

      // Get the object and value expressions
      if (
        objectStart !== undefined &&
        objectEnd !== undefined &&
        valueStart !== undefined &&
        valueEnd !== undefined &&
        node.start !== undefined &&
        node.end !== undefined
      ) {
        const objectCode = s.slice(objectStart, objectEnd)
        const valueCode = s.slice(valueStart, valueEnd)

        // Replace with terminal content setter (best approximation in terminal)
        s.overwrite(
          node.start,
          node.end,
          `__sveltui_setAttribute(${objectCode}, "content", ${valueCode})`
        )
      }
      return true
    }
  }

  return false
}

/**
 * Handles a class declaration - mainly looking for custom element definitions
 *
 * @param node - The class declaration node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleClassDeclaration(
  node: ClassDeclaration,
  s: MagicString
): boolean {
  // Check if this is a custom element definition
  if (node.body && node.body.type === 'ClassBody') {
    // Look for extends HTMLElement
    if (
      node.superClass &&
      node.superClass.type === 'Identifier' &&
      node.superClass.name === 'HTMLElement'
    ) {
      // This is a custom element definition - we might want to transform it
      // but for now, we just log it
      return false
    }
  }

  return false
}

/**
 * Routes an AST node to the appropriate handler
 *
 * @param node - The AST node
 * @param s - MagicString instance for code manipulation
 * @returns Whether the node was handled
 */
export function handleNode(node: ExtendedNode, s: MagicString): boolean {
  switch (node.type) {
    case 'CallExpression':
      return isCallExpression(node) ? handleCallExpression(node, s) : false
    case 'MemberExpression':
      return isMemberExpression(node) ? handleMemberExpression(node, s) : false
    case 'Identifier':
      return isIdentifier(node) ? handleIdentifier(node, s) : false
    case 'AssignmentExpression':
      return isAssignmentExpression(node)
        ? handleAssignmentExpression(node, s)
        : false
    case 'ClassDeclaration':
      return handleClassDeclaration(node as ClassDeclaration, s)
    default:
      return false
  }
}
