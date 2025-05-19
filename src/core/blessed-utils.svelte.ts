import * as blessed from "blessed";
import { applyThemeToProps } from "./theme-manager";

// Create a blessed element based on type and props
export function createBlessedElement(
  elementType: string,
  props: Record<string, any>,
  parent?: blessed.Widgets.BlessedElement
): blessed.Widgets.BlessedElement {
  let element: blessed.Widgets.BlessedElement;

  // Apply theme to props before creating the element
  const themedProps = applyThemeToProps(elementType, props);
  
  switch (elementType.toLowerCase()) {
    case "box":
      element = blessed.box({
        ...mapProps(themedProps),
        parent,
      });
      break;
    case "text":
      element = blessed.text({
        ...mapProps(themedProps),
        parent,
        content: themedProps.content || "",
      });
      break;
    case "list":
      // Apply themed props to list component
      element = blessed.list({
        parent,
        // Explicitly set items from props
        items: themedProps.items || [],
        // Basic required properties
        keys: true,
        mouse: true,
        // Selection
        selected: themedProps.selected !== undefined ? themedProps.selected : (themedProps.selectedIndex || 0),
        // Visual styling
        border: themedProps.border,
        width: themedProps.width,
        height: themedProps.height,
        top: themedProps.top,
        left: themedProps.left,
        style: themedProps.style || {
          selected: {
            bg: "blue",
            fg: "white",
          }
        },
      });

      if (themedProps.onSelect) {
        // Only attach one select handler - use select item event
        element.on("select item", (item, index) => {
          // The item might be a complex object, so pass the index
          // and let the handler get the correct item from its array
          themedProps.onSelect(item, index);
        });
      }
      
      // Remove custom key handlers since they're causing double navigation
      break;
    case "input":
      element = blessed.textbox({
        ...mapProps(themedProps),
        parent,
        inputOnFocus: true,
        keys: true,
        mouse: true,
        // Prevent input from capturing all keypresses
        censor: false,
        Secret: false,
      });

      if (themedProps.onChange) {
        // Use input event instead of keypress to avoid double triggers
        element.on("input", (value) => {
          themedProps.onChange(value);
        });
      }

      if (themedProps.onSubmit) {
        element.on("submit", (value) => {
          themedProps.onSubmit(value);
        });
      }
      
      // Configure special keys
      element.key(["escape"], (ch, key) => {
        // Blur on escape
        element.screen.focused = null;
        if (key.name === 'escape') {
          // Force blur
          element.screen.render();
        }
      });

      if (themedProps.value) {
        (element as any).setValue(themedProps.value);
      }
      break;
    default:
      element = blessed.box({
        ...mapProps(themedProps),
        parent,
        content: `[${elementType}]`,
      });
  }

  // Handle event attachments
  setupEventHandlers(element, themedProps);

  return element;
}

// Map Svelte props to blessed props
function mapProps(props: Record<string, any>): Record<string, any> {
  const { children, onSelect, onChange, onSubmit, onClick, ...blessedProps } =
    props;

  // Handle special props
  const mappedProps: Record<string, any> = {};
  const style: Record<string, any> = blessedProps.style || {};

  for (const [key, value] of Object.entries(blessedProps)) {
    if (key === "color") {
      style.fg = value;
    } else if (key === "backgroundColor") {
      style.bg = value;
    } else if (key === "border" && value === true) {
      mappedProps.border = { type: "line" };
    } else {
      mappedProps[key] = value;
    }
  }

  if (Object.keys(style).length > 0) {
    mappedProps.style = style;
  }

  return mappedProps;
}

// Update an element with new props
export function updateBlessedElement(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Apply theme to props before updating
  const themedProps = applyThemeToProps(element.type, props);
  const mappedProps = mapProps(themedProps);

  // Apply changes
  for (const [key, value] of Object.entries(mappedProps)) {
    if (key === "style") {
      Object.assign(element.style || {}, value);
    } else if (key === "content" && "setContent" in element) {
      (element as any).setContent(value);
    } else if (key === "value" && "setValue" in element) {
      (element as any).setValue(value);
    } else if (key === "items" && "setItems" in element) {
      (element as any).setItems(value);
    } else if ((key === "selectedIndex" || key === "selected") && "select" in element) {
      (element as any).select(value);
    } else if (key !== "parent") {
      (element as any)[key] = value;
    }
  }

  // Update event handlers
  setupEventHandlers(element, themedProps);
}

// Set up event handlers for an element
function setupEventHandlers(
  element: blessed.Widgets.BlessedElement,
  props: Record<string, any>
): void {
  // Handle click events
  if (props.onClick && !element.listeners("click")?.includes(props.onClick)) {
    // Remove previous handlers to avoid duplicates
    element.removeAllListeners("click");
    element.on("click", props.onClick);
  }
}
