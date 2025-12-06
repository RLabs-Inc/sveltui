// @bun
// src/utils/browser-globals.ts
import { Window } from "happy-dom";
import { applyNodePatches } from "../dom/node-patch";
var happyWindow = null;
function setupBrowserGlobals(options = {}) {
  const {
    windowProps = {},
    forceOverride = false
  } = options;
  if (!forceOverride && (happyWindow || typeof globalThis.window !== "undefined")) {
    return;
  }
  happyWindow = new Window({
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
    url: "file://terminal",
    console,
    settings: {
      disableJavaScriptFileLoading: true,
      disableJavaScriptEvaluation: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableComputedStyleRendering: true,
      enableFileSystemHttpRequests: false,
      navigation: {
        disableMainFrameNavigation: true,
        disableChildFrameNavigation: true,
        disableChildPageNavigation: true,
        disableFallbackToSetURL: true
      }
    }
  });
  const globalAny = globalThis;
  globalAny.window = happyWindow;
  globalAny.document = happyWindow.document;
  globalAny.navigator = happyWindow.navigator;
  globalAny.location = happyWindow.location;
  globalAny.Element = happyWindow.Element;
  globalAny.HTMLElement = happyWindow.HTMLElement;
  globalAny.HTMLDivElement = happyWindow.HTMLDivElement;
  globalAny.HTMLTemplateElement = happyWindow.HTMLTemplateElement;
  globalAny.Node = happyWindow.Node;
  globalAny.NodeList = happyWindow.NodeList;
  globalAny.Text = happyWindow.Text;
  globalAny.Comment = happyWindow.Comment;
  globalAny.Document = happyWindow.Document;
  globalAny.DocumentFragment = happyWindow.DocumentFragment;
  globalAny.DOMParser = happyWindow.DOMParser;
  globalAny.XMLSerializer = happyWindow.XMLSerializer;
  globalAny.Event = happyWindow.Event;
  globalAny.EventTarget = happyWindow.EventTarget;
  globalAny.CustomEvent = happyWindow.CustomEvent;
  globalAny.KeyboardEvent = happyWindow.KeyboardEvent;
  globalAny.MouseEvent = happyWindow.MouseEvent;
  globalAny.FocusEvent = happyWindow.FocusEvent || class FocusEvent extends happyWindow.Event {
    constructor(type, init) {
      super(type, init);
    }
  };
  globalAny.InputEvent = happyWindow.InputEvent || class InputEvent extends happyWindow.Event {
    data;
    inputType;
    constructor(type, init) {
      super(type, init);
      this.data = init?.data || null;
      this.inputType = init?.inputType || "";
    }
  };
  globalAny.requestAnimationFrame = happyWindow.requestAnimationFrame.bind(happyWindow);
  globalAny.cancelAnimationFrame = happyWindow.cancelAnimationFrame.bind(happyWindow);
  globalAny.CSSStyleDeclaration = happyWindow.CSSStyleDeclaration;
  globalAny.CSSStyleSheet = happyWindow.CSSStyleSheet;
  globalAny.getComputedStyle = happyWindow.getComputedStyle.bind(happyWindow);
  globalAny.Storage = happyWindow.Storage;
  globalAny.localStorage = happyWindow.localStorage;
  globalAny.sessionStorage = happyWindow.sessionStorage;
  globalAny.Range = happyWindow.Range;
  globalAny.Selection = happyWindow.Selection;
  globalAny.TreeWalker = happyWindow.TreeWalker;
  globalAny.NodeIterator = happyWindow.NodeIterator;
  globalAny.HTMLCollection = happyWindow.HTMLCollection;
  globalAny.DOMRect = happyWindow.DOMRect;
  globalAny.DOMRectReadOnly = happyWindow.DOMRectReadOnly;
  globalAny.DOMTokenList = happyWindow.DOMTokenList;
  globalAny.NamedNodeMap = happyWindow.NamedNodeMap;
  globalAny.Attr = happyWindow.Attr;
  globalAny.HTMLFormElement = happyWindow.HTMLFormElement;
  globalAny.HTMLInputElement = happyWindow.HTMLInputElement;
  globalAny.HTMLTextAreaElement = happyWindow.HTMLTextAreaElement;
  globalAny.HTMLSelectElement = happyWindow.HTMLSelectElement;
  globalAny.HTMLOptionElement = happyWindow.HTMLOptionElement;
  globalAny.HTMLButtonElement = happyWindow.HTMLButtonElement;
  globalAny.HTMLAnchorElement = happyWindow.HTMLAnchorElement;
  globalAny.HTMLImageElement = happyWindow.HTMLImageElement;
  globalAny.HTMLScriptElement = happyWindow.HTMLScriptElement;
  globalAny.HTMLStyleElement = happyWindow.HTMLStyleElement;
  globalAny.HTMLLinkElement = happyWindow.HTMLLinkElement;
  globalAny.HTMLMetaElement = happyWindow.HTMLMetaElement;
  globalAny.customElements = happyWindow.customElements;
  globalAny.CustomElementRegistry = happyWindow.CustomElementRegistry;
  globalAny.ShadowRoot = happyWindow.ShadowRoot;
  globalAny.URL = happyWindow.URL;
  globalAny.URLSearchParams = happyWindow.URLSearchParams;
  globalAny.FormData = happyWindow.FormData;
  globalAny.File = happyWindow.File;
  globalAny.FileList = happyWindow.FileList;
  globalAny.Blob = happyWindow.Blob;
  globalAny.History = happyWindow.History;
  globalAny.history = happyWindow.history;
  globalAny.MutationObserver = happyWindow.MutationObserver;
  globalAny.MutationRecord = happyWindow.MutationRecord;
  Object.assign(globalAny.window, windowProps);
  applyNodePatches(globalAny.Element, globalAny.Document);
  const nodePrototype = happyWindow.Node.prototype;
  globalAny.first_child_getter = Object.getOwnPropertyDescriptor(nodePrototype, "firstChild")?.get;
  globalAny.next_sibling_getter = Object.getOwnPropertyDescriptor(nodePrototype, "nextSibling")?.get;
  globalAny.last_child_getter = Object.getOwnPropertyDescriptor(nodePrototype, "lastChild")?.get;
  globalAny.previous_sibling_getter = Object.getOwnPropertyDescriptor(nodePrototype, "previousSibling")?.get;
  globalAny.parent_node_getter = Object.getOwnPropertyDescriptor(nodePrototype, "parentNode")?.get;
  if (!globalAny.$state) {
    globalAny.$state = function(initial) {
      return { current: initial };
    };
  }
  if (!globalAny.$derived) {
    globalAny.$derived = {
      by: function(fn) {
        return fn();
      }
    };
  }
  if (!globalAny.$effect) {
    globalAny.$effect = function(fn) {
      return fn();
    };
  }
}
function isBrowserGlobalsSetup() {
  return happyWindow !== null || typeof globalThis.window !== "undefined";
}
function clearBrowserGlobals() {
  if (happyWindow) {
    happyWindow.happyDOM.cancelAsync();
    happyWindow = null;
  }
  const globalAny = globalThis;
  const propsToDelete = [
    "window",
    "document",
    "navigator",
    "location",
    "Element",
    "HTMLElement",
    "Node",
    "Text",
    "Comment",
    "Document",
    "DocumentFragment",
    "Event",
    "EventTarget",
    "CustomEvent",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "CSSStyleDeclaration",
    "Storage",
    "localStorage",
    "sessionStorage",
    "Range",
    "Selection",
    "TreeWalker",
    "NodeIterator",
    "HTMLCollection",
    "DOMRect",
    "DOMTokenList",
    "NamedNodeMap",
    "Attr",
    "URL",
    "URLSearchParams",
    "FormData",
    "File",
    "FileList",
    "Blob",
    "History",
    "history",
    "MutationObserver",
    "customElements",
    "CustomElementRegistry",
    "ShadowRoot"
  ];
  for (const prop of propsToDelete) {
    delete globalAny[prop];
  }
}
setupBrowserGlobals();
export {
  setupBrowserGlobals,
  isBrowserGlobalsSetup,
  clearBrowserGlobals
};
