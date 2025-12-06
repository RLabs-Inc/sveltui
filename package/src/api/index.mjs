// @bun
var __require = import.meta.require;

// src/api/index.ts
import {
  render,
  refresh,
  exit,
  createRenderer
} from "../renderer";
import {
  RenderScheduler,
  globalScheduler
} from "../renderer/render-scheduler";
import {
  RenderQueue
} from "../renderer/render-queue";
import {
  renderScreen,
  renderImmediate,
  getRenderStats,
  pauseRendering,
  resumeRendering
} from "../renderer/screen";
import {
  createElement,
  createText,
  createComment,
  createFragment,
  insertNode,
  appendChild,
  removeChild,
  setAttribute,
  removeAttribute,
  setText,
  setElementProps,
  addEventListener,
  removeEventListener
} from "./runtime";
import {
  applyLayout,
  LayoutDirection,
  LayoutJustify,
  LayoutAlign,
  percentToPixels,
  resolveWidth,
  resolveHeight
} from "../layout";
import {
  applyYogaLayout
} from "../layout/yoga";
import {
  setupBrowserGlobals,
  isBrowserGlobalsSetup,
  clearBrowserGlobals
} from "../utils/browser-globals";
import {
  StyleState,
  createStyleState,
  useStyleStateEvents
} from '../dom/style-state.svelte.js';
import {
  parseColor,
  parseStyleAttributes,
  parseBlessedStyle,
  mergeStyles,
  styleToString,
  createStyle,
  inheritStyles,
  applyTheme,
  TERMINAL_COLORS,
  TEXT_ATTRIBUTES,
  BORDER_TYPES
} from "../dom/style-utils";
import {
  ReactiveEventEmitter,
  createElementEventEmitter,
  getElementEventEmitter,
  globalEventBus,
  createEventWatcher,
  createEventSummary
} from '../dom/reactive-events.svelte.js';
import {
  bridgeElementEvents,
  bridgeScreenEvents,
  createCustomEvent,
  EventDelegator,
  createBlessedUpdater,
  blessedUpdaters
} from "../dom/event-bridge";
import {
  createFocusContext,
  getFocusContext,
  hasFocusContext
} from '../dom/focus-context.svelte.js';
import {
  isFocusable,
  getFocusableElements,
  calculateTabOrder,
  getNextFocusable,
  getPreviousFocusable,
  applyFocusRing,
  createFocusIndicator,
  setupKeyboardNavigation,
  createFocusTrap,
  defaultKeyboardShortcuts
} from "../dom/focus-manager";
import {
  ReactiveStream,
  createReactiveStream
} from '../streaming/reactive-stream.svelte.js';
import {
  responseToStream,
  textToStream,
  createMockClaudeStream,
  parseSSEStream,
  createBackpressureStream,
  mergeStreams,
  transformStream,
  throttleStream,
  bufferStream
} from "../streaming/stream-utils";
import {
  SimpleMouseState,
  mouseState,
  isMouseOver,
  getMouseRelativePosition
} from "../input/simple-mouse-state";
import {
  convertToElementCoordinates,
  getElementBounds,
  hitTest,
  getElementAtPosition,
  distance,
  angle,
  normalizeMouseEvent,
  isDraggable,
  isDropTarget,
  calculateDragOffset,
  applyDragConstraints,
  detectGesture,
  createDebouncedMouseHandler,
  createThrottledMouseHandler
} from "../input/mouse-utils";
function createComponent(type) {
  return function(props = {}) {
    const doc = globalThis.document || __require("../dom/document").document;
    const element = doc.createElement(type);
    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  };
}
var Box = createComponent("box");
var Text = createComponent("text");
var List = createComponent("list");
var Input = createComponent("input");
var Button = createComponent("button");
var Progress = createComponent("progress");
var VERSION = "0.1.0";
export {
  useStyleStateEvents,
  transformStream,
  throttleStream,
  textToStream,
  styleToString,
  setupKeyboardNavigation,
  setupBrowserGlobals,
  setText,
  setElementProps,
  setAttribute,
  resumeRendering,
  responseToStream,
  resolveWidth,
  resolveHeight,
  renderScreen,
  renderImmediate,
  render,
  removeEventListener,
  removeChild,
  removeAttribute,
  refresh,
  percentToPixels,
  pauseRendering,
  parseStyleAttributes,
  parseSSEStream,
  parseColor,
  parseBlessedStyle,
  normalizeMouseEvent,
  mouseState,
  mergeStyles,
  mergeStreams,
  isMouseOver,
  isFocusable,
  isDropTarget,
  isDraggable,
  isBrowserGlobalsSetup,
  insertNode,
  inheritStyles,
  hitTest,
  hasFocusContext,
  globalScheduler,
  globalEventBus,
  getRenderStats,
  getPreviousFocusable,
  getNextFocusable,
  getMouseRelativePosition,
  getFocusableElements,
  getFocusContext,
  getElementEventEmitter,
  getElementBounds,
  getElementAtPosition,
  exit,
  distance,
  detectGesture,
  defaultKeyboardShortcuts,
  createThrottledMouseHandler,
  createText,
  createStyleState,
  createStyle,
  createRenderer,
  createReactiveStream,
  createMockClaudeStream,
  createFragment,
  createFocusTrap,
  createFocusIndicator,
  createFocusContext,
  createEventWatcher,
  createEventSummary,
  createElementEventEmitter,
  createElement,
  createDebouncedMouseHandler,
  createCustomEvent,
  createComponent,
  createComment,
  createBlessedUpdater,
  createBackpressureStream,
  convertToElementCoordinates,
  clearBrowserGlobals,
  calculateTabOrder,
  calculateDragOffset,
  bufferStream,
  bridgeScreenEvents,
  bridgeElementEvents,
  blessedUpdaters,
  applyYogaLayout,
  applyTheme,
  applyLayout,
  applyFocusRing,
  applyDragConstraints,
  appendChild,
  angle,
  addEventListener,
  VERSION,
  Text,
  TEXT_ATTRIBUTES,
  TERMINAL_COLORS,
  StyleState,
  SimpleMouseState,
  RenderScheduler,
  RenderQueue,
  ReactiveStream,
  ReactiveEventEmitter,
  Progress,
  List,
  LayoutJustify,
  LayoutDirection,
  LayoutAlign,
  Input,
  EventDelegator,
  Button,
  Box,
  BORDER_TYPES
};
