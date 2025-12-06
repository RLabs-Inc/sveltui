// @bun
// src/dom/node-utils.ts
function safeSetProperty(node, property, value) {
  try {
    node[property] = value;
  } catch (e) {
    const descriptor = Object.getOwnPropertyDescriptor(node, property);
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(node, property, {
        value,
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable
      });
    } else if (!descriptor) {
      Object.defineProperty(node, property, {
        value,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } else {
      throw e;
    }
  }
}
function updateNodeRelationships(parent, child, previousSibling = null, nextSibling = null) {
  safeSetProperty(child, "parentNode", parent);
  safeSetProperty(child, "previousSibling", previousSibling);
  safeSetProperty(child, "nextSibling", nextSibling);
  if (previousSibling) {
    safeSetProperty(previousSibling, "nextSibling", child);
  }
  if (nextSibling) {
    safeSetProperty(nextSibling, "previousSibling", child);
  }
}
function isTerminalNode(node) {
  return node && typeof node._instanceId === "number";
}
function ensureNodeProperties(node) {
  const requiredProperties = [
    "parentNode",
    "nextSibling",
    "previousSibling",
    "firstChild",
    "lastChild",
    "childNodes"
  ];
  for (const prop of requiredProperties) {
    if (!(prop in node)) {
      Object.defineProperty(node, prop, {
        value: prop === "childNodes" ? [] : null,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  }
}
export {
  updateNodeRelationships,
  safeSetProperty,
  isTerminalNode,
  ensureNodeProperties
};
