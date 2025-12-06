// @bun
// src/dom/text-observer.ts
import { getReconciler } from "../reconciler";
function observeTextNode(textNode) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(textNode, "nodeValue") || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textNode), "nodeValue");
  if (originalDescriptor) {
    Object.defineProperty(textNode, "nodeValue", {
      get: originalDescriptor.get,
      set(value) {
        if (originalDescriptor.set) {
          originalDescriptor.set.call(this, value);
        } else {
          this._nodeValue = value;
        }
        if (this.parentNode && this.parentNode.nodeType === 1) {
          const parentElement = this.parentNode;
          if (parentElement._terminalElement && parentElement._terminalElement.type === "text") {
            parentElement._terminalElement.update();
          }
        }
        const reconciler = getReconciler();
        reconciler.forceFlush();
      },
      enumerable: true,
      configurable: true
    });
  }
}
function setupTextObservation(node) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      observeTextNode(child);
    } else if (child.nodeType === 1) {
      setupTextObservation(child);
    }
  }
}
export {
  setupTextObservation,
  observeTextNode
};
