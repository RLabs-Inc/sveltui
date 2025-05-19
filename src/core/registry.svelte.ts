import * as blessed from "blessed";

// Component definition type
export interface ComponentDefinition {
  create: (
    props: Record<string, any>,
    parent?: blessed.Widgets.Node
  ) => blessed.Widgets.BlessedElement;
  update: (
    element: blessed.Widgets.BlessedElement,
    props: Record<string, any>
  ) => void;
  defaultProps: Record<string, any>;
}

// Registry of component definitions
// Using normal Map instead of $state since this is static configuration
let registry = new Map<string, ComponentDefinition>();

// Register a component type
export function registerComponent(
  name: string,
  definition: ComponentDefinition
): void {
  registry.set(name.toLowerCase(), definition);
}

// Get a component definition
export function getComponentDefinition(
  name: string
): ComponentDefinition | undefined {
  return registry.get(name.toLowerCase());
}

// Initialize built-in components
export function initializeRegistry(): void {
  // Register Box component
  registerComponent("box", {
    create: (props, parent) =>
      blessed.box({
        ...props,
        parent: parent as blessed.Widgets.Node,
      }),
    update: (element, props) => {
      if (props.content && "setContent" in element) {
        (element as any).setContent(props.content);
      }

      // Update other properties
      for (const [key, value] of Object.entries(props)) {
        if (key !== "content" && key !== "parent") {
          (element as any)[key] = value;
        }
      }
    },
    defaultProps: {
      width: "100%",
      height: "100%",
    },
  });

  // Register Text component
  registerComponent("text", {
    create: (props, parent) =>
      blessed.text({
        ...props,
        parent: parent as blessed.Widgets.Node,
      }),
    update: (element, props) => {
      if (props.content && "setContent" in element) {
        (element as any).setContent(props.content);
      }

      // Update other properties
      for (const [key, value] of Object.entries(props)) {
        if (key !== "content" && key !== "parent") {
          (element as any)[key] = value;
        }
      }
    },
    defaultProps: {
      width: "shrink",
      height: "shrink",
    },
  });

  // Register Input component
  registerComponent("input", {
    create: (props, parent) =>
      blessed.textbox({
        ...props,
        parent: parent as blessed.Widgets.Node,
        inputOnFocus: true,
      }),
    update: (element, props) => {
      // Special handling for value
      if ("value" in props && "setValue" in element) {
        (element as any).setValue(props.value);
      }

      // Update other properties
      for (const [key, value] of Object.entries(props)) {
        if (key !== "value" && key !== "parent") {
          (element as any)[key] = value;
        }
      }
    },
    defaultProps: {
      width: "50%",
      height: 3,
      border: { type: "line" },
    },
  });

  // Register List component
  registerComponent("list", {
    create: (props, parent) =>
      blessed.list({
        ...props,
        parent: parent as blessed.Widgets.Node,
        items: props.items || [],
        selected: props.selectedIndex || 0,
        keys: true,
        vi: true,
        style: {
          selected: {
            bg: "blue",
            fg: "white",
          },
          ...(props.style || {}),
        },
      }),
    update: (element, props) => {
      // Update items
      if (props.items && "setItems" in element) {
        (element as any).setItems(props.items);
      }

      // Update selection
      if ("selectedIndex" in props && "select" in element) {
        (element as any).select(props.selectedIndex);
      }

      // Update other properties
      for (const [key, value] of Object.entries(props)) {
        if (!["items", "selectedIndex", "parent"].includes(key)) {
          (element as any)[key] = value;
        }
      }
    },
    defaultProps: {
      width: "50%",
      height: "50%",
      border: true,
    },
  });
}
