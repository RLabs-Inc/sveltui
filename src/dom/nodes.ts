/**
 * Virtual Terminal DOM Node Definitions
 * 
 * This module defines the core node types for the virtual terminal DOM.
 * It provides abstractions similar to the browser DOM but optimized for terminal rendering.
 */

import type { TerminalElement } from './elements';

/**
 * Node types in the virtual terminal DOM
 */
export enum NodeType {
  ELEMENT = 1,
  TEXT = 3,
  COMMENT = 8,
  DOCUMENT = 9,
  FRAGMENT = 11,
}

/**
 * Base interface for all nodes in the virtual terminal DOM
 */
export interface TerminalNode {
  /** Type of node */
  nodeType: NodeType;
  
  /** Parent node */
  parentNode: TerminalNode | null;
  
  /** First child node */
  firstChild: TerminalNode | null;
  
  /** Last child node */
  lastChild: TerminalNode | null;
  
  /** Next sibling node */
  nextSibling: TerminalNode | null;
  
  /** Previous sibling node */
  previousSibling: TerminalNode | null;
  
  /** Node name (element tag name, '#text' for text nodes, etc.) */
  nodeName: string;
  
  /** Child nodes */
  childNodes: TerminalNode[];
  
  /** Associated terminal element (for element nodes) */
  _terminalElement?: TerminalElement;
  
  /** Internal instance ID */
  _instanceId: number;
  
  /**
   * Appends a child node
   * @param child - The node to append
   * @returns The appended node
   */
  appendChild(child: TerminalNode): TerminalNode;
  
  /**
   * Inserts a node before a reference node
   * @param node - The node to insert
   * @param refNode - The reference node
   * @returns The inserted node
   */
  insertBefore(node: TerminalNode, refNode: TerminalNode | null): TerminalNode;
  
  /**
   * Removes a child node
   * @param child - The node to remove
   * @returns The removed node
   */
  removeChild(child: TerminalNode): TerminalNode;
  
  /**
   * Replaces a child node with a new node
   * @param newChild - The new node
   * @param oldChild - The node to replace
   * @returns The replaced node
   */
  replaceChild(newChild: TerminalNode, oldChild: TerminalNode): TerminalNode;
  
  /**
   * Removes this node from its parent (DOM Level 4)
   */
  remove(): void;

  /**
   * Clones the node
   * @param deep - Whether to clone all descendant nodes
   * @returns A clone of the node
   */
  cloneNode(deep?: boolean): TerminalNode;
}

/**
 * Interface for element nodes in the virtual terminal DOM
 */
export interface TerminalElementNode extends TerminalNode {
  /** Element tag name */
  tagName: string;
  
  /** Element attributes */
  attributes: Record<string, any>;
  
  /** Associated terminal element */
  _terminalElement: TerminalElement;
  
  /**
   * Sets an attribute value
   * @param name - Attribute name
   * @param value - Attribute value
   */
  setAttribute(name: string, value: any): void;
  
  /**
   * Gets an attribute value
   * @param name - Attribute name
   * @returns The attribute value or null if not present
   */
  getAttribute(name: string): any;
  
  /**
   * Removes an attribute
   * @param name - Attribute name
   */
  removeAttribute(name: string): void;
  
  /**
   * Checks if an attribute exists
   * @param name - Attribute name
   * @returns Whether the attribute exists
   */
  hasAttribute(name: string): boolean;
}

/**
 * Interface for text nodes in the virtual terminal DOM
 */
export interface TerminalTextNode extends TerminalNode {
  /** Text content */
  nodeValue: string | null;
}

/**
 * Interface for document nodes (the root node)
 */
export interface TerminalDocumentNode extends TerminalNode {
  /** Creates a new element node */
  createElement(tagName: string): TerminalElementNode;
  
  /** Creates a new text node */
  createTextNode(text: string): TerminalTextNode;
  
  /** Creates a comment node */
  createComment(text: string): TerminalNode;
  
  /** Creates a document fragment */
  createDocumentFragment(): TerminalNode;
}

/**
 * Creates a new document node (the root of the virtual DOM)
 * This is implemented in document.ts to avoid circular dependencies
 * @returns A new document node
 */
export function createDocument(): TerminalDocumentNode {
  throw new Error('Use document.ts createDocument implementation instead');
}

/**
 * The current node ID counter
 */
let nextNodeId = 1;

/**
 * Generates a unique node ID
 * @returns A unique node ID
 */
export function generateNodeId(): number {
  return nextNodeId++;
}