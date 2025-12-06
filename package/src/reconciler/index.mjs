// @bun
// src/reconciler/index.ts
import { document } from "../dom";
import { processOperation as processReconcilerOperation } from "./operations";
var DEFAULT_OPTIONS = {
  debug: false,
  batchUpdates: true,
  maxBatchSize: 100
};
var OperationType;
((OperationType2) => {
  OperationType2["CREATE"] = "CREATE";
  OperationType2["UPDATE"] = "UPDATE";
  OperationType2["DELETE"] = "DELETE";
  OperationType2["REPLACE"] = "REPLACE";
  OperationType2["APPEND"] = "APPEND";
  OperationType2["INSERT"] = "INSERT";
})(OperationType ||= {});

class Reconciler {
  options;
  pendingOperations = [];
  isFlushScheduled = false;
  active = true;
  operationCache = new Map;
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  createElement(type, props, parent) {
    if (this.options.debug) {
      console.log(`[Reconciler] Creating element: ${type}`);
    }
    const node = document.createElement(type);
    for (const [name, value] of Object.entries(props)) {
      if (value !== undefined && value !== null) {
        node.setAttribute(name, value);
      }
    }
    this.queueOperation({
      type: "CREATE" /* CREATE */,
      target: node,
      parent,
      newProps: props
    });
    return node;
  }
  updateElement(node, oldProps, newProps) {
    if (this.options.debug) {
      console.log(`[Reconciler] Updating element: ${node.tagName}`);
    }
    const hasChanges = Object.keys(newProps).some((key) => oldProps[key] !== newProps[key]) || Object.keys(oldProps).some((key) => oldProps[key] !== newProps[key]);
    if (!hasChanges) {
      return;
    }
    for (const [name, value] of Object.entries(newProps)) {
      if (value !== oldProps[name]) {
        if (value === undefined || value === null) {
          node.removeAttribute(name);
        } else {
          node.setAttribute(name, value);
        }
      }
    }
    for (const name of Object.keys(oldProps)) {
      if (!(name in newProps)) {
        node.removeAttribute(name);
      }
    }
    this.queueOperation({
      type: "UPDATE" /* UPDATE */,
      target: node,
      oldProps,
      newProps
    });
  }
  deleteElement(node) {
    if (this.options.debug) {
      console.log(`[Reconciler] Deleting element: ${node.nodeName}`);
    }
    this.queueOperation({
      type: "DELETE" /* DELETE */,
      target: node
    });
  }
  appendChild(parent, child) {
    if (this.options.debug) {
      console.log(`[Reconciler] Appending child to: ${parent.nodeName}`);
    }
    parent.appendChild(child);
    this.queueOperation({
      type: "APPEND" /* APPEND */,
      target: parent,
      child
    });
  }
  insertBefore(parent, child, beforeChild) {
    if (this.options.debug) {
      console.log(`[Reconciler] Inserting child before: ${beforeChild.nodeName}`);
    }
    parent.insertBefore(child, beforeChild);
    this.queueOperation({
      type: "INSERT" /* INSERT */,
      target: parent,
      child,
      beforeChild
    });
  }
  replaceNode(oldNode, newNode) {
    if (this.options.debug) {
      console.log(`[Reconciler] Replacing node: ${oldNode.nodeName}`);
    }
    const parentNode = oldNode.parentNode;
    if (!parentNode) {
      console.warn("[Reconciler] Cannot replace node: No parent found");
      return;
    }
    parentNode.replaceChild(newNode, oldNode);
    this.queueOperation({
      type: "REPLACE" /* REPLACE */,
      target: oldNode,
      newNode,
      parent: parentNode
    });
  }
  queueOperation(operation) {
    this.pendingOperations.push(operation);
    if (this.options.batchUpdates && !this.isFlushScheduled) {
      this.scheduleFlush();
    } else if (!this.options.batchUpdates) {
      this.flush();
    }
  }
  scheduleFlush() {
    if (this.isFlushScheduled) {
      return;
    }
    this.isFlushScheduled = true;
    setTimeout(() => {
      this.flush();
    }, 0);
  }
  flush() {
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
    for (const operation of operations) {
      this.processOperation(operation);
    }
    this.operationCache.clear();
  }
  processOperation(operation) {
    if (this.options.debug) {
      console.log(`[Reconciler] Processing operation: ${operation.type}`);
    }
    processReconcilerOperation(operation);
  }
  stop() {
    this.active = false;
    this.pendingOperations = [];
    this.isFlushScheduled = false;
  }
  start() {
    this.active = true;
  }
  forceFlush() {
    this.flush();
  }
}
var globalReconciler = null;
function getReconciler(options) {
  if (!globalReconciler) {
    globalReconciler = new Reconciler(options);
  } else if (options) {
    globalReconciler = new Reconciler({
      ...globalReconciler["options"],
      ...options
    });
  }
  return globalReconciler;
}
function createReconciler(options) {
  return new Reconciler(options);
}
export {
  getReconciler,
  createReconciler,
  Reconciler,
  OperationType
};
