/**
 * Checkbox Adapter for SveltUI
 * 
 * This adapter connects the Checkbox Svelte component to blessed's implementation.
 * It handles the creation, event binding, and updating of checkbox elements.
 */

import * as blessed from 'blessed';
import { getTheme } from '../../theme-manager';
import { 
  createBaseElement, 
  setupBaseEvents, 
  updateBaseProps,
  getThemeColor
} from '../base-adapter.svelte';

// Checkbox-specific excluded props
const CHECKBOX_EXCLUDED_PROPS = [
  'checked',
  'indeterminate',
  'label',
  'disabled'
];

/**
 * Create a checkbox blessed element
 */
export function createCheckbox(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create a text element with checkbox visuals
  const checkbox = createBaseElement(
    props,
    { type: 'text', parent, interactive: true }
  );
  
  // Set up checkbox-specific events
  setupCheckboxEvents(checkbox, props);
  
  // Set up base events (focus, blur, click)
  setupBaseEvents(checkbox, props);
  
  // Initialize the display
  updateCheckboxDisplay(checkbox, props);
  
  return checkbox;
}

/**
 * Set up checkbox-specific event handlers
 */
function setupCheckboxEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Handle standard key events using blessed's built-in key handling
  element.key(['space', 'enter', 'return'], (ch, key) => {
    if (props.disabled) return;
    
    // Use custom handler if provided
    if (props.handleKeyNavigation && typeof props.handleKeyNavigation === 'function') {
      if (props.handleKeyNavigation(key.name)) {
        updateCheckboxDisplay(element, props);
        element.screen.render();
        return;
      }
    }
    
    // Default handling for toggling the checkbox
    toggleCheckbox(props);
    
    if (props.onChange) {
      props.onChange(props.checked);
    }
    
    updateCheckboxDisplay(element, props);
    element.screen.render();
  });
  
  // Handle mouse events (click to toggle)
  element.on("click", () => {
    if (props.disabled) return;
    
    toggleCheckbox(props);
    
    if (props.onChange) {
      props.onChange(props.checked);
    }
    
    updateCheckboxDisplay(element, props);
    element.screen.render();
  });
}

/**
 * Toggle checkbox state
 */
export function toggleCheckbox(props: Record<string, any>): void {
  if (props.disabled) return;
  
  if (props.indeterminate) {
    props.indeterminate = false;
    props.checked = true;
  } else {
    props.checked = !props.checked;
  }
}

/**
 * Update the display of a checkbox element
 */
export function updateCheckboxDisplay(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  const isIndeterminate = props.indeterminate === true;
  const isChecked = props.checked === true;
  const isFocused = props.isFocused === true || element.focused;
  const isDisabled = props.disabled === true;
  
  // Get theme colors
  const theme = getTheme();
  const primaryColor = theme?.colors?.primary || "blue";
  
  // Determine the checkbox symbol based on state
  let symbol;
  if (isIndeterminate) {
    symbol = "[-]"; // Indeterminate state
  } else if (isChecked) {
    symbol = "[x]"; // Checked state
  } else {
    symbol = "[ ]"; // Unchecked state
  }
  
  // Apply styling based on state
  let displayText = symbol;
  
  // Add focus indicator
  if (isFocused && !isDisabled) {
    displayText = `{${primaryColor}-fg}${displayText}{/${primaryColor}-fg}`;
  }
  
  // Add disabled styling
  if (isDisabled) {
    displayText = `{gray-fg}${displayText}{/gray-fg}`;
  }
  
  // Add label if provided
  if (props.label) {
    const labelText = isDisabled
      ? `{gray-fg}${props.label}{/gray-fg}`
      : props.label;
    displayText = `${displayText} ${labelText}`;
  }
  
  // Update the content
  element.setContent(displayText);
}

/**
 * Update a checkbox element with new props
 */
export function updateCheckbox(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update the display
  updateCheckboxDisplay(element, props);
  
  // Update other properties
  updateBaseProps(element, props, CHECKBOX_EXCLUDED_PROPS);
}

/**
 * Default checkbox props
 */
export const checkboxDefaultProps = {
  checked: false,
  indeterminate: false,
  disabled: false,
  width: "100%",
  height: 1,
};