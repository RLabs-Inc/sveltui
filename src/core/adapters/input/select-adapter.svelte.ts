/**
 * Select Adapter for SveltUI
 * 
 * This adapter connects the Select Svelte component to blessed's implementation.
 * It handles the creation, event binding, and updating of select elements.
 */

import * as blessed from 'blessed';
import { getTheme } from '../../theme-manager';
import { 
  createBaseElement, 
  setupBaseEvents, 
  updateBaseProps,
  getThemeColor 
} from '../base-adapter.svelte';
import { normalizeOptions } from '../../component-utils';

// Select-specific excluded props
const SELECT_EXCLUDED_PROPS = [
  'options',
  'value',
  'open',
  'placeholder',
  'focusedIndex',
  'onChange',
  'onOpen',
  'onClose',
  'handleKeyNavigation'
];

/**
 * Create a select blessed element
 */
export function createSelect(
  props: Record<string, any>,
  parent?: blessed.Widgets.Node
): blessed.Widgets.BlessedElement {
  // Create a container box for the select
  const container = createBaseElement(
    props,
    { type: 'box', parent, interactive: true }
  );
  
  // Set up select-specific events
  setupSelectEvents(container, props);
  
  // Set up base events
  setupBaseEvents(container, props);
  
  // Initial display update
  updateSelectDisplay(container, props);
  
  // Create dropdown if open
  if (props.open) {
    createDropdown(container, props);
  }
  
  return container;
}

/**
 * Set up select-specific event handlers
 */
function setupSelectEvents(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Handle key events
  element.on("keypress", (ch, key) => {
    if (!key) return;
    
    const keyName = key.name || "";
    
    // Skip tab handling - let parent handle it
    if (keyName === "tab") return;
    
    // Try to use the component's handler if provided
    if (
      props.handleKeyNavigation &&
      typeof props.handleKeyNavigation === "function"
    ) {
      if (props.handleKeyNavigation(keyName)) {
        // If the dropdown exists and is open, update its selection
        if ((element as any).dropdown && props.open && typeof props.focusedIndex === 'number') {
          (element as any).dropdown.select(props.focusedIndex);
        }
        
        // Update the display
        updateSelectDisplay(element, props);
        element.screen.render();
      }
    } else {
      // Default handling for enter/space/return
      if (["enter", "return", "space"].includes(keyName)) {
        props.open = !props.open;
        
        if (props.open) {
          if (props.onOpen) props.onOpen();
          createDropdown(element, props);
        } else {
          if (props.onClose) props.onClose();
          removeDropdown(element);
        }
        
        updateSelectDisplay(element, props);
        element.screen.render();
      }
    }
  });
}

/**
 * Create the dropdown list
 */
function createDropdown(
  container: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Normalize options
  const options = normalizeOptions(props.options || []);
  
  // Calculate dropdown height
  const dropdownHeight = Math.min(
    props.maxHeight || 10,
    options.length + 2
  );
  
  // Get theme colors
  const theme = getTheme();
  
  // Create the dropdown list
  const dropdown = blessed.list({
    parent: container,
    top: 1,
    left: 1,
    right: 1,
    height: dropdownHeight - 1,
    items: options.map((o) => o.label),
    selected: typeof props.focusedIndex === 'number' 
      ? props.focusedIndex 
      : options.findIndex((o) => o.value === props.value),
    style: {
      selected: {
        bg: theme.colors.primary || "blue",
        fg: theme.colors.foreground || "white",
      },
      ...(props.style || {}),
    },
    keys: false,  // We handle keys at the container level
    mouse: true
  });
  
  // Handle mouse selection
  dropdown.on("select item", (_, index) => {
    if (index !== undefined && index >= 0 && index < options.length) {
      const selectedOption = options[index];
      
      if (props.onChange) {
        props.onChange(selectedOption.value);
      }
      
      props.value = selectedOption.value;
      props.open = false;
      
      if (props.onClose) {
        props.onClose();
      }
      
      removeDropdown(container);
      updateSelectDisplay(container, props);
      container.screen.render();
    }
  });
  
  // Attach the dropdown as a property for updates
  (container as any).dropdown = dropdown;
}

/**
 * Remove the dropdown list
 */
function removeDropdown(container: blessed.Widgets.BlessedElement): void {
  if ((container as any).dropdown) {
    (container as any).dropdown.destroy();
    delete (container as any).dropdown;
  }
}

/**
 * Update the display of a select element
 */
export function updateSelectDisplay(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Normalize options
  const options = normalizeOptions(props.options || []);
  
  // Calculate display label
  const displayLabel =
    (props.value
      ? options.find((o) => o.value === props.value)?.label
      : props.placeholder) || "Select an option...";
  
  // Get theme colors for styling
  const theme = getTheme();
  const primaryColor = theme?.colors?.primary || "blue";
  
  // Determine if the element is currently focused
  const isFocused = props.isFocused === true || element.focused;
  
  // Format the display with proper styling based on state
  const arrow = props.open ? "▼" : "▶";
  let content;
  
  if (isFocused) {
    content = `{${primaryColor}-fg}${arrow}{/${primaryColor}-fg} ${displayLabel}`;
  } else {
    content = `${arrow} ${displayLabel}`;
  }
  
  // Update the content
  element.setContent(content);
  
  // Update dropdown height based on open state
  if (props.open) {
    const height = Math.min(
      props.maxHeight || 10,
      options.length + 2
    );
    element.height = height;
  } else {
    element.height = props.height || 3;
  }
}

/**
 * Update a select element with new props
 */
export function updateSelect(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Update the display
  updateSelectDisplay(element, props);
  
  // Handle dropdown state changes
  if (props.open) {
    if (!(element as any).dropdown) {
      createDropdown(element, props);
    } else {
      // Update existing dropdown
      updateDropdown(element, props);
    }
  } else if ((element as any).dropdown) {
    removeDropdown(element);
  }
  
  // Update other properties
  updateBaseProps(element, props, SELECT_EXCLUDED_PROPS);
}

/**
 * Update the dropdown list
 */
function updateDropdown(
  container: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  if (!(container as any).dropdown) return;
  
  // Normalize options
  const options = normalizeOptions(props.options || []);
  
  // Update items
  (container as any).dropdown.setItems(options.map((o) => o.label));
  
  // Update selection
  const selectedIndex = typeof props.focusedIndex === 'number' && props.open 
    ? props.focusedIndex
    : options.findIndex((o) => o.value === props.value);
    
  (container as any).dropdown.select(selectedIndex);
}

/**
 * Default select props
 */
export const selectDefaultProps = {
  options: [],
  value: '',
  placeholder: 'Select an option...',
  open: false,
  width: '50%',
  height: 3,
  maxHeight: 10,
  border: true
};