/**
 * Reconciler Operations
 * 
 * This module provides implementations for different reconciler operations
 * (create, update, delete, etc.) that efficiently translate DOM operations 
 * to terminal UI updates.
 */

import type { TerminalNode, TerminalElementNode, TerminalTextNode } from '../dom/nodes';
import type { TerminalElement, BaseElementProps } from '../dom/elements';
import { OperationType, type Operation } from './index';
import { createElement } from '../dom/factories';
import { document } from '../dom';

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
    return node._terminalElement;
  }
  
  // Create element based on node type
  const tag = node.tagName.toLowerCase();
  const props = extractElementProps(node);
  
  try {
    // Create new terminal element and attach it to the DOM node
    const element = createElement(tag, props, node);
    
    // Connect to parent if available
    if (parent) {
      parent.appendChild(element);
    }
    
    // Process children
    for (const child of node.childNodes) {
      if (child.nodeType === 1) { // Element node
        const childElement = ensureTerminalElement(child as TerminalElementNode, element);
        if (childElement && !element.children.includes(childElement)) {
          element.appendChild(childElement);
        }
      } else if (child.nodeType === 3) { // Text node
        processTextNode(child as TerminalTextNode, element);
      }
    }
    
    return element;
  } catch (error) {
    console.error(`Error creating terminal element for ${tag}:`, error);
    return null;
  }
}

/**
 * Processes a text node with a parent terminal element
 */
function processTextNode(
  node: TerminalTextNode,
  parent: TerminalElement
): void {
  // Skip empty text nodes
  const content = node.nodeValue || '';
  if (!content.trim()) return;
  
  // For text-containing elements, update the content
  if (parent.type === 'text' || parent.type === 'button' || parent.type === 'input') {
    parent.setProps({ ...parent.props, content });
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
  const element = node._terminalElement;
  
  if (!element) {
    console.warn(`[Operations] Cannot update terminal element: Element not found for node ${node._instanceId}`);
    return;
  }
  
  // Combine old props with new props for update
  const updatedProps = { ...element.props, ...newProps };
  
  // Update the element props
  element.setProps(updatedProps);
}

/**
 * Deletes a terminal element
 */
export function deleteTerminalElement(node: TerminalNode): void {
  // Skip non-element nodes
  if (node.nodeType !== 1) {
    return;
  }
  
  const elementNode = node as TerminalElementNode;
  const element = elementNode._terminalElement;
  
  if (!element) {
    console.warn(`[Operations] Cannot delete terminal element: Element not found for node ${node._instanceId}`);
    return;
  }
  
  // Destroy the element (will clean up children too)
  element.destroy();
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
    return;
  }
  
  const parentElementNode = parentNode as TerminalElementNode;
  const parentElement = parentElementNode._terminalElement;
  
  if (!parentElement) {
    console.warn(`[Operations] Cannot append child: Parent element not found for node ${parentNode._instanceId}`);
    return;
  }
  
  // Handle different child node types
  if (childNode.nodeType === 1) {
    // Element node
    const childElementNode = childNode as TerminalElementNode;
    
    // Get or create the terminal element
    const childElement = ensureTerminalElement(childElementNode, parentElement);
    
    if (!childElement) {
      console.warn(`[Operations] Cannot append child: Failed to create element for node ${childNode._instanceId}`);
      return;
    }
    
    // Only append if not already a child
    if (!parentElement.children.includes(childElement)) {
      parentElement.appendChild(childElement);
    }
  } else if (childNode.nodeType === 3) {
    // Text node
    processTextNode(childNode as TerminalTextNode, parentElement);
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
    return;
  }
  
  const parentElementNode = parentNode as TerminalElementNode;
  const parentElement = parentElementNode._terminalElement;
  
  if (!parentElement) {
    console.warn(`[Operations] Cannot insert child: Parent element not found for node ${parentNode._instanceId}`);
    return;
  }
  
  // Handle different child node types
  if (childNode.nodeType === 1) {
    // Element node
    const childElementNode = childNode as TerminalElementNode;
    
    // Get or create the terminal element
    const childElement = ensureTerminalElement(childElementNode, parentElement);
    
    if (!childElement) {
      console.warn(`[Operations] Cannot insert child: Failed to create element for node ${childNode._instanceId}`);
      return;
    }
    
    // Only process if the reference node is an element
    if (referenceNode.nodeType === 1) {
      const refElementNode = referenceNode as TerminalElementNode;
      const refElement = refElementNode._terminalElement;
      
      if (refElement) {
        // Insert child before reference element
        parentElement.insertBefore(childElement, refElement);
      } else {
        // If reference element doesn't exist, just append
        parentElement.appendChild(childElement);
      }
    } else {
      // No valid reference node, just append
      parentElement.appendChild(childElement);
    }
  } else if (childNode.nodeType === 3) {
    // Text node - handle as appropriate for terminal elements
    processTextNode(childNode as TerminalTextNode, parentElement);
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
    return;
  }
  
  const oldElementNode = oldNode as TerminalElementNode;
  const oldElement = oldElementNode._terminalElement;
  
  if (!oldElement) {
    console.warn(`[Operations] Cannot replace node: Old element not found for node ${oldNode._instanceId}`);
    return;
  }
  
  // Get parent element
  const parentElement = oldElement.parent;
  if (!parentElement) {
    console.warn(`[Operations] Cannot replace node: No parent found for element`);
    return;
  }
  
  // Handle different node types for new node
  if (newNode.nodeType === 1) {
    // Element node
    const newElementNode = newNode as TerminalElementNode;
    
    // Get or create the terminal element
    const newElement = ensureTerminalElement(newElementNode);
    
    if (!newElement) {
      console.warn(`[Operations] Cannot replace node: Failed to create element for node ${newNode._instanceId}`);
      return;
    }
    
    // Replace in parent
    const index = parentElement.children.indexOf(oldElement);
    if (index !== -1) {
      // Remove old element
      parentElement.removeChild(oldElement);
      
      // Insert new element at the same position
      parentElement.appendChild(newElement);
      // TODO: Implement proper ordering when needed
    }
  } else if (newNode.nodeType === 3) {
    // Text node - usually replacing element with text doesn't make sense in terminal UI
    // But we'll handle it by updating the parent's content if appropriate
    const textContent = (newNode as TerminalTextNode).nodeValue || '';
    if (parentElement.type === 'text' || parentElement.type === 'button') {
      parentElement.setProps({ ...parentElement.props, content: textContent });
    }
    
    // Remove the old element
    parentElement.removeChild(oldElement);
  }
}

/**
 * Extracts element properties from a node
 */
export function extractElementProps(node: TerminalElementNode): BaseElementProps {
  const props: BaseElementProps = {};
  
  // Extract attributes
  for (const [name, value] of Object.entries(node.attributes)) {
    // Convert kebab-case to camelCase
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    props[propName] = value;
  }
  
  return props;
}

/**
 * Processes a reconciler operation
 */
export function processOperation(operation: Operation): void {
  try {
    switch (operation.type) {
      case OperationType.CREATE:
        if (operation.target.nodeType === 1) {
          const parentElement = operation.parent?.nodeType === 1 
            ? (operation.parent as TerminalElementNode)._terminalElement 
            : undefined;
            
          ensureTerminalElement(
            operation.target as TerminalElementNode,
            parentElement
          );
        }
        break;
        
      case OperationType.UPDATE:
        if (operation.target.nodeType === 1 && operation.oldProps && operation.newProps) {
          updateTerminalElement(
            operation.target as TerminalElementNode,
            operation.oldProps,
            operation.newProps
          );
        }
        break;
        
      case OperationType.DELETE:
        deleteTerminalElement(operation.target);
        break;
        
      case OperationType.APPEND:
        if (operation.child) {
          appendTerminalChild(operation.target, operation.child);
        }
        break;
        
      case OperationType.INSERT:
        if (operation.child && operation.beforeChild) {
          insertTerminalBefore(operation.target, operation.child, operation.beforeChild);
        }
        break;
        
      case OperationType.REPLACE:
        if (operation.newNode) {
          replaceTerminalNode(operation.target, operation.newNode);
        }
        break;
        
      default:
        console.warn(`[Operations] Unknown operation type: ${(operation as any).type}`);
    }
  } catch (error) {
    console.error(`[Operations] Error processing operation ${operation.type}:`, error);
  }
}