/**
 * SvelTUI Public API
 * 
 * This module exports the public APIs for SvelTUI.
 */

// Export renderer
export { 
  render,
  refresh,
  exit,
  type RendererOptions,
  createRenderer,
  type ComponentRenderOptions
} from '../renderer';

// Export render scheduler
export {
  RenderScheduler,
  globalScheduler
} from '../renderer/render-scheduler';

export {
  type RenderPriority,
  type RenderRequest,
  type RenderStats,
  type QueueStats,
  RenderQueue
} from '../renderer/render-queue';

// Export screen utilities with scheduler support
export {
  renderScreen,
  renderImmediate,
  getRenderStats,
  pauseRendering,
  resumeRendering
} from '../renderer/screen';

// Export runtime DOM connector
export {
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
  removeEventListener,
} from './runtime';

// Export layout utilities
export {
  applyLayout,
  LayoutDirection,
  LayoutJustify,
  LayoutAlign,
  percentToPixels,
  resolveWidth,
  resolveHeight,
} from '../layout';

// Export Yoga layout
export {
  applyYogaLayout,
  type YogaLayoutOptions,
} from '../layout/yoga';

// Export browser globals utility for Svelte 5 compatibility
export {
  setupBrowserGlobals,
  isBrowserGlobalsSetup,
  clearBrowserGlobals,
  type BrowserGlobalsOptions,
} from '../utils/browser-globals';

// Export component prop types for TypeScript users
export type {
  BaseElementProps,
  BoxElementProps,
  TextElementProps,
  ListElementProps,
  InputElementProps,
  ButtonElementProps,
  ProgressBarElementProps,
} from '../dom/elements';

// Export style state system
export {
  StyleState,
  createStyleState,
  useStyleStateEvents,
  type TerminalStyle,
  type StyleStateConfig,
} from '../dom/style-state.svelte.ts';

export {
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
  BORDER_TYPES,
  type TerminalColor,
  type TextAttribute,
  type BorderType,
} from '../dom/style-utils';

// Export reactive event system
export {
  ReactiveEventEmitter,
  createElementEventEmitter,
  getElementEventEmitter,
  globalEventBus,
  createEventWatcher,
  createEventSummary,
  type ReactiveEventData,
  type ReactiveEventHandler,
} from '../dom/reactive-events.svelte.ts';

export {
  bridgeElementEvents,
  bridgeScreenEvents,
  createCustomEvent,
  EventDelegator,
  createBlessedUpdater,
  blessedUpdaters,
} from '../dom/event-bridge';

// Export focus management system
export {
  createFocusContext,
  getFocusContext,
  hasFocusContext,
  type FocusContext,
  type FocusableElement,
} from '../dom/focus-context.svelte.ts';

export {
  isFocusable,
  getFocusableElements,
  calculateTabOrder,
  getNextFocusable,
  getPreviousFocusable,
  applyFocusRing,
  createFocusIndicator,
  setupKeyboardNavigation,
  createFocusTrap,
  type FocusableElementInfo,
  type KeyboardShortcuts,
  defaultKeyboardShortcuts,
} from '../dom/focus-manager';

/**
 * Creates a component bound to a specific element type
 * 
 * This is a helper for creating pre-bound components for
 * common terminal elements.
 * 
 * @param type - Element type
 * @returns A component creator function
 * 
 * @example
 * ```ts
 * import { Box, Text, List } from 'sveltui';
 * 
 * // Create a box component
 * const MyBox = Box({
 *   width: '50%',
 *   height: 10,
 *   border: true,
 * });
 * ```
 */
export function createComponent(type: string) {
  return function(props: Record<string, any> = {}) {
    // Import document from our DOM implementation
    const doc = globalThis.document || require('../dom/document').document;
    
    // Create actual DOM element
    const element = doc.createElement(type);
    
    // Set properties
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        // Handle style object
        Object.assign(element.style, value);
      } else {
        // Set as attribute
        element.setAttribute(key, value);
      }
    });
    
    return element;
  };
}

// Export pre-bound component creators
export const Box = createComponent('box');
export const Text = createComponent('text');
export const List = createComponent('list');
export const Input = createComponent('input');
export const Button = createComponent('button');
export const Progress = createComponent('progress');

// Export streaming utilities
export {
  ReactiveStream,
  createReactiveStream,
  type StreamOptions,
  type StreamMetrics,
} from '../streaming/reactive-stream.svelte.ts';

export {
  responseToStream,
  textToStream,
  createMockClaudeStream,
  parseSSEStream,
  createBackpressureStream,
  mergeStreams,
  transformStream,
  throttleStream,
  bufferStream,
} from '../streaming/stream-utils';

// Export mouse tracking system
export {
  SimpleMouseState,
  mouseState,
  isMouseOver,
  getMouseRelativePosition,
  type MouseButtonState,
  type MousePosition,
  type DragState,
  type MouseMovement,
} from '../input/simple-mouse-state';

export {
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
  createThrottledMouseHandler,
  type GestureDetection,
} from '../input/mouse-utils';

/**
 * SvelTUI version
 */
export const VERSION = '0.1.0';