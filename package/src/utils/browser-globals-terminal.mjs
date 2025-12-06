// @bun
// src/utils/browser-globals-terminal.ts
import {
  document as terminalDocument,
  TerminalDocument,
  TerminalElement,
  TerminalText,
  TerminalComment,
  TerminalDocumentFragment,
  TerminalTemplateElement
} from "../dom";
var isSetup = false;
function setupBrowserGlobals(options = {}) {
  const { forceOverride = false, debug = false } = options;
  if (!forceOverride && isSetup) {
    return;
  }
  const globalWindow = {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
    location: {
      href: "terminal://app",
      protocol: "terminal:",
      host: "app",
      hostname: "app",
      pathname: "/",
      search: "",
      hash: ""
    },
    navigator: {
      userAgent: "SvelTUI Terminal/1.0",
      platform: process.platform,
      language: "en-US"
    },
    console,
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    setImmediate: global.setImmediate,
    clearImmediate: global.clearImmediate,
    requestAnimationFrame: (callback) => {
      return setTimeout(() => callback(Date.now()), 16);
    },
    cancelAnimationFrame: (id) => {
      clearTimeout(id);
    },
    localStorage: createStorageStub(),
    sessionStorage: createStorageStub(),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    getComputedStyle: () => ({
      getPropertyValue: () => ""
    }),
    customElements: {
      define: () => {},
      get: () => {
        return;
      },
      whenDefined: () => Promise.resolve()
    }
  };
  const g = global;
  g.window = globalWindow;
  g.document = terminalDocument;
  g.Document = TerminalDocument;
  g.DocumentFragment = TerminalDocumentFragment;
  g.Element = TerminalElement;
  g.HTMLElement = TerminalElement;
  g.HTMLDivElement = TerminalElement;
  g.HTMLTemplateElement = TerminalTemplateElement;
  g.Node = TerminalElement;
  g.Text = TerminalText;
  g.Comment = TerminalComment;
  g.Node.ELEMENT_NODE = 1;
  g.Node.TEXT_NODE = 3;
  g.Node.COMMENT_NODE = 8;
  g.Node.DOCUMENT_NODE = 9;
  g.Node.DOCUMENT_FRAGMENT_NODE = 11;
  g.Event = class Event {
    type;
    bubbles;
    cancelable;
    defaultPrevented = false;
    constructor(type, init) {
      this.type = type;
      this.bubbles = init?.bubbles || false;
      this.cancelable = init?.cancelable || false;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
  g.CustomEvent = class CustomEvent extends g.Event {
    detail;
    constructor(type, init) {
      super(type, init);
      this.detail = init?.detail;
    }
  };
  g.KeyboardEvent = class KeyboardEvent extends g.Event {
    key;
    code;
    constructor(type, init) {
      super(type, init);
      this.key = init?.key || "";
      this.code = init?.code || "";
    }
  };
  g.MouseEvent = class MouseEvent extends g.Event {
    clientX;
    clientY;
    constructor(type, init) {
      super(type, init);
      this.clientX = init?.clientX || 0;
      this.clientY = init?.clientY || 0;
    }
  };
  g.requestAnimationFrame = globalWindow.requestAnimationFrame;
  g.cancelAnimationFrame = globalWindow.cancelAnimationFrame;
  g.getComputedStyle = globalWindow.getComputedStyle;
  g.customElements = globalWindow.customElements;
  g.location = globalWindow.location;
  g.navigator = globalWindow.navigator;
  g.localStorage = globalWindow.localStorage;
  g.sessionStorage = globalWindow.sessionStorage;
  g.URL = URL;
  g.URLSearchParams = URLSearchParams;
  g.DOMParser = class DOMParser {
    parseFromString(str, type) {
      const doc = new TerminalDocument;
      if (str.includes("<")) {
        const div = doc.createElement("div");
        div.innerHTML = str;
        return doc;
      }
      return doc;
    }
  };
  g.Range = class Range {
    collapsed = true;
    commonAncestorContainer = null;
    startContainer = null;
    endContainer = null;
    startOffset = 0;
    endOffset = 0;
    setStart() {}
    setEnd() {}
    collapse() {}
    selectNode() {}
    selectNodeContents() {}
    cloneContents() {
      return new TerminalDocumentFragment(terminalDocument);
    }
    deleteContents() {}
    extractContents() {
      return new TerminalDocumentFragment(terminalDocument);
    }
    insertNode() {}
    surroundContents() {}
    compareBoundaryPoints() {
      return 0;
    }
    cloneRange() {
      return new Range;
    }
    detach() {}
  };
  g.Selection = class Selection {
    rangeCount = 0;
    getRangeAt() {
      return new g.Range;
    }
    addRange() {}
    removeRange() {}
    removeAllRanges() {}
    collapse() {}
    extend() {}
    selectAllChildren() {}
    deleteFromDocument() {}
    toString() {
      return "";
    }
  };
  g.TreeWalker = class TreeWalker {
    root;
    currentNode;
    constructor(root) {
      this.root = root;
      this.currentNode = root;
    }
    nextNode() {
      return null;
    }
    previousNode() {
      return null;
    }
    firstChild() {
      return null;
    }
    lastChild() {
      return null;
    }
    nextSibling() {
      return null;
    }
    previousSibling() {
      return null;
    }
    parentNode() {
      return null;
    }
  };
  g.NodeList = Array;
  g.HTMLCollection = Array;
  g.NamedNodeMap = Map;
  g.MutationObserver = class MutationObserver {
    constructor(callback) {}
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  g.DOMRect = class DOMRect {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    top = 0;
    right = 0;
    bottom = 0;
    left = 0;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.left = x;
      this.right = x + width;
      this.bottom = y + height;
    }
  };
  g.CSSStyleDeclaration = class CSSStyleDeclaration {
    cssText = "";
    length = 0;
    getPropertyValue() {
      return "";
    }
    removeProperty() {
      return "";
    }
    setProperty() {}
    item() {
      return "";
    }
  };
  g.FormData = class FormData {
    append() {}
    delete() {}
    get() {
      return null;
    }
    has() {
      return false;
    }
    set() {}
    entries() {
      return [][Symbol.iterator]();
    }
  };
  g.File = class File {
    name;
    size = 0;
    type = "";
    constructor(bits, name) {
      this.name = name;
    }
  };
  g.Blob = class Blob {
    size = 0;
    type = "";
    constructor(parts, options2) {}
    slice() {
      return new Blob;
    }
  };
  g.History = class History {
    length = 1;
    state = null;
    back() {}
    forward() {}
    go() {}
    pushState() {}
    replaceState() {}
  };
  g.history = new g.History;
  const nodeProto = TerminalElement.prototype;
  g.first_child_getter = Object.getOwnPropertyDescriptor(nodeProto, "firstChild")?.get;
  g.next_sibling_getter = Object.getOwnPropertyDescriptor(nodeProto, "nextSibling")?.get;
  g.last_child_getter = Object.getOwnPropertyDescriptor(nodeProto, "lastChild")?.get;
  g.previous_sibling_getter = Object.getOwnPropertyDescriptor(nodeProto, "previousSibling")?.get;
  g.parent_node_getter = Object.getOwnPropertyDescriptor(nodeProto, "parentNode")?.get;
  isSetup = true;
  if (debug) {
    console.log("[Browser Globals] Terminal DOM globals set up");
  }
}
function createStorageStub() {
  const storage = new Map;
  return {
    length: 0,
    clear() {
      storage.clear();
      this.length = 0;
    },
    getItem(key) {
      return storage.get(key) || null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
      this.length = storage.size;
    },
    removeItem(key) {
      storage.delete(key);
      this.length = storage.size;
    },
    key(index) {
      return Array.from(storage.keys())[index] || null;
    }
  };
}
function isBrowserGlobalsSetup() {
  return isSetup;
}
function clearBrowserGlobals() {
  const g = global;
  const globals = [
    "window",
    "document",
    "Document",
    "DocumentFragment",
    "Element",
    "HTMLElement",
    "HTMLDivElement",
    "HTMLTemplateElement",
    "Node",
    "Text",
    "Comment",
    "Event",
    "CustomEvent",
    "KeyboardEvent",
    "MouseEvent",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "getComputedStyle",
    "customElements",
    "location",
    "navigator",
    "localStorage",
    "sessionStorage",
    "URL",
    "URLSearchParams",
    "DOMParser",
    "Range",
    "Selection",
    "TreeWalker",
    "NodeList",
    "HTMLCollection",
    "NamedNodeMap",
    "MutationObserver",
    "DOMRect",
    "CSSStyleDeclaration",
    "FormData",
    "File",
    "Blob",
    "History",
    "history",
    "first_child_getter",
    "next_sibling_getter",
    "last_child_getter",
    "previous_sibling_getter",
    "parent_node_getter"
  ];
  for (const key of globals) {
    delete g[key];
  }
  isSetup = false;
}
export {
  setupBrowserGlobals,
  isBrowserGlobalsSetup,
  clearBrowserGlobals
};
