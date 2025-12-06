// @bun
var __require = import.meta.require;

// src/dom/focus-manager.ts
import { NodeType } from "./nodes";
function isFocusable(element) {
  if (element.getAttribute("focusable") === false)
    return false;
  if (element.getAttribute("disabled") === true)
    return false;
  if (element.getAttribute("hidden") === true)
    return false;
  const tagName = element.tagName.toLowerCase();
  const naturallyFocusable = ["input", "button", "checkbox", "list", "textinput", "textarea"];
  if (naturallyFocusable.includes(tagName)) {
    return true;
  }
  const tabIndex = element.getAttribute("tabIndex");
  if (tabIndex !== null && tabIndex !== undefined) {
    return true;
  }
  if (element.getAttribute("onclick") || element.getAttribute("onKeyPress")) {
    return true;
  }
  return false;
}
function getFocusableElements(container) {
  const focusableElements = [];
  function traverse(node) {
    if (node.nodeType === NodeType.ELEMENT) {
      const element = node;
      if (isFocusable(element)) {
        focusableElements.push(element);
      }
      if (element.getAttribute("data-focus-trap") === true) {
        return;
      }
    }
    for (const child of node.childNodes) {
      traverse(child);
    }
  }
  traverse(container);
  return focusableElements;
}
function calculateTabOrder(elements) {
  const elementsWithInfo = elements.map((element) => {
    const terminalElement = element._terminalElement;
    const bounds = terminalElement ? {
      left: terminalElement.left || 0,
      top: terminalElement.top || 0,
      width: terminalElement.width || 0,
      height: terminalElement.height || 0
    } : { left: 0, top: 0, width: 0, height: 0 };
    const tabIndex = element.getAttribute("tabIndex") ?? 0;
    const tabIndexNum = typeof tabIndex === "number" ? tabIndex : parseInt(tabIndex, 10) || 0;
    return {
      element,
      tabIndex: tabIndexNum,
      bounds
    };
  });
  const positiveTabIndex = elementsWithInfo.filter((el) => el.tabIndex > 0);
  const zeroTabIndex = elementsWithInfo.filter((el) => el.tabIndex === 0);
  const negativeTabIndex = elementsWithInfo.filter((el) => el.tabIndex < 0);
  positiveTabIndex.sort((a, b) => a.tabIndex - b.tabIndex);
  zeroTabIndex.sort((a, b) => {
    if (a.bounds.top !== b.bounds.top) {
      return a.bounds.top - b.bounds.top;
    }
    return a.bounds.left - b.bounds.left;
  });
  const inTabOrder = [...positiveTabIndex, ...zeroTabIndex];
  return inTabOrder.map((info) => info.element);
}
function getNextFocusable(current, container, wrap = true) {
  const focusableElements = getFocusableElements(container);
  const orderedElements = calculateTabOrder(focusableElements);
  const currentIndex = orderedElements.indexOf(current);
  if (currentIndex === -1) {
    return orderedElements[0] || null;
  }
  const nextIndex = currentIndex + 1;
  if (nextIndex < orderedElements.length) {
    return orderedElements[nextIndex];
  }
  return wrap ? orderedElements[0] || null : null;
}
function getPreviousFocusable(current, container, wrap = true) {
  const focusableElements = getFocusableElements(container);
  const orderedElements = calculateTabOrder(focusableElements);
  const currentIndex = orderedElements.indexOf(current);
  if (currentIndex === -1) {
    return orderedElements[orderedElements.length - 1] || null;
  }
  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    return orderedElements[prevIndex];
  }
  return wrap ? orderedElements[orderedElements.length - 1] || null : null;
}
function applyFocusRing(element, focused) {
  const terminalElement = element._terminalElement;
  if (!terminalElement)
    return;
  if (focused) {
    const originalStyle = terminalElement.style || {};
    element.setAttribute("data-original-style", JSON.stringify(originalStyle));
    terminalElement.style = {
      ...originalStyle,
      border: {
        type: "line",
        fg: "cyan"
      }
    };
    if ("render" in terminalElement) {
      terminalElement.render();
    }
  } else {
    const originalStyleStr = element.getAttribute("data-original-style");
    if (originalStyleStr) {
      try {
        const originalStyle = JSON.parse(originalStyleStr);
        terminalElement.style = originalStyle;
        element.removeAttribute("data-original-style");
        if ("render" in terminalElement) {
          terminalElement.render();
        }
      } catch (e) {}
    }
  }
}
function createFocusIndicator(screen, position) {
  const blessed = __require("blessed");
  const indicator = blessed.box({
    screen,
    left: position.left - 1,
    top: position.top - 1,
    width: position.width + 2,
    height: position.height + 2,
    border: {
      type: "line",
      fg: "cyan"
    },
    style: {
      border: {
        fg: "cyan"
      },
      transparent: true
    },
    tags: true,
    content: ""
  });
  indicator.setBack();
  return indicator;
}
var defaultKeyboardShortcuts = {
  next: ["tab"],
  previous: ["shift-tab"],
  first: ["home"],
  last: ["end"],
  escape: ["escape"]
};
function setupKeyboardNavigation(screen, callbacks, shortcuts = defaultKeyboardShortcuts) {
  const handleKey = (ch, key) => {
    const keyName = key.shift && key.name ? `shift-${key.name}` : key.name;
    if (shortcuts.next?.includes(keyName) && callbacks.onNext) {
      callbacks.onNext();
    } else if (shortcuts.previous?.includes(keyName) && callbacks.onPrevious) {
      callbacks.onPrevious();
    } else if (shortcuts.first?.includes(keyName) && callbacks.onFirst) {
      callbacks.onFirst();
    } else if (shortcuts.last?.includes(keyName) && callbacks.onLast) {
      callbacks.onLast();
    } else if (shortcuts.escape?.includes(keyName) && callbacks.onEscape) {
      callbacks.onEscape();
    }
  };
  screen.on("keypress", handleKey);
  return () => {
    screen.off("keypress", handleKey);
  };
}
function createFocusTrap(container) {
  container.setAttribute("data-focus-trap", true);
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0)
    return null;
  const orderedElements = calculateTabOrder(focusableElements);
  const firstElement = orderedElements[0];
  const lastElement = orderedElements[orderedElements.length - 1];
  return {
    firstElement,
    lastElement,
    elements: orderedElements,
    activate() {
      if (firstElement) {
        const focusEvent = new Event("focus");
        firstElement.dispatchEvent?.(focusEvent);
      }
    },
    deactivate() {
      container.removeAttribute("data-focus-trap");
    }
  };
}
export {
  setupKeyboardNavigation,
  isFocusable,
  getPreviousFocusable,
  getNextFocusable,
  getFocusableElements,
  defaultKeyboardShortcuts,
  createFocusTrap,
  createFocusIndicator,
  calculateTabOrder,
  applyFocusRing
};
