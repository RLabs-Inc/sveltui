// @bun
// src/dom/document.ts
import { NodeType, generateNodeId } from "./nodes";
import { safeSetProperty, updateNodeRelationships, ensureNodeProperties } from "./node-utils";

class TerminalDocument {
  nodeType = NodeType.DOCUMENT;
  nodeName = "#document";
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  _instanceId = generateNodeId();
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  body;
  head;
  documentElement;
  constructor() {
    this.documentElement = this.createElement("html");
    this.head = this.createElement("head");
    this.body = this.createElement("body");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }
  addEventListener(event, handler, options) {}
  removeEventListener(event, handler) {}
  createElement(tagName) {
    if (tagName.toLowerCase() === "template") {
      return new TerminalTemplateElement(tagName, this);
    }
    return new TerminalElement(tagName, this);
  }
  createTextNode(text) {
    return new TerminalText(text, this);
  }
  createComment(text) {
    return new TerminalComment(text, this);
  }
  createDocumentFragment() {
    return new TerminalDocumentFragment(this);
  }
  createRange() {
    const self = this;
    return {
      selectNodeContents: () => {},
      extractContents: () => this.createDocumentFragment(),
      createContextualFragment: (html) => {
        const fragment = this.createDocumentFragment();
        if (!html) {
          return fragment;
        }
        if (globalThis.SVELTUI_DEBUG) {
          console.log("[TerminalDocument] Parsing HTML:", html.substring(0, 100) + "...");
        }
        let remaining = html;
        let currentParent = fragment;
        const elementStack = [];
        while (remaining) {
          if (remaining.startsWith("<!>")) {
            const comment = this.createComment("");
            currentParent.appendChild(comment);
            remaining = remaining.substring(3);
            continue;
          }
          const closeMatch = remaining.match(/^<\/(\w+)>/);
          if (closeMatch) {
            elementStack.pop();
            currentParent = elementStack[elementStack.length - 1] || fragment;
            remaining = remaining.substring(closeMatch[0].length);
            continue;
          }
          const openMatch = remaining.match(/^<(\w+)([^>]*)>/);
          if (openMatch) {
            const tagName = openMatch[1];
            const element = this.createElement(tagName);
            const attrString = openMatch[2];
            if (attrString) {
              const attrRegex = /(\w+)(?:="([^"]*)")?/g;
              let attrMatch;
              while (attrMatch = attrRegex.exec(attrString)) {
                element.setAttribute(attrMatch[1], attrMatch[2] || "");
              }
            }
            currentParent.appendChild(element);
            const voidElements = ["br", "hr", "img", "input", "meta", "link"];
            if (!attrString.endsWith("/") && !voidElements.includes(tagName.toLowerCase())) {
              elementStack.push(currentParent);
              currentParent = element;
            }
            remaining = remaining.substring(openMatch[0].length);
            continue;
          }
          const textMatch = remaining.match(/^([^<]+)/);
          if (textMatch) {
            const text = textMatch[1];
            const textNode = this.createTextNode(text);
            currentParent.appendChild(textNode);
            remaining = remaining.substring(text.length);
            continue;
          }
          break;
        }
        if (globalThis.SVELTUI_DEBUG) {
          console.log("[TerminalDocument] Fragment children:", fragment.childNodes.length);
        }
        return fragment;
      }
    };
  }
  appendChild(child) {
    ensureNodeProperties(child);
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    this.childNodes.push(child);
    updateNodeRelationships(this, child, this.lastChild, null);
    if (!this.firstChild) {
      this.firstChild = child;
    }
    this.lastChild = child;
    return child;
  }
  insertBefore(node, refNode) {
    if (!refNode) {
      return this.appendChild(node);
    }
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    const index = this.childNodes.indexOf(refNode);
    if (index === -1) {
      throw new Error("Reference node not found");
    }
    this.childNodes.splice(index, 0, node);
    ensureNodeProperties(node);
    ensureNodeProperties(refNode);
    const prevSibling = refNode.previousSibling;
    updateNodeRelationships(this, node, prevSibling, refNode);
    if (!prevSibling) {
      this.firstChild = node;
    }
    return node;
  }
  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index === -1) {
      throw new Error("Child not found");
    }
    this.childNodes.splice(index, 1);
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      this.firstChild = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      this.lastChild = child.previousSibling;
    }
    safeSetProperty(child, "parentNode", null);
    safeSetProperty(child, "previousSibling", null);
    safeSetProperty(child, "nextSibling", null);
    return child;
  }
  replaceChild(newChild, oldChild) {
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    const index = this.childNodes.indexOf(oldChild);
    if (index === -1) {
      throw new Error("Old child not found");
    }
    this.childNodes[index] = newChild;
    newChild.parentNode = this;
    newChild.previousSibling = oldChild.previousSibling;
    newChild.nextSibling = oldChild.nextSibling;
    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild;
    } else {
      this.firstChild = newChild;
    }
    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild;
    } else {
      this.lastChild = newChild;
    }
    oldChild.parentNode = null;
    oldChild.previousSibling = null;
    oldChild.nextSibling = null;
    return oldChild;
  }
  cloneNode(deep = false) {
    const clone = new TerminalDocument;
    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  }
}

class TerminalTemplateElement {
  nodeType = NodeType.ELEMENT;
  nodeName;
  tagName;
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  attributes = {};
  _instanceId = generateNodeId();
  _terminalElement;
  content;
  _document;
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  style;
  __style;
  constructor(tagName, document) {
    this.tagName = tagName.toLowerCase();
    this.nodeName = this.tagName;
    this.content = new TerminalDocumentFragment(document);
    this._terminalElement = null;
    this._document = document;
    this.style = {
      cssText: "",
      display: "",
      visibility: "",
      opacity: ""
    };
    Object.defineProperty(this.style, "cssText", {
      get: () => {
        const styles = [];
        for (const [key, value] of Object.entries(this.style)) {
          if (key !== "cssText" && value) {
            const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            styles.push(`${cssKey}: ${value}`);
          }
        }
        return styles.join("; ");
      },
      set: (value) => {
        if (!value) {
          for (const key in this.style) {
            if (key !== "cssText") {
              this.style[key] = "";
            }
          }
          this.setAttribute("style", "");
          return;
        }
        const declarations = value.split(";").map((s) => s.trim()).filter(Boolean);
        for (const declaration of declarations) {
          const [prop, val] = declaration.split(":").map((s) => s.trim());
          if (prop && val) {
            const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            this.style[camelProp] = val;
          }
        }
        this.setAttribute("style", value);
      },
      enumerable: true,
      configurable: true
    });
  }
  set innerHTML(html) {
    this.content = new TerminalDocumentFragment(this._document);
    if (!html) {
      return;
    }
    if (this._document.createRange) {
      const range = this._document.createRange();
      const fragment = range.createContextualFragment(html);
      while (fragment.firstChild) {
        this.content.appendChild(fragment.firstChild);
      }
    } else {
      const trimmed = html.trim();
      if (trimmed.startsWith("<!>")) {
        const comment = this._document.createComment("");
        this.content.appendChild(comment);
      } else if (trimmed.startsWith("<")) {
        const tagMatch = trimmed.match(/<(\w+)/);
        if (tagMatch) {
          const element = this._document.createElement(tagMatch[1]);
          this.content.appendChild(element);
        }
      } else {
        const textNode = this._document.createTextNode(trimmed);
        this.content.appendChild(textNode);
      }
    }
  }
  get innerHTML() {
    return "";
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  getAttribute(name) {
    return this.attributes[name] ?? null;
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  hasAttribute(name) {
    return name in this.attributes;
  }
  appendChild(child) {
    return this.content.appendChild(child);
  }
  insertBefore(node, refNode) {
    return this.content.insertBefore(node, refNode);
  }
  removeChild(child) {
    return this.content.removeChild(child);
  }
  replaceChild(newChild, oldChild) {
    return this.content.replaceChild(newChild, oldChild);
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  cloneNode(deep = false) {
    const clone = new TerminalTemplateElement(this.tagName, {});
    for (const [name, value] of Object.entries(this.attributes)) {
      clone.setAttribute(name, value);
    }
    if (deep) {
      clone.content = this.content.cloneNode(true);
    }
    return clone;
  }
}

class TerminalElement {
  nodeType = NodeType.ELEMENT;
  nodeName;
  tagName;
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  attributes = {};
  _instanceId = generateNodeId();
  _terminalElement;
  _eventListeners;
  _document;
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  style;
  __style;
  constructor(tagName, document) {
    this.tagName = tagName.toLowerCase();
    this.nodeName = this.tagName;
    this._document = document;
    this._terminalElement = null;
    const styleTarget = {
      cssText: "",
      display: "",
      visibility: "",
      opacity: "",
      color: "",
      backgroundColor: "",
      width: "",
      height: "",
      position: "",
      top: "",
      left: "",
      right: "",
      bottom: "",
      margin: "",
      padding: "",
      border: "",
      fontSize: "",
      fontFamily: "",
      fontWeight: "",
      textAlign: "",
      lineHeight: "",
      zIndex: ""
    };
    this.style = new Proxy(styleTarget, {
      set: (target, prop, value) => {
        target[prop] = value;
        if (prop !== "cssText" && this._terminalElement && this._terminalElement !== this) {
          const blessedStyle = this.convertStylesToBlessed();
          if (typeof this._terminalElement.setProps === "function") {
            this._terminalElement.setProps({
              ...this._terminalElement.props,
              style: blessedStyle
            });
            this._terminalElement.update();
          }
        }
        return true;
      }
    });
    Object.defineProperty(this.style, "cssText", {
      get: () => {
        const styles = [];
        for (const [key, value] of Object.entries(this.style)) {
          if (key !== "cssText" && value) {
            const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            styles.push(`${cssKey}: ${value}`);
          }
        }
        return styles.join("; ");
      },
      set: (value) => {
        if (!value) {
          for (const key in this.style) {
            if (key !== "cssText") {
              this.style[key] = "";
            }
          }
          return;
        }
        const declarations = value.split(";").map((s) => s.trim()).filter(Boolean);
        for (const declaration of declarations) {
          const [prop, val] = declaration.split(":").map((s) => s.trim());
          if (prop && val) {
            const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            this.style[camelProp] = val;
          }
        }
      },
      enumerable: true,
      configurable: true
    });
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
    if (this._terminalElement && this._terminalElement !== this) {
      const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (typeof this._terminalElement.setProps === "function") {
        const props = { ...this._terminalElement.props };
        props[propName] = value;
        this._terminalElement.setProps(props);
        this._terminalElement.update();
      }
    }
  }
  getAttribute(name) {
    return this.attributes[name] ?? null;
  }
  removeAttribute(name) {
    delete this.attributes[name];
    if (this._terminalElement && this._terminalElement !== this) {
      if (typeof this._terminalElement.setProps === "function") {
        const props = { ...this._terminalElement.props };
        delete props[name];
        this._terminalElement.setProps(props);
        this._terminalElement.update();
      }
    }
  }
  hasAttribute(name) {
    return name in this.attributes;
  }
  appendChild(child) {
    ensureNodeProperties(child);
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    this.childNodes.push(child);
    updateNodeRelationships(this, child, this.lastChild, null);
    if (!this.firstChild) {
      this.firstChild = child;
    }
    this.lastChild = child;
    if (this._terminalElement && this._terminalElement !== this && child.nodeType === NodeType.ELEMENT) {
      const childElement = child;
      if (childElement._terminalElement && childElement._terminalElement !== childElement) {
        if (typeof this._terminalElement.appendChild === "function") {
          this._terminalElement.appendChild(childElement._terminalElement);
        }
      }
    }
    return child;
  }
  insertBefore(node, refNode) {
    if (!refNode) {
      return this.appendChild(node);
    }
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    const index = this.childNodes.indexOf(refNode);
    if (index === -1) {
      throw new Error("Reference node not found");
    }
    this.childNodes.splice(index, 0, node);
    ensureNodeProperties(node);
    ensureNodeProperties(refNode);
    const prevSibling = refNode.previousSibling;
    updateNodeRelationships(this, node, prevSibling, refNode);
    if (!prevSibling) {
      this.firstChild = node;
    }
    if (this._terminalElement && this._terminalElement !== this && node.nodeType === NodeType.ELEMENT && refNode.nodeType === NodeType.ELEMENT) {
      const nodeElement = node;
      const refElement = refNode;
      if (nodeElement._terminalElement && nodeElement._terminalElement !== nodeElement && refElement._terminalElement && refElement._terminalElement !== refElement) {
        if (typeof this._terminalElement.insertBefore === "function") {
          this._terminalElement.insertBefore(nodeElement._terminalElement, refElement._terminalElement);
        }
      }
    }
    return node;
  }
  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index === -1) {
      throw new Error("Child not found");
    }
    this.childNodes.splice(index, 1);
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      this.firstChild = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      this.lastChild = child.previousSibling;
    }
    if (this._terminalElement && this._terminalElement !== this && child.nodeType === NodeType.ELEMENT) {
      const childElement = child;
      if (childElement._terminalElement && childElement._terminalElement !== childElement) {
        if (typeof this._terminalElement.removeChild === "function") {
          this._terminalElement.removeChild(childElement._terminalElement);
        }
      }
    }
    safeSetProperty(child, "parentNode", null);
    safeSetProperty(child, "previousSibling", null);
    safeSetProperty(child, "nextSibling", null);
    return child;
  }
  replaceChild(newChild, oldChild) {
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    const index = this.childNodes.indexOf(oldChild);
    if (index === -1) {
      throw new Error("Old child not found");
    }
    this.childNodes[index] = newChild;
    newChild.parentNode = this;
    newChild.previousSibling = oldChild.previousSibling;
    newChild.nextSibling = oldChild.nextSibling;
    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild;
    } else {
      this.firstChild = newChild;
    }
    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild;
    } else {
      this.lastChild = newChild;
    }
    if (this._terminalElement && this._terminalElement !== this && newChild.nodeType === NodeType.ELEMENT && oldChild.nodeType === NodeType.ELEMENT) {
      const newElement = newChild;
      const oldElement = oldChild;
      if (newElement._terminalElement && newElement._terminalElement !== newElement && oldElement._terminalElement && oldElement._terminalElement !== oldElement) {
        if (typeof this._terminalElement.removeChild === "function") {
          this._terminalElement.removeChild(oldElement._terminalElement);
        }
        if (typeof this._terminalElement.appendChild === "function") {
          this._terminalElement.appendChild(newElement._terminalElement);
        }
      }
    }
    oldChild.parentNode = null;
    oldChild.previousSibling = null;
    oldChild.nextSibling = null;
    return oldChild;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  before(...nodes) {
    if (!this.parentNode)
      return;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, this._document) : node;
      this.parentNode.insertBefore(nodeToInsert, this);
    }
  }
  after(...nodes) {
    if (!this.parentNode)
      return;
    let ref = this.nextSibling;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, this._document) : node;
      this.parentNode.insertBefore(nodeToInsert, ref);
    }
  }
  addEventListener(event, handler, options) {
    if (!this._eventListeners) {
      this._eventListeners = {};
    }
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push({ handler, options });
  }
  removeEventListener(event, handler) {
    if (!this._eventListeners || !this._eventListeners[event]) {
      return;
    }
    this._eventListeners[event] = this._eventListeners[event].filter((listener) => listener.handler !== handler);
  }
  convertStylesToBlessed() {
    const blessedStyle = {};
    if (this.style.color) {
      blessedStyle.fg = this.style.color;
    }
    if (this.style.backgroundColor) {
      blessedStyle.bg = this.style.backgroundColor;
    }
    if (this.style.fontWeight === "bold" || this.style.fontWeight === "700") {
      blessedStyle.bold = true;
    }
    if (this.style.textDecoration?.includes("underline")) {
      blessedStyle.underline = true;
    }
    if (this.style.border) {
      if (typeof this.style.border === "string") {
        const borderParts = this.style.border.split(" ");
        if (borderParts.length >= 2) {
          blessedStyle.border = {
            type: "line",
            fg: borderParts[2] || "white"
          };
        }
      } else if (typeof this.style.border === "object") {
        blessedStyle.border = this.style.border;
      }
    }
    for (const [key, value] of Object.entries(this.style)) {
      if (["fg", "bg", "bold", "underline", "blink", "inverse", "invisible"].includes(key)) {
        blessedStyle[key] = value;
      }
    }
    return blessedStyle;
  }
  cloneNode(deep = false) {
    const clone = new TerminalElement(this.tagName, {});
    for (const [name, value] of Object.entries(this.attributes)) {
      clone.setAttribute(name, value);
    }
    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  }
}

class TerminalText {
  nodeType = NodeType.TEXT;
  nodeName = "#text";
  nodeValue;
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  _instanceId = generateNodeId();
  _document;
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  constructor(text, document) {
    this.nodeValue = text;
    this._document = document;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  before(...nodes) {
    if (!this.parentNode)
      return;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, {}) : node;
      this.parentNode.insertBefore(nodeToInsert, this);
    }
  }
  after(...nodes) {
    if (!this.parentNode)
      return;
    let ref = this.nextSibling;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, {}) : node;
      this.parentNode.insertBefore(nodeToInsert, ref);
    }
  }
  appendChild(child) {
    throw new Error("Cannot append child to text node");
  }
  insertBefore(node, refNode) {
    throw new Error("Cannot insert before in text node");
  }
  removeChild(child) {
    throw new Error("Cannot remove child from text node");
  }
  replaceChild(newChild, oldChild) {
    throw new Error("Cannot replace child in text node");
  }
  cloneNode(deep = false) {
    const clone = new TerminalText(this.nodeValue || "", {});
    return clone;
  }
}

class TerminalComment {
  nodeType = NodeType.COMMENT;
  nodeName = "#comment";
  nodeValue;
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  _instanceId = generateNodeId();
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  constructor(text, document) {
    this.nodeValue = text;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  before(...nodes) {
    if (!this.parentNode)
      return;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, {}) : node;
      this.parentNode.insertBefore(nodeToInsert, this);
    }
  }
  after(...nodes) {
    if (!this.parentNode)
      return;
    let ref = this.nextSibling;
    for (const node of nodes) {
      const nodeToInsert = typeof node === "string" ? new TerminalText(node, {}) : node;
      this.parentNode.insertBefore(nodeToInsert, ref);
    }
  }
  appendChild(child) {
    throw new Error("Cannot append child to comment node");
  }
  insertBefore(node, refNode) {
    throw new Error("Cannot insert before in comment node");
  }
  removeChild(child) {
    throw new Error("Cannot remove child from comment node");
  }
  replaceChild(newChild, oldChild) {
    throw new Error("Cannot replace child in comment node");
  }
  cloneNode(deep = false) {
    const clone = new TerminalComment(this.nodeValue || "", {});
    return clone;
  }
}

class TerminalDocumentFragment {
  nodeType = NodeType.FRAGMENT;
  nodeName = "#document-fragment";
  _parentNode = null;
  _firstChild = null;
  _lastChild = null;
  _nextSibling = null;
  _previousSibling = null;
  childNodes = [];
  _instanceId = generateNodeId();
  get parentNode() {
    return this._parentNode;
  }
  set parentNode(value) {
    this._parentNode = value;
  }
  get firstChild() {
    return this._firstChild;
  }
  set firstChild(value) {
    this._firstChild = value;
  }
  get lastChild() {
    return this._lastChild;
  }
  set lastChild(value) {
    this._lastChild = value;
  }
  get nextSibling() {
    return this._nextSibling;
  }
  set nextSibling(value) {
    this._nextSibling = value;
  }
  get previousSibling() {
    return this._previousSibling;
  }
  set previousSibling(value) {
    this._previousSibling = value;
  }
  constructor(document) {}
  append(...nodes) {
    for (const node of nodes) {
      if (typeof node === "string") {
        this.appendChild(document.createTextNode(node));
      } else {
        this.appendChild(node);
      }
    }
  }
  appendChild(child) {
    ensureNodeProperties(child);
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    this.childNodes.push(child);
    updateNodeRelationships(this, child, this.lastChild, null);
    if (!this.firstChild) {
      this.firstChild = child;
    }
    this.lastChild = child;
    return child;
  }
  insertBefore(node, refNode) {
    if (!refNode) {
      return this.appendChild(node);
    }
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    const index = this.childNodes.indexOf(refNode);
    if (index === -1) {
      throw new Error("Reference node not found");
    }
    this.childNodes.splice(index, 0, node);
    ensureNodeProperties(node);
    ensureNodeProperties(refNode);
    const prevSibling = refNode.previousSibling;
    updateNodeRelationships(this, node, prevSibling, refNode);
    if (!prevSibling) {
      this.firstChild = node;
    }
    return node;
  }
  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index === -1) {
      throw new Error("Child not found");
    }
    this.childNodes.splice(index, 1);
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      this.firstChild = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      this.lastChild = child.previousSibling;
    }
    safeSetProperty(child, "parentNode", null);
    safeSetProperty(child, "previousSibling", null);
    safeSetProperty(child, "nextSibling", null);
    return child;
  }
  replaceChild(newChild, oldChild) {
    if (newChild.parentNode) {
      newChild.parentNode.removeChild(newChild);
    }
    const index = this.childNodes.indexOf(oldChild);
    if (index === -1) {
      throw new Error("Old child not found");
    }
    this.childNodes[index] = newChild;
    newChild.parentNode = this;
    newChild.previousSibling = oldChild.previousSibling;
    newChild.nextSibling = oldChild.nextSibling;
    if (oldChild.previousSibling) {
      oldChild.previousSibling.nextSibling = newChild;
    } else {
      this.firstChild = newChild;
    }
    if (oldChild.nextSibling) {
      oldChild.nextSibling.previousSibling = newChild;
    } else {
      this.lastChild = newChild;
    }
    oldChild.parentNode = null;
    oldChild.previousSibling = null;
    oldChild.nextSibling = null;
    return oldChild;
  }
  cloneNode(deep = false) {
    const clone = new TerminalDocumentFragment({});
    if (deep) {
      for (const child of this.childNodes) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  }
}
function createDocument() {
  return new TerminalDocument;
}
function createElement(tagName) {
  return document.createElement(tagName);
}
function createTextNode(text) {
  return document.createTextNode(text);
}
function createComment(text) {
  return document.createComment(text);
}
function createDocumentFragment() {
  return document.createDocumentFragment();
}
var document = createDocument();
export {
  document,
  createTextNode,
  createElement,
  createDocumentFragment,
  createDocument,
  createComment,
  TerminalText,
  TerminalTemplateElement,
  TerminalElement,
  TerminalDocumentFragment,
  TerminalDocument,
  TerminalComment
};
