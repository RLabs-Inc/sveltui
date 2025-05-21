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
  type RendererOptions
} from '../renderer';

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
    return {
      type,
      props,
    };
  };
}

// Export pre-bound component creators
export const Box = createComponent('box');
export const Text = createComponent('text');
export const List = createComponent('list');
export const Input = createComponent('input');
export const Button = createComponent('button');
export const Progress = createComponent('progress');

/**
 * SvelTUI version
 */
export const VERSION = '0.1.0';