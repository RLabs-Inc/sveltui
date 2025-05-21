/**
 * Terminal Reconciler
 * 
 * This module implements the reconciliation algorithm that efficiently updates
 * the terminal based on changes to the component state. It integrates closely with
 * the Svelte 5 mount/unmount API to efficiently manage updates to the terminal UI.
 */

import type { TerminalNode, TerminalElementNode } from '../dom/nodes';
import type { TerminalElement } from '../dom/elements';
import { document } from '../dom';
import { processOperation as processReconcilerOperation } from './operations';

/**
 * Options for the reconciliation process
 */
export interface ReconcilerOptions {
  /** Whether to enable debug mode with additional logging */
  debug?: boolean;
  
  /** Whether to batch updates */
  batchUpdates?: boolean;
  
  /** Maximum number of operations per batch */
  maxBatchSize?: number;
}

/**
 * Default reconciler options
 */
const DEFAULT_OPTIONS: ReconcilerOptions = {
  debug: false,
  batchUpdates: true,
  maxBatchSize: 100,
};

/**
 * Operation types for the reconciler
 */
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  REPLACE = 'REPLACE',
  APPEND = 'APPEND',
  INSERT = 'INSERT',
}

/**
 * Operation interface for reconciliation
 */
export interface Operation {
  /** Operation type */
  type: OperationType;
  
  /** Target node */
  target: TerminalNode;
  
  /** Parent node for context */
  parent?: TerminalNode;
  
  /** Old properties (for UPDATE) */
  oldProps?: Record<string, any>;
  
  /** New properties (for UPDATE or CREATE) */
  newProps?: Record<string, any>;
  
  /** New node (for REPLACE) */
  newNode?: TerminalNode;
  
  /** Child node (for APPEND or INSERT) */
  child?: TerminalNode;
  
  /** Reference node (for INSERT) */
  beforeChild?: TerminalNode;
  
  /** Additional data for the operation */
  data?: any;
}

/**
 * The Reconciler class manages the process of reconciling changes
 * between the virtual DOM and the terminal display.
 */
export class Reconciler {
  /** Reconciler options */
  private options: ReconcilerOptions;
  
  /** Pending operations queue */
  private pendingOperations: Operation[] = [];
  
  /** Whether a flush is scheduled */
  private isFlushScheduled = false;
  
  /** Whether the reconciler is active */
  private active = true;
  
  /** Operation cache for performance optimization */
  private operationCache: Map<string, any> = new Map();
  
  /**
   * Creates a new Reconciler instance
   * @param options - Reconciler options
   */
  constructor(options: ReconcilerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Creates a new element
   * @param type - Element type
   * @param props - Element properties
   * @param parent - Parent node
   * @returns The created node
   */
  createElement(
    type: string,
    props: Record<string, any>,
    parent?: TerminalNode
  ): TerminalElementNode {
    if (this.options.debug) {
      console.log(`[Reconciler] Creating element: ${type}`);
    }
    
    // Create a new element node
    const node = document.createElement(type);
    
    // Set attributes
    for (const [name, value] of Object.entries(props)) {
      if (value !== undefined && value !== null) {
        node.setAttribute(name, value);
      }
    }
    
    // Queue an operation to create the terminal element
    this.queueOperation({
      type: OperationType.CREATE,
      target: node,
      parent,
      newProps: props,
    });
    
    return node;
  }
  
  /**
   * Updates an element's properties
   * @param node - The element node to update
   * @param oldProps - Old properties
   * @param newProps - New properties
   */
  updateElement(
    node: TerminalElementNode,
    oldProps: Record<string, any>,
    newProps: Record<string, any>
  ): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Updating element: ${node.tagName}`);
    }
    
    // Skip update if nothing changed
    const hasChanges = Object.keys(newProps).some(key => oldProps[key] !== newProps[key]) ||
                      Object.keys(oldProps).some(key => oldProps[key] !== newProps[key]);
    
    if (!hasChanges) {
      return;
    }
    
    // Update attributes on the node
    for (const [name, value] of Object.entries(newProps)) {
      if (value !== oldProps[name]) {
        if (value === undefined || value === null) {
          node.removeAttribute(name);
        } else {
          node.setAttribute(name, value);
        }
      }
    }
    
    // Remove attributes not present in new props
    for (const name of Object.keys(oldProps)) {
      if (!(name in newProps)) {
        node.removeAttribute(name);
      }
    }
    
    // Queue an update operation
    this.queueOperation({
      type: OperationType.UPDATE,
      target: node,
      oldProps,
      newProps,
    });
  }
  
  /**
   * Deletes an element
   * @param node - The node to delete
   */
  deleteElement(node: TerminalNode): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Deleting element: ${node.nodeName}`);
    }
    
    // Queue a delete operation
    this.queueOperation({
      type: OperationType.DELETE,
      target: node,
    });
  }
  
  /**
   * Appends a child to a parent
   * @param parent - Parent node
   * @param child - Child node
   */
  appendChild(parent: TerminalNode, child: TerminalNode): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Appending child to: ${parent.nodeName}`);
    }
    
    // Update the DOM first
    parent.appendChild(child);
    
    // Queue an append operation
    this.queueOperation({
      type: OperationType.APPEND,
      target: parent,
      child,
    });
  }
  
  /**
   * Inserts a child before another child
   * @param parent - Parent node
   * @param child - Child to insert
   * @param beforeChild - Reference child
   */
  insertBefore(
    parent: TerminalNode,
    child: TerminalNode,
    beforeChild: TerminalNode
  ): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Inserting child before: ${beforeChild.nodeName}`);
    }
    
    // Update the DOM first
    parent.insertBefore(child, beforeChild);
    
    // Queue an insert operation
    this.queueOperation({
      type: OperationType.INSERT,
      target: parent,
      child,
      beforeChild,
    });
  }
  
  /**
   * Replaces a node with another
   * @param oldNode - Node to replace
   * @param newNode - Replacement node
   */
  replaceNode(oldNode: TerminalNode, newNode: TerminalNode): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Replacing node: ${oldNode.nodeName}`);
    }
    
    // Get parent node
    const parentNode = oldNode.parentNode;
    if (!parentNode) {
      console.warn('[Reconciler] Cannot replace node: No parent found');
      return;
    }
    
    // Update the DOM first
    parentNode.replaceChild(newNode, oldNode);
    
    // Queue a replace operation
    this.queueOperation({
      type: OperationType.REPLACE,
      target: oldNode,
      newNode,
      parent: parentNode,
    });
  }
  
  /**
   * Queues an operation for processing
   * @param operation - The operation to queue
   */
  private queueOperation(operation: Operation): void {
    this.pendingOperations.push(operation);
    
    // Schedule a flush if needed
    if (this.options.batchUpdates && !this.isFlushScheduled) {
      this.scheduleFlush();
    } else if (!this.options.batchUpdates) {
      // Immediate flush for non-batched updates
      this.flush();
    }
  }
  
  /**
   * Schedules a flush of pending operations
   */
  private scheduleFlush(): void {
    if (this.isFlushScheduled) {
      return;
    }
    
    this.isFlushScheduled = true;
    
    // Use process.nextTick for Node.js or setTimeout for broader compatibility
    setTimeout(() => {
      this.flush();
    }, 0);
  }
  
  /**
   * Flushes pending operations
   */
  flush(): void {
    if (!this.active) {
      return;
    }
    
    this.isFlushScheduled = false;
    
    const operations = this.pendingOperations;
    this.pendingOperations = [];
    
    if (operations.length === 0) {
      return;
    }
    
    if (this.options.debug) {
      console.log(`[Reconciler] Flushing ${operations.length} operations`);
    }
    
    // Process operations
    for (const operation of operations) {
      this.processOperation(operation);
    }
    
    // Clear operation cache after flush
    this.operationCache.clear();
  }
  
  /**
   * Processes a single operation
   * @param operation - The operation to process
   */
  private processOperation(operation: Operation): void {
    if (this.options.debug) {
      console.log(`[Reconciler] Processing operation: ${operation.type}`);
    }
    
    // Delegate to the implementation in operations.ts
    processReconcilerOperation(operation);
  }
  
  /**
   * Stops the reconciler
   */
  stop(): void {
    this.active = false;
    this.pendingOperations = [];
    this.isFlushScheduled = false;
  }
  
  /**
   * Starts the reconciler
   */
  start(): void {
    this.active = true;
  }
  
  /**
   * Forces an immediate full flush
   */
  forceFlush(): void {
    this.flush();
  }
}

/**
 * The global reconciler instance
 */
let globalReconciler: Reconciler | null = null;

/**
 * Gets the global reconciler instance, creating it if necessary
 * @param options - Reconciler options
 * @returns The global reconciler instance
 */
export function getReconciler(options?: ReconcilerOptions): Reconciler {
  if (!globalReconciler) {
    globalReconciler = new Reconciler(options);
  } else if (options) {
    // Update options if provided
    globalReconciler = new Reconciler({
      ...globalReconciler['options'],
      ...options
    });
  }
  
  return globalReconciler;
}

/**
 * Creates a new reconciler instance
 * @param options - Reconciler options
 * @returns A new reconciler instance
 */
export function createReconciler(options?: ReconcilerOptions): Reconciler {
  return new Reconciler(options);
}