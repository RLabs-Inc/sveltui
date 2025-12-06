// @bun
// src/utils/browser-globals-happydom.ts
import { Window } from "happy-dom";
var happyWindow = null;
function setupBrowserGlobals() {
  if (happyWindow) {
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
  globalAny.requestAnimationFrame = happyWindow.requestAnimationFrame.bind(happyWindow);
  globalAny.cancelAnimationFrame = happyWindow.cancelAnimationFrame.bind(happyWindow);
  globalAny.setTimeout = happyWindow.setTimeout.bind(happyWindow);
  globalAny.clearTimeout = happyWindow.clearTimeout.bind(happyWindow);
  globalAny.setInterval = happyWindow.setInterval.bind(happyWindow);
  globalAny.clearInterval = happyWindow.clearInterval.bind(happyWindow);
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
  globalAny.HTMLImageElement = happyWindow.HTMLImageElement;
  globalAny.HTMLAudioElement = happyWindow.HTMLAudioElement;
  globalAny.HTMLVideoElement = happyWindow.HTMLVideoElement;
  globalAny.HTMLCanvasElement = happyWindow.HTMLCanvasElement;
  globalAny.HTMLAnchorElement = happyWindow.HTMLAnchorElement;
  globalAny.HTMLParagraphElement = happyWindow.HTMLParagraphElement;
  globalAny.HTMLHeadingElement = happyWindow.HTMLHeadingElement;
  globalAny.HTMLSpanElement = happyWindow.HTMLSpanElement;
  globalAny.HTMLBRElement = happyWindow.HTMLBRElement;
  globalAny.HTMLHRElement = happyWindow.HTMLHRElement;
  globalAny.HTMLLIElement = happyWindow.HTMLLIElement;
  globalAny.HTMLUListElement = happyWindow.HTMLUListElement;
  globalAny.HTMLOListElement = happyWindow.HTMLOListElement;
  globalAny.HTMLTableElement = happyWindow.HTMLTableElement;
  globalAny.HTMLTableRowElement = happyWindow.HTMLTableRowElement;
  globalAny.HTMLTableCellElement = happyWindow.HTMLTableCellElement;
  globalAny.HTMLScriptElement = happyWindow.HTMLScriptElement;
  globalAny.HTMLStyleElement = happyWindow.HTMLStyleElement;
  globalAny.HTMLLinkElement = happyWindow.HTMLLinkElement;
  globalAny.HTMLMetaElement = happyWindow.HTMLMetaElement;
  globalAny.HTMLTitleElement = happyWindow.HTMLTitleElement;
  globalAny.HTMLBodyElement = happyWindow.HTMLBodyElement;
  globalAny.HTMLHeadElement = happyWindow.HTMLHeadElement;
  globalAny.HTMLHtmlElement = happyWindow.HTMLHtmlElement;
  globalAny.SVGElement = happyWindow.SVGElement;
  globalAny.SVGGraphicsElement = happyWindow.SVGGraphicsElement;
  globalAny.SVGSVGElement = happyWindow.SVGSVGElement;
  globalAny.customElements = happyWindow.customElements;
  globalAny.CustomElementRegistry = happyWindow.CustomElementRegistry;
  globalAny.ShadowRoot = happyWindow.ShadowRoot;
  globalAny.Performance = happyWindow.Performance;
  globalAny.performance = happyWindow.performance;
  globalAny.URL = happyWindow.URL;
  globalAny.URLSearchParams = happyWindow.URLSearchParams;
  globalAny.fetch = happyWindow.fetch.bind(happyWindow);
  globalAny.Headers = happyWindow.Headers;
  globalAny.Request = happyWindow.Request;
  globalAny.Response = happyWindow.Response;
  globalAny.FormData = happyWindow.FormData;
  globalAny.File = happyWindow.File;
  globalAny.FileList = happyWindow.FileList;
  globalAny.FileReader = happyWindow.FileReader;
  globalAny.Blob = happyWindow.Blob;
  globalAny.History = happyWindow.History;
  globalAny.history = happyWindow.history;
  globalAny.MutationObserver = happyWindow.MutationObserver;
  globalAny.MutationRecord = happyWindow.MutationRecord;
  globalAny.ResizeObserver = happyWindow.ResizeObserver;
  globalAny.IntersectionObserver = happyWindow.IntersectionObserver;
  globalAny.Animation = happyWindow.Animation;
  globalAny.AnimationEvent = happyWindow.AnimationEvent;
  globalAny.XPathResult = happyWindow.XPathResult;
  globalAny.XPathEvaluator = happyWindow.XPathEvaluator;
  globalAny.XPathExpression = happyWindow.XPathExpression;
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
  return happyWindow !== null;
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
    "cancelAnimationFrame"
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
