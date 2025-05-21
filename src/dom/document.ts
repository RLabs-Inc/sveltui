/**
 * Virtual Terminal DOM Document
 *
 * This module implements the document object that serves as the root
 * of the virtual DOM tree for terminal rendering.
 * 
 * This provides a clean, DOM-like API for Svelte 5's mount function.
 */

import type {
  TerminalNode,
  TerminalElementNode,
  TerminalTextNode,
  TerminalDocumentNode,
} from './nodes'
import { NodeType, generateNodeId } from './nodes'
// Import types only to avoid circular dependencies
import type { TerminalElement, BaseElementProps } from './elements'

/**
 * Implementation of the terminal document node
 */
export class TerminalDocument implements TerminalDocumentNode {
  nodeType = NodeType.DOCUMENT
  nodeName = '#document'
  parentNode: TerminalNode | null = null
  firstChild: TerminalNode | null = null
  lastChild: TerminalNode | null = null
  nextSibling: TerminalNode | null = null
  previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()

  /**
   * Creates a new element node
   * @param tagName - Element tag name
   * @returns The created element node
   */
  createElement(tagName: string): TerminalElementNode {
    return new TerminalElement(tagName, this)
  }

  /**
   * Creates a new text node
   * @param text - Text content
   * @returns The created text node
   */
  createTextNode(text: string): TerminalTextNode {
    return new TerminalText(text, this)
  }

  /**
   * Creates a new comment node
   * @param text - Comment text
   * @returns The created comment node
   */
  createComment(text: string): TerminalNode {
    return new TerminalComment(text, this)
  }

  /**
   * Creates a document fragment
   * @returns The created document fragment
   */
  createDocumentFragment(): TerminalNode {
    return new TerminalDocumentFragment(this)
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    
    this.childNodes.push(child)

    // Update child node
    child.parentNode = this
    child.nextSibling = null

    // Update sibling references
    if (this.lastChild) {
      child.previousSibling = this.lastChild
      this.lastChild.nextSibling = child
    } else {
      child.previousSibling = null
      this.firstChild = child
    }

    this.lastChild = child

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Update node references
    node.parentNode = this
    node.nextSibling = refNode
    node.previousSibling = refNode.previousSibling

    if (refNode.previousSibling) {
      refNode.previousSibling.nextSibling = node
    } else {
      this.firstChild = node
    }

    refNode.previousSibling = node

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }

    // Clear references on the removed child
    child.parentNode = null
    child.previousSibling = null
    child.nextSibling = null

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    
    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalDocument()

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Implementation of a terminal element node
 */
export class TerminalElement implements TerminalElementNode {
  nodeType = NodeType.ELEMENT
  nodeName: string
  tagName: string
  parentNode: TerminalNode | null = null
  firstChild: TerminalNode | null = null
  lastChild: TerminalNode | null = null
  nextSibling: TerminalNode | null = null
  previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  attributes: Record<string, any> = {}
  _instanceId = generateNodeId()
  _terminalElement: TerminalElement;

  /**
   * Creates a new terminal element node
   * @param tagName - Element tag name
   * @param document - The owner document
   */
  constructor(tagName: string, document: TerminalDocumentNode) {
    this.tagName = tagName.toLowerCase()
    this.nodeName = this.tagName
    
    // Initialize with null - the terminal element will be created later
    // by the reconciler through the factory system
    this._terminalElement = null as any;
  }

  /**
   * Sets an attribute value
   * @param name - Attribute name
   * @param value - Attribute value
   */
  setAttribute(name: string, value: any): void {
    this.attributes[name] = value;
    
    // If we have a terminal element already, update it
    if (this._terminalElement && this._terminalElement !== this) {
      // Convert attribute names (e.g., class-name to className)
      const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (typeof this._terminalElement.setProps === 'function') {
        const props = { ...this._terminalElement.props };
        props[propName] = value;
        this._terminalElement.setProps(props);
        this._terminalElement.update();
      }
    }
  }

  /**
   * Gets an attribute value
   * @param name - Attribute name
   * @returns The attribute value or null if not present
   */
  getAttribute(name: string): any {
    return this.attributes[name] ?? null
  }

  /**
   * Removes an attribute
   * @param name - Attribute name
   */
  removeAttribute(name: string): void {
    delete this.attributes[name]
    
    // If we have a terminal element already, update it
    if (this._terminalElement && this._terminalElement !== this) {
      if (typeof this._terminalElement.setProps === 'function') {
        const props = { ...this._terminalElement.props };
        delete props[name];
        this._terminalElement.setProps(props);
        this._terminalElement.update();
      }
    }
  }

  /**
   * Checks if an attribute exists
   * @param name - Attribute name
   * @returns Whether the attribute exists
   */
  hasAttribute(name: string): boolean {
    return name in this.attributes
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    
    this.childNodes.push(child)

    // Update child node
    child.parentNode = this
    child.nextSibling = null

    // Update sibling references
    if (this.lastChild) {
      child.previousSibling = this.lastChild
      this.lastChild.nextSibling = child
    } else {
      child.previousSibling = null
      this.firstChild = child
    }

    this.lastChild = child
    
    // If this element has a terminal element and the child is an element node,
    // we need to connect it to the terminal
    if (this._terminalElement && this._terminalElement !== this && 
        child.nodeType === NodeType.ELEMENT) {
      const childElement = child as TerminalElementNode;
      if (childElement._terminalElement && childElement._terminalElement !== childElement) {
        if (typeof this._terminalElement.appendChild === 'function') {
          this._terminalElement.appendChild(childElement._terminalElement);
        }
      }
    }

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Update node references
    node.parentNode = this
    node.nextSibling = refNode
    node.previousSibling = refNode.previousSibling

    if (refNode.previousSibling) {
      refNode.previousSibling.nextSibling = node
    } else {
      this.firstChild = node
    }

    refNode.previousSibling = node
    
    // If this element has a terminal element and the node is an element node,
    // we need to connect it to the terminal
    if (this._terminalElement && this._terminalElement !== this && 
        node.nodeType === NodeType.ELEMENT && 
        refNode.nodeType === NodeType.ELEMENT) {
      const nodeElement = node as TerminalElementNode;
      const refElement = refNode as TerminalElementNode;
      if (nodeElement._terminalElement && nodeElement._terminalElement !== nodeElement &&
          refElement._terminalElement && refElement._terminalElement !== refElement) {
        if (typeof this._terminalElement.insertBefore === 'function') {
          this._terminalElement.insertBefore(
            nodeElement._terminalElement, 
            refElement._terminalElement
          );
        }
      }
    }

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }
    
    // If this element has a terminal element and the child is an element node,
    // we need to disconnect it from the terminal
    if (this._terminalElement && this._terminalElement !== this && 
        child.nodeType === NodeType.ELEMENT) {
      const childElement = child as TerminalElementNode;
      if (childElement._terminalElement && childElement._terminalElement !== childElement) {
        if (typeof this._terminalElement.removeChild === 'function') {
          this._terminalElement.removeChild(childElement._terminalElement);
        }
      }
    }

    // Clear references on the removed child
    child.parentNode = null
    child.previousSibling = null
    child.nextSibling = null

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    
    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }
    
    // If this element has a terminal element and both children are element nodes,
    // we need to replace them in the terminal
    if (this._terminalElement && this._terminalElement !== this && 
        newChild.nodeType === NodeType.ELEMENT && 
        oldChild.nodeType === NodeType.ELEMENT) {
      const newElement = newChild as TerminalElementNode;
      const oldElement = oldChild as TerminalElementNode;
      if (newElement._terminalElement && newElement._terminalElement !== newElement &&
          oldElement._terminalElement && oldElement._terminalElement !== oldElement) {
        // First remove old child
        if (typeof this._terminalElement.removeChild === 'function') {
          this._terminalElement.removeChild(oldElement._terminalElement);
        }
        // Then append new child
        if (typeof this._terminalElement.appendChild === 'function') {
          this._terminalElement.appendChild(newElement._terminalElement);
        }
      }
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalElement(this.tagName, {} as TerminalDocumentNode)

    // Copy attributes
    for (const [name, value] of Object.entries(this.attributes)) {
      clone.setAttribute(name, value)
    }

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Implementation of a terminal text node
 */
export class TerminalText implements TerminalTextNode {
  nodeType = NodeType.TEXT
  nodeName = '#text'
  nodeValue: string | null
  parentNode: TerminalNode | null = null
  firstChild: TerminalNode | null = null
  lastChild: TerminalNode | null = null
  nextSibling: TerminalNode | null = null
  previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()

  /**
   * Creates a new terminal text node
   * @param text - Text content
   * @param document - The owner document
   */
  constructor(text: string, document: TerminalDocumentNode) {
    this.nodeValue = text
  }

  /**
   * Appends a child node
   * Text nodes cannot have children, so this always throws an error
   */
  appendChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot append child to text node')
  }

  /**
   * Inserts a node before a reference node
   * Text nodes cannot have children, so this always throws an error
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    throw new Error('Cannot insert before in text node')
  }

  /**
   * Removes a child node
   * Text nodes cannot have children, so this always throws an error
   */
  removeChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot remove child from text node')
  }

  /**
   * Replaces a child node with a new node
   * Text nodes cannot have children, so this always throws an error
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    throw new Error('Cannot replace child in text node')
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalText(
      this.nodeValue || '',
      {} as TerminalDocumentNode
    )
    return clone
  }
}

/**
 * Implementation of a terminal comment node
 */
export class TerminalComment implements TerminalNode {
  nodeType = NodeType.COMMENT
  nodeName = '#comment'
  nodeValue: string | null
  parentNode: TerminalNode | null = null
  firstChild: TerminalNode | null = null
  lastChild: TerminalNode | null = null
  nextSibling: TerminalNode | null = null
  previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()

  /**
   * Creates a new terminal comment node
   * @param text - Comment text
   * @param document - The owner document
   */
  constructor(text: string, document: TerminalDocumentNode) {
    this.nodeValue = text
  }

  /**
   * Appends a child node
   * Comment nodes cannot have children, so this always throws an error
   */
  appendChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot append child to comment node')
  }

  /**
   * Inserts a node before a reference node
   * Comment nodes cannot have children, so this always throws an error
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    throw new Error('Cannot insert before in comment node')
  }

  /**
   * Removes a child node
   * Comment nodes cannot have children, so this always throws an error
   */
  removeChild(child: TerminalNode): TerminalNode {
    throw new Error('Cannot remove child from comment node')
  }

  /**
   * Replaces a child node with a new node
   * Comment nodes cannot have children, so this always throws an error
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    throw new Error('Cannot replace child in comment node')
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalComment(
      this.nodeValue || '',
      {} as TerminalDocumentNode
    )
    return clone
  }
}

/**
 * Implementation of a document fragment
 */
export class TerminalDocumentFragment implements TerminalNode {
  nodeType = NodeType.FRAGMENT
  nodeName = '#document-fragment'
  parentNode: TerminalNode | null = null
  firstChild: TerminalNode | null = null
  lastChild: TerminalNode | null = null
  nextSibling: TerminalNode | null = null
  previousSibling: TerminalNode | null = null
  childNodes: TerminalNode[] = []
  _instanceId = generateNodeId()

  /**
   * Creates a new terminal document fragment
   * @param document - The owner document
   */
  constructor(document: TerminalDocumentNode) {
    // No initialization needed
  }

  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode {
    // If child already has a parent, remove it first
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    
    this.childNodes.push(child)

    // Update child node
    child.parentNode = this
    child.nextSibling = null

    // Update sibling references
    if (this.lastChild) {
      child.previousSibling = this.lastChild
      this.lastChild.nextSibling = child
    } else {
      child.previousSibling = null
      this.firstChild = child
    }

    this.lastChild = child

    return child
  }

  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode {
    if (!refNode) {
      return this.appendChild(node)
    }

    // If node already has a parent, remove it first
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = this.childNodes.indexOf(refNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    // Insert node at the correct position
    this.childNodes.splice(index, 0, node)

    // Update node references
    node.parentNode = this
    node.nextSibling = refNode
    node.previousSibling = refNode.previousSibling

    if (refNode.previousSibling) {
      refNode.previousSibling.nextSibling = node
    } else {
      this.firstChild = node
    }

    refNode.previousSibling = node

    return node
  }

  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode {
    const index = this.childNodes.indexOf(child)
    if (index === -1) {
      throw new Error('Child not found')
    }

    // Remove the child
    this.childNodes.splice(index, 1)

    // Update sibling references
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling
    } else {
      this.firstChild = child.nextSibling
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling
    } else {
      this.lastChild = child.previousSibling
    }

    // Clear references on the removed child
    child.parentNode = null
    child.previousSibling = null
    child.nextSibling = null

    return child
  }

  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode {
    // If newChild already has a parent, remove it first
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    
    const index = this.childNodes.indexOf(oldChild)
    if (index === -1) {
      throw new Error('Old child not found')
    }

    // Replace the child
    this.childNodes[index] = newChild

    // Update references
    newChild.parentNode = this
    newChild.previousSibling = oldChild.previousSibling
    newChild.nextSibling = oldChild.nextSibling

    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild
    } else {
      this.firstChild = newChild
    }

    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild
    } else {
      this.lastChild = newChild
    }

    // Clear references on the old child
    oldChild.parentNode = null
    oldChild.previousSibling = null
    oldChild.nextSibling = null

    return oldChild
  }

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep = false): TerminalNode {
    const clone = new TerminalDocumentFragment({} as TerminalDocumentNode)

    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true))
      }
    }

    return clone
  }
}

/**
 * Creates a new document node (the root of the virtual DOM)
 * @returns A new document node
 */
export function createDocument(): TerminalDocumentNode {
  return new TerminalDocument()
}

/**
 * Helper functions to create DOM nodes
 */
export function createElement(tagName: string): TerminalElementNode {
  return document.createElement(tagName);
}

export function createTextNode(text: string): TerminalTextNode {
  return document.createTextNode(text);
}

export function createComment(text: string): TerminalNode {
  return document.createComment(text);
}

export function createDocumentFragment(): TerminalNode {
  return document.createDocumentFragment();
}

/**
 * The global document instance
 */
export const document = createDocument();