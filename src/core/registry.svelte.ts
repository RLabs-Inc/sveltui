/**
 * Component Registry for SvelTUI
 *
 * This file manages the registration and retrieval of component definitions.
 * Each component is registered with create/update methods and default props.
 */

import * as blessed from "blessed";

// Import component adapters
import {
  createBox,
  updateBox,
  boxDefaultProps,
} from "../components/ui/adapters/display/box-adapter.svelte";
import {
  createText,
  updateText,
  textDefaultProps,
} from "../components/ui/adapters/display/text-adapter.svelte";
import {
  createInput,
  updateInput,
  inputDefaultProps,
} from "../components/ui/adapters/input/input-adapter.svelte";
import {
  createList,
  updateList,
  listDefaultProps,
} from "../components/ui/adapters/container/list-adapter.svelte";
import {
  createCheckbox,
  updateCheckbox,
  checkboxDefaultProps,
} from "../components/ui/adapters/input/checkbox-adapter.svelte";

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

/**
 * Register a component type
 */
export function registerComponent(
  name: string,
  definition: ComponentDefinition
): void {
  registry.set(name.toLowerCase(), definition);
}

/**
 * Get a component definition
 */
export function getComponentDefinition(
  name: string
): ComponentDefinition | undefined {
  return registry.get(name.toLowerCase());
}

/**
 * Initialize built-in components
 */
export function initializeRegistry(): void {
  // Register Box component
  registerComponent("box", {
    create: createBox,
    update: updateBox,
    defaultProps: boxDefaultProps,
  });

  // Register Text component
  registerComponent("text", {
    create: createText,
    update: updateText,
    defaultProps: textDefaultProps,
  });

  // Register Input component
  registerComponent("input", {
    create: createInput,
    update: updateInput,
    defaultProps: inputDefaultProps,
  });

  // Register List component
  registerComponent("list", {
    create: createList,
    update: updateList,
    defaultProps: listDefaultProps,
  });

  // Register Checkbox component
  registerComponent("checkbox", {
    create: createCheckbox,
    update: updateCheckbox,
    defaultProps: checkboxDefaultProps,
  });
}
