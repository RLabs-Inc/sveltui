// @bun
// src/dom/focus-context-simple.ts
class SimpleFocusContextImpl {
  focusedElement = null;
  focusHistory = [];
  registeredElements = new Set;
  focusTrapContainer = null;
  screen = null;
  keyHandler = null;
  constructor() {}
  focus(element) {
    if (!this.registeredElements.has(element))
      return;
    if (element.getAttribute("focusable") === false)
      return;
    if (element.getAttribute("disabled") === true)
      return;
    if (element.getAttribute("hidden") === true)
      return;
    if (this.focusedElement && this.focusedElement !== element) {
      this.blur();
    }
    this.focusedElement = element;
    const terminalElement = element._terminalElement;
    if (terminalElement && "focus" in terminalElement) {
      terminalElement.focus();
    }
    const focusEvent = new Event("focus");
    element.dispatchEvent?.(focusEvent);
  }
  blur() {
    if (!this.focusedElement)
      return;
    const element = this.focusedElement;
    this.focusedElement = null;
    const terminalElement = element._terminalElement;
    if (terminalElement && "blur" in terminalElement) {
      terminalElement.blur();
    }
    const blurEvent = new Event("blur");
    element.dispatchEvent?.(blurEvent);
  }
  focusNext() {
    const elements = this.getFocusableElements();
    if (elements.length === 0)
      return;
    const currentIndex = elements.indexOf(this.focusedElement);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= elements.length) {
      nextIndex = 0;
    }
    this.focus(elements[nextIndex]);
  }
  focusPrevious() {
    const elements = this.getFocusableElements();
    if (elements.length === 0)
      return;
    const currentIndex = elements.indexOf(this.focusedElement);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = elements.length - 1;
    }
    this.focus(elements[prevIndex]);
  }
  registerElement(element) {
    this.registeredElements.add(element);
    if (!this.screen && element._terminalElement?.screen) {
      this.screen = element._terminalElement.screen;
      this.setupKeyboardHandler();
    }
  }
  unregisterElement(element) {
    this.registeredElements.delete(element);
    if (this.focusedElement === element) {
      this.blur();
    }
    this.focusHistory = this.focusHistory.filter((el) => el !== element);
  }
  pushFocusHistory(element) {
    if (this.focusHistory.length >= 10) {
      this.focusHistory = this.focusHistory.slice(-9);
    }
    this.focusHistory.push(element);
  }
  restoreFocus() {
    while (this.focusHistory.length > 0) {
      const element = this.focusHistory.pop();
      if (this.registeredElements.has(element) && element.getAttribute("focusable") !== false && element.getAttribute("disabled") !== true && element.getAttribute("hidden") !== true) {
        this.focus(element);
        return;
      }
    }
    const elements = this.getFocusableElements();
    if (elements.length > 0) {
      this.focus(elements[0]);
    }
  }
  trapFocus(container) {
    this.focusTrapContainer = container;
    const elements = this.getFocusableElements();
    if (elements.length > 0) {
      this.focus(elements[0]);
    }
  }
  releaseFocusTrap() {
    this.focusTrapContainer = null;
  }
  getFocusableElements() {
    const elements = [];
    const container = this.focusTrapContainer;
    for (const element of this.registeredElements) {
      const focusable = element.getAttribute("focusable") !== false;
      const disabled = element.getAttribute("disabled") === true;
      const hidden = element.getAttribute("hidden") === true;
      if (!focusable || disabled || hidden)
        continue;
      if (container && !this.isDescendantOf(element, container)) {
        continue;
      }
      elements.push(element);
    }
    return this.sortByTabOrder(elements);
  }
  isDescendantOf(element, ancestor) {
    let current = element.parentNode;
    while (current) {
      if (current === ancestor)
        return true;
      current = current.parentNode;
    }
    return false;
  }
  sortByTabOrder(elements) {
    return elements.sort((a, b) => {
      const aTabIndex = parseInt(a.getAttribute("tabIndex") || "0", 10);
      const bTabIndex = parseInt(b.getAttribute("tabIndex") || "0", 10);
      if (aTabIndex > 0 && bTabIndex > 0)
        return aTabIndex - bTabIndex;
      if (aTabIndex > 0)
        return -1;
      if (bTabIndex > 0)
        return 1;
      return 0;
    });
  }
  setupKeyboardHandler() {
    if (!this.screen || this.keyHandler)
      return;
    this.keyHandler = (ch, key) => {
      if (key.name === "tab") {
        if (key.shift) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
      }
    };
    this.screen.on("keypress", this.keyHandler);
  }
  destroy() {
    if (this.screen && this.keyHandler) {
      this.screen.off("keypress", this.keyHandler);
    }
    this.registeredElements.clear();
    this.focusedElement = null;
    this.focusHistory = [];
    this.focusTrapContainer = null;
  }
}
var globalFocusContext = null;
function getGlobalFocusContext() {
  if (!globalFocusContext) {
    globalFocusContext = new SimpleFocusContextImpl;
  }
  return globalFocusContext;
}
function destroyGlobalFocusContext() {
  if (globalFocusContext && "destroy" in globalFocusContext) {
    globalFocusContext.destroy();
  }
  globalFocusContext = null;
}
export {
  getGlobalFocusContext,
  destroyGlobalFocusContext,
  SimpleFocusContextImpl
};
