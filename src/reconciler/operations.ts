/**
 * Reconciler Operations
 *
 * This module provides implementations for different reconciler operations
 * (create, update, delete, etc.) that efficiently translate DOM operations
 * to terminal UI updates.
 */

import type {
  TerminalNode,
  TerminalElementNode,
  TerminalTextNode,
} from '../dom/nodes'
import type { TerminalElement, BaseElementProps } from '../dom/elements'
import { OperationType, type Operation } from './index'
import { createElement } from '../dom/factories'
import { document } from '../dom'
// Text observation is now handled directly in TerminalText class

/**
 * Parse a CSS style string into an object
 * @param styleStr - CSS style string
 * @returns Style object
 */
function parseStyleAttribute(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {}
  const styles = styleStr.split(';')

  for (const style of styles) {
    const [key, value] = style.split(':').map((s) => s.trim())
    if (key && value) {
      // Convert kebab-case to camelCase
      const propName = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      )
      result[propName] = value
    }
  }

  return result
}

/**
 * Convert CSS styles to blessed-compatible styles
 * @param cssStyles - Object with CSS properties
 * @returns Blessed-compatible style object
 */
function convertCssToBlessed(
  cssStyles: Record<string, string>
): Record<string, any> {
  const blessedStyle: Record<string, any> = {}

  for (const [key, value] of Object.entries(cssStyles)) {
    switch (key) {
      // Colors
      case 'color':
        blessedStyle.fg = value
        break
      case 'backgroundColor':
      case 'background':
        blessedStyle.bg = value
        break

      // Font styles
      case 'fontWeight':
        if (
          value === 'bold' ||
          value === '700' ||
          value === '800' ||
          value === '900'
        ) {
          blessedStyle.bold = true
        }
        break
      case 'textDecoration':
        if (value.includes('underline')) {
          blessedStyle.underline = true
        }
        break
      case 'fontStyle':
        if (value === 'italic') {
          // Blessed doesn't support italic, but we can note it
          blessedStyle.italic = true
        }
        break

      // Border styles
      case 'border':
        // Simple border parsing (e.g., "2px solid #00ff00")
        const borderParts = value.split(' ')
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: 'line',
            fg: borderParts[2] || 'white',
          }
        }
        break
      case 'borderColor':
        if (!blessedStyle.border) {
          blessedStyle.border = { type: 'line' }
        }
        blessedStyle.border.fg = value
        break

      // Spacing - blessed doesn't support these directly
      case 'padding':
      case 'margin':
      case 'marginTop':
      case 'marginRight':
      case 'marginBottom':
      case 'marginLeft':
        // These could be parsed but blessed handles them differently
        break

      // Size and positioning are handled separately in blessed
      case 'width':
      case 'height':
      case 'top':
      case 'left':
      case 'right':
      case 'bottom':
        // These are element properties, not style properties in blessed
        break

      // Text visibility
      case 'visibility':
        if (value === 'hidden') {
          blessedStyle.invisible = true
        }
        break

      // Other CSS properties that don't map to blessed
      default:
        // Ignore or log unhandled properties
        break
    }
  }

  return blessedStyle
}

/**
 * Get the terminal element associated with a DOM node,
 * creating it if it doesn't exist
 */
export function ensureTerminalElement(
  node: TerminalElementNode,
  parent?: TerminalElement
): TerminalElement | null {
  // Check if element already exists
  if (node._terminalElement) {
    return node._terminalElement
  }

  // Create element based on node type
  const tag = node.tagName.toLowerCase()
  const props = extractElementProps(node)

  try {
    // Create new terminal element and attach it to the DOM node
    const element = createElement(tag, props, node)

    // Connect to parent if available
    if (parent) {
      parent.appendChild(element)
    }

    // Process children
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        // Element node
        const childElement = ensureTerminalElement(
          child as TerminalElementNode,
          element
        )
        if (childElement && !element.children.includes(childElement)) {
          element.appendChild(childElement)
        }
      } else if (child.nodeType === 3) {
        // Text node
        processTextNode(child as TerminalTextNode, element)
        // Text observation is now handled directly in TerminalText class
      }
    }

    // Text observation is now handled directly in TerminalText class
    // No need to set up observation here

    return element
  } catch (error) {
    // Only log errors in debug mode or for non-text elements
    if (process.env.DEBUG || tag !== 'text') {
      console.error(`Error creating terminal element for ${tag}:`, error)
    }
    return null
  }
}

/**
 * Processes a text node with a parent terminal element
 */
function processTextNode(
  node: TerminalTextNode,
  parent: TerminalElement
): void {
  // Get text content
  const content = node.nodeValue || ''

  // For text-containing elements, update the content
  if (
    parent.type === 'text' ||
    parent.type === 'button' ||
    parent.type === 'input'
  ) {
    parent.setProps({ ...parent.props, content })
  } else if (parent.type === 'box' && content.trim()) {
    // For box elements with text content, create a text element
    const textElement = createElement('text', {
      top: parent.props.top || 0,
      left: parent.props.left || 0,
      bottom: parent.props.bottom || 0,
      right: parent.props.right || 0,
      width: parent.props.width || '100%',
      height: parent.props.height || '100%',

      content: content.trim(),
      fg: parent.props.fg || 'white',
      style: parent.props.style,
    })
    parent.appendChild(textElement)

    // Create the blessed element immediately if parent has one
    if (parent.blessed && !textElement.blessed) {
      textElement.create(parent.blessed)
    }
  }
}

/**
 * Updates a terminal element with new props
 */
export function updateTerminalElement(
  node: TerminalElementNode,
  oldProps: Record<string, any>,
  newProps: Record<string, any>
): void {
  // Get existing element or create a new one
  const element = node._terminalElement

  if (!element) {
    console.warn(
      `[Operations] Cannot update terminal element: Element not found for node ${node._instanceId}`
    )
    return
  }

  // Combine old props with new props for update
  const updatedProps = { ...element.props, ...newProps }

  // Update the element props
  element.setProps(updatedProps)
}

/**
 * Deletes a terminal element
 */
export function deleteTerminalElement(node: TerminalNode): void {
  // Skip non-element nodes
  if (node.nodeType !== 1) {
    return
  }

  const elementNode = node as TerminalElementNode
  const element = elementNode._terminalElement

  if (!element) {
    console.warn(
      `[Operations] Cannot delete terminal element: Element not found for node ${node._instanceId}`
    )
    return
  }

  // Destroy the element (will clean up children too)
  element.destroy()
}

/**
 * Appends a child node to a parent node
 */
export function appendTerminalChild(
  parentNode: TerminalNode,
  childNode: TerminalNode
): void {
  // Skip non-element nodes for parent
  if (parentNode.nodeType !== 1) {
    return
  }

  const parentElementNode = parentNode as TerminalElementNode
  const parentElement = parentElementNode._terminalElement

  if (!parentElement) {
    console.warn(
      `[Operations] Cannot append child: Parent element not found for node ${parentNode._instanceId}`
    )
    return
  }

  // Handle different child node types
  if (childNode.nodeType === 1) {
    // Element node
    const childElementNode = childNode as TerminalElementNode

    // Get or create the terminal element
    const childElement = ensureTerminalElement(childElementNode, parentElement)

    if (!childElement) {
      console.warn(
        `[Operations] Cannot append child: Failed to create element for node ${childNode._instanceId}`
      )
      return
    }

    // Only append if not already a child
    if (!parentElement.children.includes(childElement)) {
      parentElement.appendChild(childElement)
    }
  } else if (childNode.nodeType === 3) {
    // Text node
    processTextNode(childNode as TerminalTextNode, parentElement)
  }
}

/**
 * Inserts a child node before another node
 */
export function insertTerminalBefore(
  parentNode: TerminalNode,
  childNode: TerminalNode,
  referenceNode: TerminalNode
): void {
  // Skip non-element nodes for parent
  if (parentNode.nodeType !== 1) {
    return
  }

  const parentElementNode = parentNode as TerminalElementNode
  const parentElement = parentElementNode._terminalElement

  if (!parentElement) {
    console.warn(
      `[Operations] Cannot insert child: Parent element not found for node ${parentNode._instanceId}`
    )
    return
  }

  // Handle different child node types
  if (childNode.nodeType === 1) {
    // Element node
    const childElementNode = childNode as TerminalElementNode

    // Get or create the terminal element
    const childElement = ensureTerminalElement(childElementNode, parentElement)

    if (!childElement) {
      console.warn(
        `[Operations] Cannot insert child: Failed to create element for node ${childNode._instanceId}`
      )
      return
    }

    // Only process if the reference node is an element
    if (referenceNode.nodeType === 1) {
      const refElementNode = referenceNode as TerminalElementNode
      const refElement = refElementNode._terminalElement

      if (refElement) {
        // Insert child before reference element
        parentElement.insertBefore(childElement, refElement)
      } else {
        // If reference element doesn't exist, just append
        parentElement.appendChild(childElement)
      }
    } else {
      // No valid reference node, just append
      parentElement.appendChild(childElement)
    }
  } else if (childNode.nodeType === 3) {
    // Text node - handle as appropriate for terminal elements
    processTextNode(childNode as TerminalTextNode, parentElement)
  }
}

/**
 * Replaces a node with another
 */
export function replaceTerminalNode(
  oldNode: TerminalNode,
  newNode: TerminalNode
): void {
  // Only element nodes can be replaced
  if (oldNode.nodeType !== 1) {
    return
  }

  const oldElementNode = oldNode as TerminalElementNode
  const oldElement = oldElementNode._terminalElement

  if (!oldElement) {
    console.warn(
      `[Operations] Cannot replace node: Old element not found for node ${oldNode._instanceId}`
    )
    return
  }

  // Get parent element
  const parentElement = oldElement.parent
  if (!parentElement) {
    console.warn(
      `[Operations] Cannot replace node: No parent found for element`
    )
    return
  }

  // Handle different node types for new node
  if (newNode.nodeType === 1) {
    // Element node
    const newElementNode = newNode as TerminalElementNode

    // Get or create the terminal element
    const newElement = ensureTerminalElement(newElementNode)

    if (!newElement) {
      console.warn(
        `[Operations] Cannot replace node: Failed to create element for node ${newNode._instanceId}`
      )
      return
    }

    // Replace in parent
    const index = parentElement.children.indexOf(oldElement)
    if (index !== -1) {
      // Remove old element
      parentElement.removeChild(oldElement)

      // Insert new element at the same position
      parentElement.appendChild(newElement)
      // TODO: Implement proper ordering when needed
    }
  } else if (newNode.nodeType === 3) {
    // Text node - usually replacing element with text doesn't make sense in terminal UI
    // But we'll handle it by updating the parent's content if appropriate
    const textContent = (newNode as TerminalTextNode).nodeValue || ''
    if (parentElement.type === 'text' || parentElement.type === 'button') {
      parentElement.setProps({ ...parentElement.props, content: textContent })
    }

    // Remove the old element
    parentElement.removeChild(oldElement)
  }
}

/**
 * Extracts element properties from a node
 */
export function extractElementProps(
  node: TerminalElementNode
): BaseElementProps {
  const props: Partial<BaseElementProps> = {}

  // Extract attributes
  for (const [name, value] of Object.entries(node.attributes)) {
    // Convert kebab-case to camelCase
    const propName = name.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    )

    // Special handling for style attribute
    if (name === 'style' && typeof value === 'string') {
      // Parse CSS style string and convert to blessed format
      const cssStyles = parseStyleAttribute(value)
      props[propName as keyof BaseElementProps] = convertCssToBlessed(cssStyles)
    } else {
      props[propName as keyof BaseElementProps] = value
    }
  }

  // Provide default values for required properties
  const defaultStyle = {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white',
    },
    scrollbar: {
      bg: 'white',
    },
    focus: {
      bg: 'blue',
    },
    hover: {
      bg: 'blue',
    },
  }

  // If props has a style, merge it with defaults
  const finalStyle = props.style
    ? { ...defaultStyle, ...props.style }
    : defaultStyle

  const result = {
    // Default positioning and sizing - only used if not specified in props
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '20%', // Small default for testing
    height: '5', // Small default for testing
    // Spread props AFTER defaults so component properties override defaults
    ...props,
    style: finalStyle,
  } as BaseElementProps

  return result
}

/**
 * Processes a reconciler operation
 */
export function processOperation(operation: Operation): void {
  try {
    switch (operation.type) {
      case OperationType.CREATE:
        if (operation.target.nodeType === 1) {
          const parentElement =
            operation.parent?.nodeType === 1
              ? (operation.parent as TerminalElementNode)._terminalElement
              : undefined

          ensureTerminalElement(
            operation.target as TerminalElementNode,
            parentElement
          )
        }
        break

      case OperationType.UPDATE:
        if (
          operation.target.nodeType === 1 &&
          operation.oldProps &&
          operation.newProps
        ) {
          updateTerminalElement(
            operation.target as TerminalElementNode,
            operation.oldProps,
            operation.newProps
          )
        }
        break

      case OperationType.DELETE:
        deleteTerminalElement(operation.target)
        break

      case OperationType.APPEND:
        if (operation.child) {
          appendTerminalChild(operation.target, operation.child)
        }
        break

      case OperationType.INSERT:
        if (operation.child && operation.beforeChild) {
          insertTerminalBefore(
            operation.target,
            operation.child,
            operation.beforeChild
          )
        }
        break

      case OperationType.REPLACE:
        if (operation.newNode) {
          replaceTerminalNode(operation.target, operation.newNode)
        }
        break

      default:
        console.warn(
          `[Operations] Unknown operation type: ${(operation as any).type}`
        )
    }
  } catch (error) {
    console.error(
      `[Operations] Error processing operation ${operation.type}:`,
      error
    )
  }
}
