import * as blessed from "blessed";

// Create a blessed element based on type and props
export function createBlessedElement(
  elementType: string,
  props: Record<string, any>,
  parent?: blessed.Widgets.BlessedElement
): blessed.Widgets.BlessedElement {
  let element: blessed.Widgets.BlessedElement;

  switch (elementType.toLowerCase()) {
    case "box":
      element = blessed.box({
        ...mapProps(props),
        parent,
      });
      break;
    case "text":
      element = blessed.text({
        ...mapProps(props),
        parent,
        content: props.content || "",
      });
      break;
    case "list":
      // Completely separate approach to ensure items are only included once
      // Create a clean configuration with minimal properties
      element = blessed.list({
        parent,
        // Explicitly set items from props
        items: props.items || [],
        // Basic required properties
        keys: true,
        mouse: true,
        // Selection
        selected: props.selected !== undefined ? props.selected : (props.selectedIndex || 0),
        // Visual styling
        border: props.border,
        width: props.width,
        height: props.height,
        top: props.top,
        left: props.left,
        style: props.style || {
          selected: {
            bg: "blue",
            fg: "white",
          }
        },
      });

      if (props.onSelect) {
        // Only attach one select handler
        element.on("select", (item, index) => {
          props.onSelect(item, index);
        });
      }
      
      // Remove custom key handlers since they're causing double navigation
      break;
    case "input":
      element = blessed.textbox({
        ...mapProps(props),
        parent,
        inputOnFocus: true,
        keys: true,
        mouse: true,
        // Prevent input from capturing all keypresses
        censor: false,
        Secret: false,
      });

      if (props.onChange) {
        // Use input event instead of keypress to avoid double triggers
        element.on("input", (value) => {
          props.onChange(value);
        });
      }

      if (props.onSubmit) {
        element.on("submit", (value) => {
          props.onSubmit(value);
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

      if (props.value) {
        (element as any).setValue(props.value);
      }
      break;
    default:
      element = blessed.box({
        ...mapProps(props),
        parent,
        content: `[${elementType}]`,
      });
  }

  // Handle event attachments
  setupEventHandlers(element, props);

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
  const mappedProps = mapProps(props);

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
  setupEventHandlers(element, props);
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
