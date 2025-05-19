import * as blessed from "blessed";
import type { ComponentInstance } from "./types";

// Component registry - using Svelte's runes for reactivity
let components = $state(new Map<string, ComponentInstance>());
let componentIdCounter = $state(0);

// Create a unique ID for component tracking
export function generateComponentId(): string {
  componentIdCounter++;
  return `sveltui-${componentIdCounter}`;
}

// Track a component instance
export function trackComponent(
  element: blessed.Widgets.BlessedElement,
  type: string, 
  initialProps: Record<string, any>
): ComponentInstance {
  const id = generateComponentId();
  
  // Create separate reactive variables for props
  let props = $state(initialProps);
  let children = $state([] as ComponentInstance[]);

  // Create instance with references to the reactive variables
  const instance: ComponentInstance = {
    id,
    type,
    element,
    get props() { return props; },
    set props(newProps) { props = newProps; },
    get children() { return children; },
    set children(newChildren) { children = newChildren; }
  };

  // Store the component in the registry
  components.set(id, instance);

  // Set up automatic cleanup when component is destroyed
  $effect.root(() => {
    // This effect will be bound to the component's lifecycle
    return () => {
      // Remove from registry when destroyed
      components.delete(id);

      // Destroy the element if it still exists
      if (element && !element.destroy) {
        element.destroy();
      }
    };
  });

  return instance;
}

// Set up initial component state
export function setupComponentUpdates(
  instance: ComponentInstance,
  updateFn: (
    element: blessed.Widgets.BlessedElement,
    props: Record<string, any>
  ) => void
): void {
  // Simply run the initial update
  updateFn(instance.element, instance.props);
  
  // We'll handle updates directly when props change
  // This is more direct than using reactive effects
}

// Get a component by id
export function getComponent(id: string): ComponentInstance | undefined {
  return components.get(id);
}

// Find components by type
export function findComponentsByType(type: string): ComponentInstance[] {
  return Array.from(components.values()).filter(
    (component) => component.type.toLowerCase() === type.toLowerCase()
  );
}
