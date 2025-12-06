// @bun
// src/api/runtime.ts
import {
  document
} from "../dom";
import { refresh } from "../renderer";
import { getReconciler } from "../reconciler";
import { setupBinding, cleanupBindings } from "../dom/binding-bridge";
import { hasFocusContext, getFocusContext } from '../dom/focus-context.svelte.js';
import { isFocusable } from "../dom/focus-manager";
function createElement(name) {
  return document.createElement(name.toLowerCase());
}
function createText(text) {
  return document.createTextNode(text);
}
function createComment(text) {
  return document.createComment(text);
}
function createFragment() {
  return document.createDocumentFragment();
}
function insertNode(parent, node, anchor) {
  parent.insertBefore(node, anchor);
  if (node.nodeType === 1 && hasFocusContext()) {
    const element = node;
    if (isFocusable(element)) {
      const focusContext = getFocusContext();
      focusContext.registerElement(element);
    }
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function appendChild(parent, child) {
  parent.appendChild(child);
  if (child.nodeType === 1 && hasFocusContext()) {
    const element = child;
    if (isFocusable(element)) {
      const focusContext = getFocusContext();
      focusContext.registerElement(element);
    }
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function removeChild(parent, child) {
  parent.removeChild(child);
  if (child.nodeType === 1 && hasFocusContext()) {
    const element = child;
    const focusContext = getFocusContext();
    focusContext.unregisterElement(element);
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function setAttribute(node, name, value) {
  node.setAttribute(name, value);
  if (node._terminalElement) {
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    let propValue = value;
    if (value === "" || value === name) {
      propValue = true;
    }
    if (name === "style" && typeof value === "string") {
      const cssStyles = parseStyleAttribute(value);
      propValue = convertCssToBlessed(cssStyles);
    }
    if (name === "class") {
      node._terminalElement.setProps({
        ...node._terminalElement.props,
        className: value
      });
    } else {
      node._terminalElement.setProps({
        ...node._terminalElement.props,
        [propName]: propValue
      });
    }
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function parseStyleAttribute(styleStr) {
  const result = {};
  const styles = styleStr.split(";");
  for (const style of styles) {
    const [key, value] = style.split(":").map((s) => s.trim());
    if (key && value) {
      const propName = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      result[propName] = value;
    }
  }
  return result;
}
function convertCssToBlessed(cssStyles) {
  const blessedStyle = {};
  for (const [key, value] of Object.entries(cssStyles)) {
    switch (key) {
      case "color":
        blessedStyle.fg = value;
        break;
      case "backgroundColor":
      case "background":
        blessedStyle.bg = value;
        break;
      case "fontWeight":
        if (value === "bold" || value === "700" || value === "800" || value === "900") {
          blessedStyle.bold = true;
        }
        break;
      case "textDecoration":
        if (value.includes("underline")) {
          blessedStyle.underline = true;
        }
        break;
      case "fontStyle":
        if (value === "italic") {
          blessedStyle.italic = true;
        }
        break;
      case "border":
        const borderParts = value.split(" ");
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: "line",
            fg: borderParts[2] || "white"
          };
        }
        break;
      case "borderColor":
        if (!blessedStyle.border) {
          blessedStyle.border = { type: "line" };
        }
        blessedStyle.border.fg = value;
        break;
      case "padding":
      case "margin":
      case "marginTop":
      case "marginRight":
      case "marginBottom":
      case "marginLeft":
        break;
      case "width":
      case "height":
      case "top":
      case "left":
      case "right":
      case "bottom":
        break;
      case "visibility":
        if (value === "hidden") {
          blessedStyle.invisible = true;
        }
        break;
      default:
        break;
    }
  }
  return blessedStyle;
}
function removeAttribute(node, name) {
  node.removeAttribute(name);
  if (node._terminalElement) {
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const props = { ...node._terminalElement.props };
    delete props[propName];
    if (name === "class") {
      delete props["className"];
    }
    node._terminalElement.setProps(props);
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function setText(node, text) {
  node.nodeValue = text;
  const parent = node.parentNode;
  if (parent && parent.nodeType === 1) {
    const parentElement = parent._terminalElement;
    if (parentElement) {
      if (parentElement.type === "text" || parentElement.type === "button" || parentElement.type === "box") {
        parentElement.setProps({
          ...parentElement.props,
          content: text
        });
      }
    }
  }
  const reconciler = getReconciler();
  reconciler.forceFlush();
  refresh();
}
function setElementProps(node, props) {
  for (const [name, value] of Object.entries(props)) {
    if (value !== undefined && value !== null) {
      setAttribute(node, name, value);
    } else {
      removeAttribute(node, name);
    }
  }
}
var nodeEventHandlers = new WeakMap;
function addEventListener(node, event, handler) {
  let handlers = nodeEventHandlers.get(node);
  if (!handlers) {
    handlers = {};
    nodeEventHandlers.set(node, handlers);
  }
  handlers[event] = handler;
  if (node._terminalElement && node._terminalElement.blessed) {
    const blessedEvent = mapEventToBlessedEvent(event);
    if (event === "click" || event === "mousedown" || event === "mouseup") {
      node._terminalElement.blessed.on("mouse", (data) => {
        if (data.action === blessedEvent) {
          const syntheticEvent = {
            type: event,
            target: node,
            currentTarget: node,
            preventDefault: () => {},
            stopPropagation: () => {},
            bubbles: true,
            data
          };
          handler(syntheticEvent);
        }
      });
    } else if (event === "keydown" || event === "keyup" || event === "keypress") {
      node._terminalElement.blessed.on("keypress", (ch, key) => {
        const syntheticEvent = {
          type: event,
          target: node,
          currentTarget: node,
          preventDefault: () => {},
          stopPropagation: () => {},
          bubbles: true,
          key: key.name,
          keyCode: key.charCodeAt(0),
          char: ch,
          originalEvent: key
        };
        handler(syntheticEvent);
      });
    } else {
      node._terminalElement.blessed.on(blessedEvent, (data) => {
        const syntheticEvent = {
          type: event,
          target: node,
          currentTarget: node,
          preventDefault: () => {},
          stopPropagation: () => {},
          bubbles: true,
          data
        };
        handler(syntheticEvent);
      });
    }
  }
}
function removeEventListener(node, event) {
  const handlers = nodeEventHandlers.get(node);
  if (handlers) {
    delete handlers[event];
  }
  if (node._terminalElement && node._terminalElement.blessed) {
    const blessedEvent = mapEventToBlessedEvent(event);
    if (event === "click" || event === "mousedown" || event === "mouseup") {
      node._terminalElement.blessed.removeAllListeners("mouse");
    } else if (event === "keydown" || event === "keyup" || event === "keypress") {
      node._terminalElement.blessed.removeAllListeners("keypress");
    } else {
      node._terminalElement.blessed.removeAllListeners(blessedEvent);
    }
  }
}
function mapEventToBlessedEvent(event) {
  switch (event) {
    case "click":
      return "click";
    case "mousedown":
      return "mousedown";
    case "mouseup":
      return "mouseup";
    case "mouseover":
      return "mouseover";
    case "mouseout":
      return "mouseout";
    case "keydown":
      return "keypress";
    case "keyup":
      return "key";
    case "keypress":
      return "keypress";
    case "focus":
      return "focus";
    case "blur":
      return "blur";
    case "submit":
      return "submit";
    case "change":
      return "action";
    case "input":
      return "value";
    case "select":
      return "select";
    default:
      return event;
  }
}
function __sveltui_createElement(tag) {
  return createElement(tag);
}
function __sveltui_createTextNode(text) {
  return createText(text);
}
function __sveltui_createComment(text) {
  return createComment(text);
}
function __sveltui_appendChild(parent, child) {
  appendChild(parent, child);
}
function __sveltui_insertBefore(parent, node, anchor) {
  parent.insertBefore(node, anchor);
  refresh();
}
function __sveltui_removeChild(parent, child) {
  removeChild(parent, child);
}
function __sveltui_setAttribute(node, attr, value) {
  setAttribute(node, attr, value);
}
function __sveltui_removeAttribute(node, attr) {
  removeAttribute(node, attr);
}
function __sveltui_setText(node, text) {
  setText(node, text);
}
function __sveltui_addEventListener(node, event, handler) {
  addEventListener(node, event, handler);
}
function __sveltui_removeEventListener(node, event) {
  removeEventListener(node, event);
}
var __sveltui_document = document;
var __sveltui_window = {
  document: __sveltui_document,
  addEventListener: (event, handler) => {
    if (event === "keydown" || event === "keypress") {
      const screen = document.screen;
      if (screen) {
        screen.on("keypress", (ch, key) => {
          const syntheticEvent = {
            type: event,
            target: window,
            currentTarget: window,
            preventDefault: () => {},
            stopPropagation: () => {},
            key: key.name,
            keyCode: key.charCodeAt(0),
            char: ch,
            originalEvent: key
          };
          handler();
        });
      }
    }
  },
  removeEventListener: (event, handler) => {},
  location: {
    href: "sveltui://terminal",
    origin: "sveltui://terminal",
    protocol: "sveltui:",
    host: "terminal",
    hostname: "terminal",
    port: "",
    pathname: "/",
    search: "",
    hash: ""
  },
  navigator: {
    userAgent: "SvelTUI Terminal"
  },
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,
  requestAnimationFrame: (callback) => {
    return setTimeout(callback, 16);
  },
  cancelAnimationFrame: (id) => {
    clearTimeout(id);
  }
};
var __sveltui_root = document.createElement("div");
function setupPropertyBinding(node, propName, getValue, setValue) {
  if (!node._terminalElement) {
    return () => {};
  }
  const syncFn = setupBinding(node._terminalElement, propName, getValue, setValue);
  return () => {
    if (node._terminalElement) {
      cleanupBindings(node._terminalElement);
    }
  };
}
function cleanupElementBindings(node) {
  if (node._terminalElement) {
    cleanupBindings(node._terminalElement);
  }
}
export {
  setupPropertyBinding,
  setText,
  setElementProps,
  setAttribute,
  removeEventListener,
  removeChild,
  removeAttribute,
  insertNode,
  createText,
  createFragment,
  createElement,
  createComment,
  cleanupElementBindings,
  appendChild,
  addEventListener,
  __sveltui_window,
  __sveltui_setText,
  __sveltui_setAttribute,
  __sveltui_root,
  __sveltui_removeEventListener,
  __sveltui_removeChild,
  __sveltui_removeAttribute,
  __sveltui_insertBefore,
  __sveltui_document,
  __sveltui_createTextNode,
  __sveltui_createElement,
  __sveltui_createComment,
  __sveltui_appendChild,
  __sveltui_addEventListener
};
