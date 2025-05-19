/**
 * List Adapter for SveltUI
 * 
 * This adapter connects the List Svelte component to blessed's implementation.
 * It handles the creation, event binding, and updating of list elements.
 */

import * as blessed from 'blessed';
import { getTheme } from '../../theme-manager';
import { 
  createBaseElement, 
  setupBaseEvents, 
  updateBaseProps 
} from '../base-adapter.svelte';

// List-specific excluded props
const LIST_EXCLUDED_PROPS = [
  'items',
  'selectedIndex',
  'onSelect'
];

/**
 * Create a list blessed element
 */
export function createList(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Prepare style for the list
  const style = props.style || {};
  
  // Ensure selected style is set with theme colors
  if (!style.selected) {
    const theme = getTheme();
    style.selected = {
      bg: theme.colors.primary || 'blue',
      fg: 'white'
    };
  }
  
  // Create the list element
  const list = createBaseElement(
    {
      ...props,
      style,
      items: props.items || [],
      selected: props.selectedIndex || 0,
      keys: true, // Enable keyboard navigation
      vi: true,   // Enable vi-style navigation (h,j,k,l)
      mouse: true // Enable mouse support
    },
    { type: 'list', parent, interactive: true }
  );
  
  // Set up list-specific events
  setupListEvents(list, props);
  
  // Set up base events
  setupBaseEvents(list, props);
  
  return list;
}

/**
 * Set up list-specific event handlers
 */
function setupListEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Handle item selection
  if (props.onSelect) {
    element.on('select item', (item, index) => {
      // The item might need conversion to string
      const itemValue = typeof item === 'string' ? item : String(item);
      props.onSelect(index, itemValue);
    });
  }
  
  // Handle selection change
  element.on('select', () => {
    // Update the selectedIndex if it's a bindable prop
    if ('selectedIndex' in props && typeof props.selectedIndex !== 'undefined') {
      props.selectedIndex = (element as any).selected;
    }
  });
}

/**
 * Update a list element with new props
 */
export function updateList(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update items if provided
  if (props.items && 'setItems' in element) {
    (element as any).setItems(props.items);
  }
  
  // Update selection if provided
  if ('selectedIndex' in props && 'select' in element) {
    (element as any).select(props.selectedIndex);
  }
  
  // Update other properties
  updateBaseProps(element, props, LIST_EXCLUDED_PROPS);
}

/**
 * Default list props
 */
export const listDefaultProps = {
  items: [],
  selectedIndex: 0,
  width: '50%',
  height: '50%',
  border: true
};