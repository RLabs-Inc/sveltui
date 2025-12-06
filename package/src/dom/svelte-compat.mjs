// @bun
// src/dom/svelte-compat.ts
function enhanceForSvelte(node) {
  if (node.nodeType === 1) {
    Object.defineProperty(node, "__attributes", {
      value: {},
      writable: true,
      configurable: true
    });
  }
  if (node.childNodes) {
    for (let i = 0;i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      child.previousSibling = i > 0 ? node.childNodes[i - 1] : null;
      child.nextSibling = i < node.childNodes.length - 1 ? node.childNodes[i + 1] : null;
      enhanceForSvelte(child);
    }
  }
}
function addSvelteMethods(ElementPrototype) {
  if (!ElementPrototype.contains) {
    ElementPrototype.contains = function(node) {
      if (node === this)
        return true;
      let parent = node?.parentNode;
      while (parent) {
        if (parent === this)
          return true;
        parent = parent.parentNode;
      }
      return false;
    };
  }
  if (!ElementPrototype.matches) {
    ElementPrototype.matches = function(selector) {
      if (selector.startsWith(".")) {
        const className = selector.slice(1);
        return this.classList?.contains(className) || false;
      }
      if (selector.startsWith("#")) {
        const id = selector.slice(1);
        return this.id === id;
      }
      return this.tagName?.toLowerCase() === selector.toLowerCase();
    };
  }
}
export {
  enhanceForSvelte,
  addSvelteMethods
};
