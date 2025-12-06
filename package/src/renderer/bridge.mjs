// @bun
// src/renderer/bridge.ts
import { createElement } from "../dom/factories";
import {
  syncTextContent,
  createTextAwareMutationObserver
} from "./text-sync-fix";
var domToTerminalMap = new WeakMap;
var terminalToDomMap = new WeakMap;
var focusedElements = new Set;
var currentlyFocusedTerminal = null;
var globalScreen = null;
function happyDomToTerminal(happyNode, parent) {
  if (happyNode.nodeType === Node.ELEMENT_NODE) {
    const element = happyNode;
    const tagName = element.tagName.toLowerCase();
    if (tagName === "html" || tagName === "head" || tagName === "body") {
      for (const child of element.childNodes) {
        happyDomToTerminal(child, parent);
      }
      return null;
    }
    const props = {};
    for (const attr of element.attributes) {
      const propName = attr.name === "class" ? "className" : attr.name;
      let value = attr.value;
      if (["border", "style"].includes(propName)) {
        try {
          if (value === "[object Object]" && propName === "border") {
            value = {
              type: "line",
              ch: " ",
              left: true,
              top: true,
              right: true,
              bottom: true
            };
          } else if (value === "[object Object]" && propName === "style") {
            continue;
          } else if (value.startsWith("{")) {
            value = JSON.parse(value);
          }
        } catch (e) {}
      }
      if (["width", "height", "top", "left", "right", "bottom"].includes(propName)) {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue.toString() === value) {
          value = numValue;
        }
      }
      props[propName] = value;
    }
    if (element.__style) {
      props.style = element.__style;
    } else if (element instanceof HTMLElement) {
      const styleObj = {};
      let hasStyles = false;
      if (element.style.color) {
        styleObj.fg = element.style.color;
        hasStyles = true;
      }
      if (element.style.backgroundColor) {
        styleObj.bg = element.style.backgroundColor;
        hasStyles = true;
      }
      if (element.style.fontWeight === "bold") {
        styleObj.bold = true;
        hasStyles = true;
      }
      if (element.style.border && typeof element.style.border === "object") {
        styleObj.border = element.style.border;
        hasStyles = true;
      }
      if (hasStyles) {
        props.style = styleObj;
      }
    } else if (element.hasAttribute("style") && typeof props.style === "string" && !props.style.startsWith("{")) {
      props.style = parseInlineStyle(props.style);
    }
    const terminalElement = createElement(tagName, props);
    domToTerminalMap.set(element, terminalElement);
    terminalToDomMap.set(terminalElement, element);
    setTimeout(() => {
      if (element.__style) {
        const reactiveStyle = element.__style;
        const currentStyle = terminalElement.props.style || {};
        const needsUpdate = JSON.stringify(reactiveStyle) !== JSON.stringify(currentStyle);
        if (needsUpdate) {
          const currentProps = { ...terminalElement.props };
          if (reactiveStyle.border) {
            console.log(`[Bridge] Applying initial border style:`, reactiveStyle.border);
          }
          terminalElement.setProps({
            ...currentProps,
            style: reactiveStyle
          });
          terminalElement.update();
          if (terminalElement.blessed?.screen) {
            terminalElement.blessed.screen.render();
          }
        }
      }
    }, 0);
    if (element instanceof HTMLElement) {
      const originalStyleDescriptor = Object.getOwnPropertyDescriptor(element, "style");
      const originalStyle = element.style;
      Object.defineProperty(element, "style", {
        get() {
          return originalStyle;
        },
        set(value) {
          if (originalStyleDescriptor?.set) {
            originalStyleDescriptor.set.call(this, value);
          } else if (originalStyle) {
            Object.assign(originalStyle, value);
          }
          if (element.__style) {
            const currentProps = { ...terminalElement.props };
            const newStyle = element.__style;
            if (newStyle.border && currentProps.border) {
              const existingBorder = typeof currentProps.border === "object" ? currentProps.border : {
                type: "line",
                ch: " ",
                left: true,
                top: true,
                right: true,
                bottom: true
              };
              const mergedBorder = { ...existingBorder, ...newStyle.border };
              const { border, ...styleWithoutBorder } = newStyle;
              terminalElement.setProps({
                ...currentProps,
                style: styleWithoutBorder,
                border: mergedBorder
              });
            } else {
              terminalElement.setProps({
                ...currentProps,
                style: newStyle
              });
            }
            terminalElement.update();
            if (terminalElement.blessed?.screen) {
              terminalElement.blessed.screen.render();
            }
          }
        },
        configurable: true,
        enumerable: true
      });
      if (originalStyle && originalStyle.cssText !== undefined) {
        const originalCssTextDescriptor = Object.getOwnPropertyDescriptor(originalStyle, "cssText");
        Object.defineProperty(originalStyle, "cssText", {
          get() {
            return originalCssTextDescriptor?.get?.call(this) || "";
          },
          set(value) {
            if (originalCssTextDescriptor?.set) {
              originalCssTextDescriptor.set.call(this, value);
            }
            if (element.__style) {
              terminalElement.setProps({
                ...terminalElement.props,
                style: element.__style
              });
              terminalElement.update();
              if (terminalElement.blessed?.screen) {
                terminalElement.blessed.screen.render();
              }
            }
          },
          configurable: true,
          enumerable: true
        });
      }
    }
    if (parent) {
      parent.appendChild(terminalElement);
      if (parent.blessed && !terminalElement.blessed) {
        terminalElement.create(parent.blessed);
        if (terminalElement.blessed) {
          terminalElement.blessed.show();
        }
      } else {}
    } else {}
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text && terminalElement) {
          if (tagName === "text" || tagName === "button") {
            terminalElement.setProps({
              ...terminalElement.props,
              content: text
            });
          }
        }
      } else {
        happyDomToTerminal(child, terminalElement);
      }
    }
    const isFocusable = tagName === "input" || tagName === "button" || tagName === "box" || element.hasAttribute("tabindex") || element.hasAttribute("focused") || element.hasAttribute("onkeydown") || element.hasAttribute("onkeyup");
    if (isFocusable && terminalElement.blessed && globalScreen) {
      setupKeyboardEvents(element, terminalElement, globalScreen);
      if (element.getAttribute("focused") === "true" || element.hasAttribute("focused")) {
        setTimeout(() => {
          if (terminalElement.blessed) {
            terminalElement.blessed.focus();
            if (terminalElement.blessed.width === 0 || terminalElement.blessed.height === 0) {
              terminalElement.blessed.width = 1;
              terminalElement.blessed.height = 1;
              terminalElement.blessed.focus();
            }
          }
        }, 50);
      }
    }
    return terminalElement;
  }
  return null;
}
function parseInlineStyle(styleStr) {
  const styles = {};
  const declarations = styleStr.split(";").filter(Boolean);
  for (const decl of declarations) {
    const [prop, value] = decl.split(":").map((s) => s.trim());
    if (prop && value) {
      switch (prop) {
        case "color":
          styles.fg = value;
          break;
        case "background-color":
          styles.bg = value;
          break;
        case "font-weight":
          if (value === "bold") {
            styles.bold = true;
          }
          break;
      }
    }
  }
  return styles;
}
function observeHappyDom(happyElement, terminalElement, screen) {
  const tagName = happyElement.tagName.toLowerCase();
  const isFocusable = tagName === "input" || tagName === "button" || tagName === "box" || happyElement.hasAttribute("tabindex") || happyElement.hasAttribute("focused") || happyElement.hasAttribute("onkeydown") || happyElement.hasAttribute("onkeyup");
  if (isFocusable) {
    setupKeyboardEvents(happyElement, terminalElement, screen);
    if (happyElement.getAttribute("focused") === "true" || happyElement.hasAttribute("focused")) {
      setTimeout(() => {
        if (terminalElement.blessed) {
          terminalElement.blessed.focus();
        }
      }, 50);
    }
  }
  const observerCallback = (mutations) => {
    let needsUpdate = false;
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        if (terminalElement.type === "text" || terminalElement.type === "ttext") {
          if (syncTextContent(happyElement, terminalElement, screen)) {
            continue;
          }
        }
        needsUpdate = true;
        while (terminalElement.children.length > 0) {
          const child = terminalElement.children[0];
          terminalElement.removeChild(child);
          child.destroy();
        }
        for (const child of happyElement.childNodes) {
          const newTerminalChild = happyDomToTerminal(child, terminalElement);
          if (newTerminalChild && child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child;
            const childTagName = childElement.tagName.toLowerCase();
            if (childTagName === "input" || childTagName === "button" || childTagName === "box" || childElement.hasAttribute("tabindex") || childElement.hasAttribute("focused") || childElement.hasAttribute("onkeydown")) {
              setupKeyboardEvents(childElement, newTerminalChild, screen);
            }
          }
        }
      } else if (mutation.type === "attributes") {
        needsUpdate = true;
        const attrName = mutation.attributeName;
        if (attrName) {
          const value = happyElement.getAttribute(attrName);
          const propName = attrName === "class" ? "className" : attrName;
          if (value !== null) {
            if (attrName === "style") {
              let styleObj = {};
              if (happyElement.__style) {
                styleObj = happyElement.__style;
              } else if (happyElement instanceof HTMLElement) {
                if (happyElement.style.color) {
                  styleObj.fg = happyElement.style.color;
                }
                if (happyElement.style.backgroundColor) {
                  styleObj.bg = happyElement.style.backgroundColor;
                }
                if (happyElement.style.fontWeight === "bold") {
                  styleObj.bold = true;
                }
              }
              terminalElement.setProps({
                ...terminalElement.props,
                style: styleObj
              });
            } else {
              let processedValue = value;
              if (["border"].includes(propName)) {
                try {
                  if (processedValue === "[object Object]" && propName === "border") {
                    processedValue = {
                      type: "line",
                      ch: " ",
                      left: true,
                      top: true,
                      right: true,
                      bottom: true
                    };
                  } else if (processedValue.startsWith("{")) {
                    processedValue = JSON.parse(processedValue);
                  }
                } catch (e) {}
              }
              terminalElement.setProps({
                ...terminalElement.props,
                [propName]: processedValue
              });
            }
          }
          if (attrName === "focused" && value === "true" && terminalElement.blessed) {
            setTimeout(() => {
              if (terminalElement.blessed?.focus) {
                terminalElement.blessed.focus();
              }
            }, 0);
          }
        }
      } else if (mutation.type === "characterData") {
        if (terminalElement.type === "text" || terminalElement.type === "ttext") {
          if (syncTextContent(happyElement, terminalElement, screen)) {
            continue;
          }
        }
        needsUpdate = true;
        if (terminalElement.type === "button") {
          const text = happyElement.textContent || "";
          terminalElement.setProps({
            ...terminalElement.props,
            content: text
          });
        }
      }
    }
    if (needsUpdate) {
      terminalElement.update();
      screen.render();
    }
  };
  const observer = createTextAwareMutationObserver(happyElement, terminalElement, screen, observerCallback);
  observer.observe(happyElement, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
  });
  if (happyElement.__keydown) {
    happyElement.addEventListener("keydown", (e) => {
      const [handler, ...args] = happyElement.__keydown;
      if (typeof handler === "function") {
        handler(e, ...args);
      }
    });
  }
  return observer;
}
function blessedKeyToDOMKey(key) {
  const keyMappings = {
    return: { key: "Enter", code: "Enter" },
    enter: { key: "Enter", code: "Enter" },
    tab: { key: "Tab", code: "Tab" },
    backspace: { key: "Backspace", code: "Backspace" },
    delete: { key: "Delete", code: "Delete" },
    escape: { key: "Escape", code: "Escape" },
    esc: { key: "Escape", code: "Escape" },
    space: { key: " ", code: "Space" },
    up: { key: "ArrowUp", code: "ArrowUp" },
    down: { key: "ArrowDown", code: "ArrowDown" },
    left: { key: "ArrowLeft", code: "ArrowLeft" },
    right: { key: "ArrowRight", code: "ArrowRight" },
    home: { key: "Home", code: "Home" },
    end: { key: "End", code: "End" },
    pageup: { key: "PageUp", code: "PageUp" },
    pagedown: { key: "PageDown", code: "PageDown" },
    f1: { key: "F1", code: "F1" },
    f2: { key: "F2", code: "F2" },
    f3: { key: "F3", code: "F3" },
    f4: { key: "F4", code: "F4" },
    f5: { key: "F5", code: "F5" },
    f6: { key: "F6", code: "F6" },
    f7: { key: "F7", code: "F7" },
    f8: { key: "F8", code: "F8" },
    f9: { key: "F9", code: "F9" },
    f10: { key: "F10", code: "F10" },
    f11: { key: "F11", code: "F11" },
    f12: { key: "F12", code: "F12" }
  };
  const keyName = key.name || key.full;
  if (keyName && keyMappings[keyName.toLowerCase()]) {
    return keyMappings[keyName.toLowerCase()];
  }
  if (key.ch) {
    const ch = key.ch;
    if (ch.match(/^[A-Z]$/)) {
      return { key: ch, code: `Key${ch}` };
    }
    if (ch.match(/^[a-z]$/)) {
      return { key: ch, code: `Key${ch.toUpperCase()}` };
    }
    if (ch.match(/^[0-9]$/)) {
      return { key: ch, code: `Digit${ch}` };
    }
    return { key: ch, code: "" };
  }
  return { key: keyName || "", code: "" };
}
function createKeyboardEvent(eventType, ch, key) {
  const { key: domKey, code } = blessedKeyToDOMKey(key);
  let actualKey = domKey;
  if (ch && ch.length === 1 && !domKey) {
    actualKey = ch;
  } else if (ch && ch.length === 1 && domKey.length === 1) {
    actualKey = ch;
  }
  const init = {
    key: actualKey || domKey || ch || "",
    code,
    keyCode: 0,
    which: 0,
    ctrlKey: key.ctrl || false,
    shiftKey: key.shift || false,
    altKey: key.alt || false,
    metaKey: key.meta || false,
    bubbles: true,
    cancelable: true,
    composed: true
  };
  if (domKey === "Enter")
    init.keyCode = init.which = 13;
  else if (domKey === "Tab")
    init.keyCode = init.which = 9;
  else if (domKey === "Backspace")
    init.keyCode = init.which = 8;
  else if (domKey === "Delete")
    init.keyCode = init.which = 46;
  else if (domKey === "Escape")
    init.keyCode = init.which = 27;
  else if (domKey === " ")
    init.keyCode = init.which = 32;
  else if (domKey === "ArrowUp")
    init.keyCode = init.which = 38;
  else if (domKey === "ArrowDown")
    init.keyCode = init.which = 40;
  else if (domKey === "ArrowLeft")
    init.keyCode = init.which = 37;
  else if (domKey === "ArrowRight")
    init.keyCode = init.which = 39;
  else if (ch && ch.length === 1)
    init.keyCode = init.which = ch.charCodeAt(0);
  return new KeyboardEvent(eventType, init);
}
function setupKeyboardEvents(happyElement, terminalElement, screen) {
  if (!terminalElement.blessed)
    return;
  if (!globalScreen && screen) {
    globalScreen = screen;
  }
  terminalElement.blessed.on("focus", () => {
    focusedElements.clear();
    focusedElements.add(happyElement);
    currentlyFocusedTerminal = terminalElement;
    const focusEvent = new FocusEvent("focus", {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    happyElement.dispatchEvent(focusEvent);
    const focusInEvent = new FocusEvent("focusin", {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    happyElement.dispatchEvent(focusInEvent);
  });
  terminalElement.blessed.on("blur", () => {
    focusedElements.delete(happyElement);
    if (currentlyFocusedTerminal === terminalElement) {
      currentlyFocusedTerminal = null;
    }
    const blurEvent = new FocusEvent("blur", {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    happyElement.dispatchEvent(blurEvent);
    const focusOutEvent = new FocusEvent("focusout", {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    happyElement.dispatchEvent(focusOutEvent);
  });
  if (terminalElement.blessed) {
    terminalElement.blessed.focusable = true;
    terminalElement.blessed.input = true;
    terminalElement.blessed.keys = true;
    if (terminalElement.blessed.key && typeof terminalElement.blessed.key === "function") {
      terminalElement.blessed.key([
        "enter",
        "space",
        "tab",
        "escape",
        "backspace",
        "delete",
        "up",
        "down",
        "left",
        "right",
        "home",
        "end",
        "pageup",
        "pagedown",
        "f1",
        "f2",
        "f3",
        "f4",
        "f5",
        "f6",
        "f7",
        "f8",
        "f9",
        "f10",
        "f11",
        "f12"
      ], (ch, key) => {
        if (!terminalElement.blessed?.focused)
          return;
        const keydownEvent = createKeyboardEvent("keydown", ch, key);
        const keydownResult = happyElement.dispatchEvent(keydownEvent);
        if (keydownResult) {
          const keyupEvent = createKeyboardEvent("keyup", ch, key);
          happyElement.dispatchEvent(keyupEvent);
        }
      });
    }
  }
}
function getTerminalElement(domElement) {
  return domToTerminalMap.get(domElement);
}
function setupDocumentEventDelegation() {
  document.addEventListener("keydown", (e) => {}, true);
}
function setupGlobalKeyboardHandler(screen) {
  globalScreen = screen;
  setupDocumentEventDelegation();
  const recentlyHandledKeys = new Map;
  screen.on("keypress", (ch, key) => {
    const keyName = key.name || key.full;
    if (keyName && [
      "backspace",
      "delete",
      "left",
      "right",
      "up",
      "down",
      "home",
      "end",
      "enter",
      "return"
    ].includes(keyName)) {
      return;
    }
    const focusedDom = Array.from(focusedElements)[0];
    if (!focusedDom) {
      if (currentlyFocusedTerminal && currentlyFocusedTerminal.blessed?.focused) {
        const domElement = terminalToDomMap.get(currentlyFocusedTerminal);
        if (domElement) {
          handleKeyPress(domElement, ch, key);
        }
      }
      return;
    }
    handleKeyPress(focusedDom, ch, key);
  });
  screen.on("key", (name, key) => {
    const now = Date.now();
    const keyIdentifier = `${name}-${key.sequence || ""}`;
    const lastHandled = recentlyHandledKeys.get(keyIdentifier);
    if (lastHandled && now - lastHandled < 50) {
      return;
    }
    recentlyHandledKeys.set(keyIdentifier, now);
    if (recentlyHandledKeys.size > 100) {
      for (const [k, time] of recentlyHandledKeys) {
        if (now - time > 1000) {
          recentlyHandledKeys.delete(k);
        }
      }
    }
    const focusedDom = Array.from(focusedElements)[0];
    if (!focusedDom) {
      if (currentlyFocusedTerminal && currentlyFocusedTerminal.blessed?.focused) {
        const domElement = terminalToDomMap.get(currentlyFocusedTerminal);
        if (domElement) {
          handleKeyPress(domElement, null, { ...key, name });
        }
      }
      return;
    }
    handleKeyPress(focusedDom, null, { ...key, name });
  });
}
function handleKeyPress(element, ch, key) {
  if (element.__keydown) {
    const [handler, ...args] = element.__keydown;
    if (typeof handler === "function") {
      const keyName = key.name || (ch && ch.length === 1 ? ch : null);
      if (keyName) {
        try {
          handler(keyName, ...args);
          if (globalScreen) {
            globalScreen.render();
          }
        } catch (error) {
          console.error("[Bridge] Error calling handler:", error);
        }
        return;
      }
    }
  }
  const keydownEvent = createKeyboardEvent("keydown", ch, key);
  const keydownResult = element.dispatchEvent(keydownEvent);
  if (keydownResult) {
    if (ch && !key.ctrl && !key.alt && !key.meta && ch.length === 1) {
      const beforeInputEvent = new InputEvent("beforeinput", {
        data: ch,
        inputType: "insertText",
        bubbles: true,
        cancelable: true,
        composed: true
      });
      const beforeInputResult = element.dispatchEvent(beforeInputEvent);
      if (beforeInputResult) {
        const inputEvent = new InputEvent("input", {
          data: ch,
          inputType: "insertText",
          bubbles: true,
          cancelable: false,
          composed: true
        });
        element.dispatchEvent(inputEvent);
      }
    }
    const keyupEvent = createKeyboardEvent("keyup", ch, key);
    element.dispatchEvent(keyupEvent);
  }
}
function focusElement(domElement) {
  const terminalElement = getTerminalElement(domElement);
  if (!terminalElement?.blessed)
    return;
  focusedElements.clear();
  if (terminalElement.blessed.focus && typeof terminalElement.blessed.focus === "function") {
    terminalElement.blessed.focus();
  }
  focusedElements.add(domElement);
  currentlyFocusedTerminal = terminalElement;
  const focusEvent = new FocusEvent("focus", {
    bubbles: true,
    cancelable: true,
    composed: true
  });
  domElement.dispatchEvent(focusEvent);
}
function getFocusedElement() {
  return Array.from(focusedElements)[0] || null;
}
function hasFocus(domElement) {
  return focusedElements.has(domElement);
}
export {
  setupKeyboardEvents,
  setupGlobalKeyboardHandler,
  observeHappyDom,
  hasFocus,
  happyDomToTerminal,
  getTerminalElement,
  getFocusedElement,
  focusElement
};
