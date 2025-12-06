// @bun
// src/renderer/dom-sync.ts
import { syncTextContent } from "./text-sync-fix";
function buildSyncMap(domNode, terminalElement) {
  const map = {
    domNode,
    terminalElement,
    children: []
  };
  if (domNode.nodeType === Node.ELEMENT_NODE) {
    const domChildren = Array.from(domNode.childNodes);
    const terminalChildren = terminalElement.children || [];
    let terminalIndex = 0;
    for (let i = 0;i < domChildren.length; i++) {
      const domChild = domChildren[i];
      if (domChild.nodeType === Node.TEXT_NODE) {
        continue;
      }
      if (terminalIndex < terminalChildren.length) {
        const childMap = buildSyncMap(domChild, terminalChildren[terminalIndex]);
        map.children.push(childMap);
        terminalIndex++;
      }
    }
  }
  return map;
}
function syncDOMToTerminal(syncMap, screen) {
  if (syncMap.domNode.nodeType === Node.ELEMENT_NODE) {
    const element = syncMap.domNode;
    const terminalEl = syncMap.terminalElement;
    let textContent = "";
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        textContent += child.textContent || "";
      }
    }
    if (terminalEl.type === "text" || terminalEl.type === "ttext") {
      syncTextContent(element, terminalEl, screen);
    }
    if (element.hasAttributes()) {
      const updates = {};
      let hasUpdates = false;
      for (const attr of element.attributes) {
        const propName = attr.name === "class" ? "className" : attr.name;
        let value = attr.value;
        if (["width", "height", "top", "left", "right", "bottom"].includes(propName)) {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue.toString() === value) {
            value = numValue;
          }
        }
        if (terminalEl.props[propName] !== value) {
          updates[propName] = value;
          hasUpdates = true;
        }
      }
      if (hasUpdates) {
        terminalEl.setProps({
          ...terminalEl.props,
          ...updates
        });
      }
    }
  }
  for (const childMap of syncMap.children) {
    syncDOMToTerminal(childMap, screen);
  }
}
function setupReactiveSync(happyDomRoot, terminalRoot, screen) {
  let syncMap = buildSyncMap(happyDomRoot, terminalRoot);
  const SYNC_INTERVAL = process.env.SVELTUI_SYNC_INTERVAL ? parseInt(process.env.SVELTUI_SYNC_INTERVAL, 10) : 8;
  const interval = setInterval(() => {
    syncMap = buildSyncMap(happyDomRoot, terminalRoot);
    syncDOMToTerminal(syncMap, screen);
    screen.render();
  }, SYNC_INTERVAL);
  return () => {
    clearInterval(interval);
  };
}
export {
  syncDOMToTerminal,
  setupReactiveSync,
  buildSyncMap
};
