/**
 * Base Adapter for SveltUI Components
 * 
 * This file provides shared functionality for all component adapters,
 * creating a consistent interface between Svelte components and blessed.
 */

import * as blessed from 'blessed';
import { getTheme } from '../theme-manager';

/**
 * Common properties to exclude when updating blessed elements
 * These props are handled specially and should not be directly assigned
 */
export const COMMON_EXCLUDED_PROPS = [
  'parent',
  'style',
  'onChange',
  'onSelect',
  'onFocus',
  'onBlur',
  'onClick',
  'handleKeyNavigation',
  'handleFocus',
  'handleBlur',
  'isFocused'
];

/**
 * Creates a base blessed element with common configuration
 */
export function createBaseElement(
  props: Record<string, any>,
  options: {
    type: string;
    parent?: blessed.Widgets.Node;
    interactive?: boolean;
  }
): blessed.Widgets.BlessedElement {
  // Extract common configuration
  const { type, parent, interactive = false } = options;
  
  // Basic element configuration
  const elementConfig: any = {
    ...props,
    parent,
    tags: true, // Enable color tags in content
  };
  
  // For interactive elements, add input properties
  if (interactive) {
    elementConfig.focusable = true;
    elementConfig.input = true;
    elementConfig.keys = true;
    elementConfig.vi = true;
    elementConfig.mouse = true;
  }
  
  // Create the element based on type
  let element: blessed.Widgets.BlessedElement;
  
  switch (type) {
    case 'box':
      element = blessed.box(elementConfig);
      break;
    case 'text':
      element = blessed.text(elementConfig);
      break;
    case 'list':
      element = blessed.list(elementConfig);
      break;
    case 'textbox':
      element = blessed.textbox(elementConfig);
      break;
    default:
      element = blessed.box(elementConfig);
  }
  
  return element;
}

/**
 * Sets up common event handlers for blessed elements
 */
export function setupBaseEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Focus and blur events
  if (props.handleFocus || props.onFocus) {
    element.on('focus', () => {
      // Call the internal focus handler if provided
      if (props.handleFocus && typeof props.handleFocus === 'function') {
        props.handleFocus();
      }
      
      // Call the external focus event if provided
      if (props.onFocus && typeof props.onFocus === 'function') {
        props.onFocus();
      }
      
      // Ensure the screen renders
      element.screen.render();
    });
  }
  
  if (props.handleBlur || props.onBlur) {
    element.on('blur', () => {
      // Call the internal blur handler if provided
      if (props.handleBlur && typeof props.handleBlur === 'function') {
        props.handleBlur();
      }
      
      // Call the external blur event if provided
      if (props.onBlur && typeof props.onBlur === 'function') {
        props.onBlur();
      }
      
      // Ensure the screen renders
      element.screen.render();
    });
  }
  
  // Click event
  if (props.onClick && typeof props.onClick === 'function') {
    element.on('click', props.onClick);
  }
}

/**
 * Updates element properties excluding special properties
 */
export function updateBaseProps(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>,
  excludedProps: string[] = []
): void {
  // Combine common excluded props with component-specific ones
  const allExcludedProps = [...COMMON_EXCLUDED_PROPS, ...excludedProps];
  
  // Update element properties
  for (const [key, value] of Object.entries(props)) {
    if (!allExcludedProps.includes(key)) {
      (element as any)[key] = value;
    }
  }
}

/**
 * Gets a theme color with fallback
 */
export function getThemeColor(
  colorPath: string, 
  fallback: string = 'white'
): string {
  const theme = getTheme();
  const parts = colorPath.split('.');
  
  let current: any = theme;
  for (const part of parts) {
    if (current && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }
  
  return current || fallback;
}