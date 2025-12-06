// @bun
// src/dom/node-patch.ts
function ensureNodePropertiesWritable(node) {
  const properties = ["parentNode", "nextSibling", "previousSibling", "firstChild", "lastChild"];
  for (const prop of properties) {
    const descriptor = Object.getOwnPropertyDescriptor(node, prop);
    if (descriptor && !descriptor.writable && descriptor.configurable) {
      Object.defineProperty(node, prop, {
        ...descriptor,
        writable: true
      });
    }
  }
}
function patchAppendChild(elementClass) {
  const originalAppendChild = elementClass.prototype.appendChild;
  elementClass.prototype.appendChild = function(child) {
    ensureNodePropertiesWritable(child);
    return originalAppendChild.call(this, child);
  };
}
function patchInsertBefore(elementClass) {
  const originalInsertBefore = elementClass.prototype.insertBefore;
  elementClass.prototype.insertBefore = function(node, refNode) {
    ensureNodePropertiesWritable(node);
    return originalInsertBefore.call(this, node, refNode);
  };
}
function applyNodePatches(Element, Document) {
  patchAppendChild(Element);
  patchInsertBefore(Element);
  patchAppendChild(Document);
  patchInsertBefore(Document);
}
export {
  patchInsertBefore,
  patchAppendChild,
  ensureNodePropertiesWritable,
  applyNodePatches
};
